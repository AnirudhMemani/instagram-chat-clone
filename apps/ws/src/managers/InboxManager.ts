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
} from "@instachat/messages/messages";
import { IUser } from "./UserManager.js";
import { getSortedSetKey } from "../utils/helper.js";
import { IMessage, IStartConvoMessage } from "@instachat/messages/types";
import fs from "fs/promises";
import { mkdir } from "fs";

/**
 * TODO:
 * Maybe switch to singleton since the scores array is being tracked?
 */

export class InboxManager {
    private redis: Redis = redis;
    private prisma: typeof prisma = prisma;
    private scores: number[] = [];

    async connectUser(user: IUser) {
        await this.redis.set(user.id, JSON.stringify(user));
        this.handleIncomingMessages(user.id, user.socket);
    }

    async getUserInbox(id: string, take: number, skip: number) {
        const cacheKey = getSortedSetKey(id);

        const cachedDMs = await this.redis.zrangebyscore(
            cacheKey,
            "-inf",
            "+inf",
            "LIMIT",
            skip,
            take
        );

        if (cachedDMs.length > 0) {
            return cachedDMs.map((dm) => JSON.parse(dm));
        }

        const dms = await this.prisma.directMessage.findMany({
            where: { sentTo: { some: { id } } },
            select: {
                id: true,
                latestMessage: {
                    select: {
                        id: true,
                        content: true,
                        sentAt: true,
                        contentType: true,
                    },
                },
            },
            orderBy: { latestMessage: { sentAt: "desc" } },
        });

        if (dms.length > 0) {
            this.scores = dms.map((_, index) => index);
            await this.redis.zadd(
                cacheKey,
                ...this.scores.map((score) => JSON.stringify({ ...dms, score }))
            );
        }
        return dms;
    }

    handleNewMessage(message: IMessage) {
        const { chatRoomId, content } = message.payload;

        this.scores.push(this.scores[this.scores.length - 1] + 1);

        redis.publish(chatRoomId, JSON.stringify(content));
    }

    getDMs(socket: WebSocket, id: string, message: IMessage) {
        const DMLimit = message.payload.take;
        const DMOffset = message.payload.skip;
        const inbox = this.getUserInbox(id, DMLimit, DMOffset);
        socket.send(
            JSON.stringify({
                type: GET_DM,
                payload: inbox,
            })
        );
    }

    async getUsers(socket: WebSocket, id: string) {
        const users = await prisma.user.findMany({
            where: {
                NOT: { id },
            },
        });
        console.log("users", users);
        socket.send(
            JSON.stringify({
                type: FIND_USERS,
                payload: users,
            })
        );
    }

    async handleGroupConvo(socket: WebSocket, id: string, message: IMessage) {
        const selectedUsers = message as IStartConvoMessage;
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
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

        const decodedImage = Buffer.from(profilePic, "base64");

        await fs.mkdir("src/pictures", { recursive: true });
        const groupProfilePic = `src/pictures/${crypto.randomUUID()}~${pictureName}`;
        await fs.writeFile(groupProfilePic, decodedImage);

        participants.push({ fullName: "", id });

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
                        picture: groupProfilePic,
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
        const isGroup = participants.length > 1;

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
                    ...(isGroup
                        ? {
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
                          }
                        : {}),
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
                participants.push({ id, fullName: "" });
                const newChatRoom = await prisma.chatRoom.create({
                    data: {
                        name: participants[0].fullName,
                        createdAt: new Date(Date.now()),
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

    async handleIncomingMessages(id: string, socket: WebSocket) {
        console.log("Inside handle incoming request");
        socket.on("message", async (data) => {
            console.log("on message");
            const message = JSON.parse(data.toString());
            console.log("message", message);

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
                case CREATE_GROUP:
                    this.handleGroupConvo(socket, id, message);
                    break;
                case NEW_MESSAGE:
                    this.handleNewMessage(message);
                    break;
                default:
                    break;
            }
        });
    }
}