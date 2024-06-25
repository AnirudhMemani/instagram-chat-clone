import WebSocket from "ws";
import redis from "../redis/client.js";
import { prisma } from "@instachat/db/client";
import { Redis } from "ioredis";
import {
    FIND_USERS,
    GET_DM,
    NEW_MESSAGE,
    ROOM_EXISTS,
    CREATE_GROUP,
    CHANGE_GROUP_NAME,
    ERROR,
    SUCCESS,
    LEAVE_GROUP_CHAT,
    MAKE_ADMIN,
    REMOVE_AS_ADMIN,
    CHATROOM_DETAILS_BY_ID,
} from "@instachat/messages/messages";
import { IUser } from "./UserManager.js";
import { getSortedSetKey } from "../utils/helper.js";
import { IMessage, IStartConvoMessage } from "@instachat/messages/types";
import cloudinary from "cloudinary";
import apqp from "amqplib";

/**
 * TODO:
 * Maybe switch to singleton since the scores array is being tracked?
 */

export class InboxManager {
    private redis: Redis = redis;
    private prisma: typeof prisma = prisma;
    private scores: number[] = [];

    async connectUser(user: IUser) {
        this.handleIncomingMessages(user.id, user.socket);
    }

    async getUserInbox(id: string, take: number, skip: number) {
        const cacheKey = getSortedSetKey(id);

        // LRANGE "key" start "stop"
        // Where start and stop are zero-based indexes. The stop index is inclusive, meaning the element at the stop index is included in the result.
        const cachedDMs = await this.redis.lrange(
            cacheKey,
            skip,
            skip + take - 1
        );

        if (cachedDMs.length > 0) {
            return cachedDMs.map((cachedDM) => JSON.parse(cachedDM));
        }

        const Dms = await prisma.directMessage.findMany({
            where: {
                sentTo: {
                    some: {
                        id,
                    },
                },
            },
            select: {
                id: true,
                read: true,
                latestMessage: {
                    select: {
                        content: true,
                        contentType: true,
                        sentAt: true,
                        sentBy: {
                            select: {
                                id: true,
                                fullName: true,
                                profilePic: true,
                            },
                        },
                    },
                },
            },
            orderBy: {
                latestMessage: {
                    sentAt: "desc",
                },
            },
            take,
            skip,
        });

        const stringifiedDms = Dms.map((dm) => JSON.stringify(dm));

        if (stringifiedDms.length > 0) {
            // Push the new messages to the head of the list
            await this.redis.lpush(cacheKey, ...stringifiedDms);
            // Trim the list to keep only the most recent 100 messages
            await this.redis.ltrim(cacheKey, 0, 99);
        }

        return Dms;
    }

    handleNewMessage(message: IMessage) {
        const { chatRoomId, content } = message.payload;

        this.scores.push(this.scores[this.scores.length - 1] + 1);

        redis.publish(chatRoomId, JSON.stringify(content));
    }

    getDMs(socket: WebSocket, id: string, message: IMessage) {
        const DMLimit = message.payload.take;
        const DMOffset = message.payload.skip;
        const DM = this.getUserInbox(id, DMLimit, DMOffset);
        socket.send(
            JSON.stringify({
                type: GET_DM,
                payload: {
                    DM,
                },
            })
        );
    }

    async getUsers(socket: WebSocket, id: string) {
        const users = await prisma.user.findMany({
            where: {
                NOT: { id },
            },
        });
        socket.send(
            JSON.stringify({
                type: FIND_USERS,
                payload: users,
            })
        );
    }

    async handleGroupConvo(socket: WebSocket, id: string, message: IMessage) {
        const selectedUsers = message as IStartConvoMessage;
        const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB
        const participants = selectedUsers.payload.userDetails;
        const groupDetails = selectedUsers.payload.groupDetails;

        const { name, profilePic, pictureName } = groupDetails;

        const fileSize = Buffer.byteLength(profilePic);

        console.log("fileSize:", fileSize);

        if (fileSize > MAX_FILE_SIZE) {
            socket.send(
                JSON.stringify({
                    type: CREATE_GROUP,
                    payload: {
                        error: "Exceeded max file size for group image",
                    },
                })
            );
        }

        const result = await cloudinary.v2.uploader.upload(profilePic, {
            public_id: pictureName,
            upload_preset: process.env.CLOUDINARY_PRESET_NAME,
        });

        const newChatRoom = await prisma.chatRoom.create({
            data: {
                name,
                createdAt: new Date(Date.now()),
                participants: {
                    connect: participants.map((user) => ({
                        id: user.id,
                    })),
                },
                Group: {
                    create: {
                        name,
                        picture: result.secure_url,
                        superAdminId: id,
                        adminOf: { connect: { id } },
                        createdAt: new Date(Date.now()),
                        members: {
                            connect: participants.map((user) => ({
                                id: user.id,
                            })),
                        },
                    },
                },
            },
            include: {
                participants: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                        profilePic: true,
                    },
                },
                Group: {
                    select: {
                        id: true,
                        name: true,
                        picture: true,
                        createdAt: true,
                        chatRoomId: true,
                        adminOf: {
                            select: { id: true },
                        },
                        superAdminId: true,
                    },
                },
            },
        });

        socket.send(
            JSON.stringify({
                type: CREATE_GROUP,
                payload: {
                    chatRoomId: newChatRoom.id,
                    chatRoomName: newChatRoom.name,
                    createdAt: newChatRoom.createdAt,
                    participants: newChatRoom.participants,
                    groupDetails: newChatRoom.Group,
                },
            })
        );
    }

    async checkRoomExists(socket: WebSocket, id: string, message: IMessage) {
        const selectedUsers = message as IStartConvoMessage;
        const participants = selectedUsers.payload.userDetails;
        const isGroup = participants.length > 2;

        const existingChatRoom = await this.prisma.chatRoom.findFirst({
            where: {
                AND: participants.map((user) => ({
                    participants: {
                        some: {
                            id: user.id,
                        },
                    },
                })),
            },
            include: {
                messages: {
                    orderBy: {
                        sentAt: "desc",
                    },
                    select: {
                        id: true,
                        content: true,
                        contentType: true,
                        senderId: true,
                        Attachments: true,
                        readBy: true,
                        editedAt: true,
                        chatRoomId: true,
                        sentAt: true,
                    },
                },
                participants: {
                    select: {
                        id: true,
                        profilePic: true,
                        fullName: true,
                        username: true,
                    },
                },
                Group: {
                    select: {
                        id: true,
                        name: true,
                        picture: true,
                        createdAt: true,
                        chatRoomId: true,
                        adminOf: {
                            select: {
                                id: true,
                            },
                        },
                        superAdminId: true,
                    },
                },
            },
        });

        if (existingChatRoom) {
            const payload = {
                result: "exists",
                chatRoomId: existingChatRoom.id,
                chatRoomName: existingChatRoom.name,
                createdAt: existingChatRoom.createdAt,
                participants: existingChatRoom.participants,
                messageDetails: existingChatRoom.messages || [],
                ...(existingChatRoom.Group && {
                    groupDetails: existingChatRoom.Group,
                }),
            };

            socket.send(
                JSON.stringify({
                    type: ROOM_EXISTS,
                    payload,
                })
            );
        } else {
            if (isGroup) {
                socket.send(
                    JSON.stringify({
                        type: ROOM_EXISTS,
                        payload: {
                            result: "group",
                        },
                    })
                );
            } else {
                const newChatRoom = await prisma.chatRoom.create({
                    data: {
                        name: participants[0].fullName,
                        participants: {
                            connect: participants.map((user) => ({
                                id: user.id,
                            })),
                        },
                    },
                    include: {
                        participants: {
                            select: {
                                id: true,
                                fullName: true,
                                username: true,
                                profilePic: true,
                            },
                        },
                    },
                });
                socket.send(
                    JSON.stringify({
                        type: ROOM_EXISTS,
                        payload: {
                            result: "created",
                            chatRoomId: newChatRoom.id,
                            chatRoomName: newChatRoom.name,
                            createdAt: newChatRoom.createdAt,
                            participants: newChatRoom.participants,
                        },
                    })
                );
            }
        }
    }

    async handleChangeGroupName(
        socket: WebSocket,
        id: string,
        message: IMessage
    ) {
        const updatedGroupName = message.payload.groupName;
        const chatRoomId = message.payload.chatRoomId;

        const isMember =
            (await this.prisma.chatRoom.count({
                where: {
                    AND: [
                        { id: chatRoomId },
                        { Group: { members: { some: { id } } } },
                    ],
                },
            })) > 0;

        if (!isMember) {
            socket.send(
                JSON.stringify({
                    type: CHANGE_GROUP_NAME,
                    payload: {
                        result: ERROR,
                    },
                })
            );
        }

        await this.prisma.chatRoom.update({
            where: { id: chatRoomId },
            data: {
                name: updatedGroupName,
                Group: {
                    update: {
                        name: updatedGroupName,
                    },
                },
            },
            select: {
                name: true,
            },
        });

        socket.send(
            JSON.stringify({
                type: CHANGE_GROUP_NAME,
                payload: {
                    result: SUCCESS,
                    groupName: updatedGroupName,
                },
            })
        );
    }

    async handleLeaveGroupChat(
        socket: WebSocket,
        id: string,
        message: IMessage
    ) {
        const chatRoomId = message.payload.chatRoomId;

        const isSuperAdmin = await this.prisma.group.findFirst({
            where: {
                superAdminId: id,
            },
            select: {
                adminOf: {
                    where: {
                        NOT: {
                            id,
                        },
                    },
                },
            },
        });

        await this.prisma.chatRoom.update({
            where: { id: chatRoomId },
            data: {
                participants: {
                    disconnect: {
                        id,
                    },
                },
                Group: {
                    update: {
                        members: {
                            disconnect: {
                                id,
                            },
                        },
                        adminOf: {
                            disconnect: {
                                id,
                            },
                        },
                        ...(isSuperAdmin
                            ? {
                                  superAdminId:
                                      isSuperAdmin.adminOf[0].id !== id
                                          ? isSuperAdmin.adminOf[0].id
                                          : isSuperAdmin.adminOf[1].id,
                              }
                            : ""),
                    },
                },
            },
        });

        socket.send(
            JSON.stringify({
                type: LEAVE_GROUP_CHAT,
                payload: {
                    result: SUCCESS,
                    userId: id,
                },
            })
        );
    }

    async handleAddAdmin(socket: WebSocket, id: string, message: IMessage) {
        const adminId = message.payload.userId;
        const groupId = message.payload.groupId;

        const memberExists = await this.prisma.group.findFirst({
            where: {
                AND: [
                    { id: groupId },
                    { members: { some: { id: adminId } } },
                    { superAdminId: id },
                ],
            },
            select: {
                id: true,
            },
        });

        if (!memberExists) {
            socket.send(
                JSON.stringify({
                    type: MAKE_ADMIN,
                    payload: {
                        result: ERROR,
                    },
                })
            );
            return;
        }

        const userDetails = await this.prisma.group.update({
            where: { id: groupId },
            data: {
                adminOf: {
                    connect: {
                        id: adminId,
                    },
                },
            },
            include: {
                adminOf: {
                    where: {
                        id: adminId,
                    },
                },
            },
        });

        socket.send(
            JSON.stringify({
                type: MAKE_ADMIN,
                payload: {
                    userDetails,
                },
            })
        );
    }

    async handleRemoveAdmin(socket: WebSocket, id: string, message: IMessage) {
        const adminId = message.payload.userId;
        const groupId = message.payload.groupId;

        const memberExists = await this.prisma.group.findFirst({
            where: {
                AND: [
                    { id: groupId },
                    { members: { some: { id: adminId } } },
                    { superAdminId: id },
                ],
            },
            select: {
                id: true,
            },
        });

        if (!memberExists) {
            socket.send(
                JSON.stringify({
                    type: MAKE_ADMIN,
                    payload: {
                        result: ERROR,
                    },
                })
            );
            return;
        }

        await this.prisma.group.update({
            where: { id: groupId },
            data: {
                adminOf: {
                    disconnect: {
                        id: adminId,
                    },
                },
            },
        });

        socket.send(
            JSON.stringify({
                type: MAKE_ADMIN,
                payload: {
                    adminId,
                },
            })
        );
    }

    async getChatRoomDetails(socket: WebSocket, id: string, message: IMessage) {
        const payload = message.payload;

        const chatRoomDetails = await this.prisma.chatRoom.findFirst({
            where: {
                id: payload.chatRoomId,
                participants: {
                    some: {
                        id: payload.userId,
                    },
                },
            },

            select: {
                id: true,
                name: true,
                createdAt: true,
                participants: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        profilePic: true,
                    },
                },
                messages: {
                    select: {
                        id: true,
                        content: true,
                        contentType: true,
                        senderId: true,
                        sentAt: true,
                        editedAt: true,
                        Attachments: true,
                        readBy: {
                            select: {
                                id: true,
                                username: true,
                                fullName: true,
                                profilePic: true,
                            },
                        },
                        chatRoomId: true,
                    },
                },
                Group: {
                    select: {
                        id: true,
                        name: true,
                        picture: true,
                        createdAt: true,
                        adminOf: {
                            select: {
                                id: true,
                                username: true,
                                fullName: true,
                                profilePic: true,
                            },
                        },
                        superAdminId: true,
                        chatRoomId: true,
                    },
                },
            },
        });

        if (!chatRoomDetails) {
            socket.send(
                JSON.stringify({
                    type: CHATROOM_DETAILS_BY_ID,
                    payload: {
                        error: true,
                    },
                })
            );
            return;
        }

        socket.send(
            JSON.stringify({
                type: CHATROOM_DETAILS_BY_ID,
                payload: {
                    chatRoomDetails,
                    ...(chatRoomDetails.Group && {
                        groupDetails: chatRoomDetails.Group,
                    }),
                },
            })
        );
    }

    async handleIncomingMessages(id: string, socket: WebSocket) {
        console.log("Inside handle incoming request");
        socket.on("message", async (data) => {
            const message = JSON.parse(data.toString());

            switch (message.type) {
                case GET_DM:
                    this.getDMs(socket, id, message);
                    break;
                case FIND_USERS:
                    this.getUsers(socket, id);
                    break;
                case ROOM_EXISTS:
                    this.checkRoomExists(socket, id, message);
                    break;
                case CHATROOM_DETAILS_BY_ID:
                    this.getChatRoomDetails(socket, id, message);
                    break;
                case CREATE_GROUP:
                    this.handleGroupConvo(socket, id, message);
                    break;
                case NEW_MESSAGE:
                    this.handleNewMessage(message);
                    break;
                case CHANGE_GROUP_NAME:
                    this.handleChangeGroupName(socket, id, message);
                    break;
                case LEAVE_GROUP_CHAT:
                    this.handleLeaveGroupChat(socket, id, message);
                    break;
                case MAKE_ADMIN:
                    this.handleAddAdmin(socket, id, message);
                    break;
                case REMOVE_AS_ADMIN:
                    this.handleRemoveAdmin(socket, id, message);
                    break;
                default:
                    break;
            }
        });
    }
}
