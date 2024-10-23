import { SocketResponse } from "@instachat/common/common";
import { prisma } from "@instachat/db/client";
import {
    ADD_TO_CHAT,
    CHANGE_GROUP_NAME,
    CHATROOM_DETAILS_BY_ID,
    CREATE_GROUP,
    FIND_CHATS,
    GET_INBOX,
    LEAVE_GROUP_CHAT,
    MAKE_ADMIN,
    MESSAGE_QUEUE,
    NEW_MESSAGE,
    REMOVE_AS_ADMIN,
    REMOVE_FROM_CHAT,
    ROOM_EXISTS,
    SUCCESS,
    TRANSFER_SUPER_ADMIN,
} from "@instachat/messages/messages";
import {
    IGetChatRoomById,
    ILeaveGroupChat,
    IMessage,
    IRoomExistsRequest,
    ITransferSuperAdminAndLeaveGroupChat,
    IUpdateChatRoomName,
} from "@instachat/messages/types";
import amqp from "amqplib";
import cloudinary from "cloudinary";
import { Redis } from "ioredis";
import WebSocket from "ws";
import redis from "../redis/client.js";
import { STATUS_CODE } from "../utils/constants.js";
import { getSortedSetKey } from "../utils/helper.js";
import { printlogs } from "../utils/logs.js";
import { IUser } from "./UserManager.js";

/**
 * TODO:
 * Maybe switch to singleton since the scores array is being tracked?
 */

export class InboxManager {
    private redis: Redis = redis;
    private prisma: typeof prisma = prisma;
    private subscriber: Redis = redis.duplicate();
    private res: SocketResponse;

    constructor(socket: WebSocket) {
        this.res = new SocketResponse(socket);
    }

    async connectUser(user: IUser) {
        this.handleIncomingMessages(user.id, user.socket);
    }

    async getLatestMessages(id: string, take: number, skip: number) {
        const cacheKey = getSortedSetKey(id);

        // LRANGE "key" start "stop"
        // Where start and stop are zero-based indexes. The stop index is inclusive, meaning the element at the stop index is included in the result.
        const cachedDMs = await this.redis.lrange(cacheKey, skip, skip + take - 1);

        if (cachedDMs.length > 0) {
            return cachedDMs.map((cachedDM: any) => JSON.parse(cachedDM));
        }

        const userMessages = await this.prisma.chatRoom.findMany({
            where: {
                participants: {
                    some: {
                        id,
                    },
                },
            },
            select: {
                id: true,
                picture: true,
                name: true,
                roomType: true,
                latestMessage: {
                    select: {
                        id: true,
                        content: true,
                        readBy: true,
                        senderId: true,
                        sentAt: true,
                    },
                },
                participants: {
                    select: {
                        id: true,
                        username: true,
                        fullName: true,
                        profilePic: true,
                    },
                },
            },
            orderBy: {
                latestMessage: {
                    sentAt: "desc",
                },
            },
        });

        const stringifiedUserMessages = userMessages.map((message) => JSON.stringify(message));

        if (userMessages.length) {
            // Push the new messages to the head of the list
            await this.redis.lpush(cacheKey, ...stringifiedUserMessages);
            // Trim the list to keep only the most recent 50 messages
            await this.redis.ltrim(cacheKey, 0, 49);
        }

        return stringifiedUserMessages;
    }

    async handleNewMessage(socket: WebSocket, message: IMessage) {
        const { chatRoomId, content, senderId } = message.payload;

        if (content.length < 1) {
            socket.send(
                JSON.stringify({
                    type: NEW_MESSAGE,
                    payload: {
                        error: "Invalid message",
                    },
                })
            );
            return;
        }

        const chatRoomExists = await this.prisma.chatRoom.findUnique({
            where: { id: chatRoomId },
        });

        if (!chatRoomExists) {
            socket.send(
                JSON.stringify({
                    type: NEW_MESSAGE,
                    payload: {
                        error: "Chat room does not exists",
                    },
                })
            );
            return;
        }

        // fix this
        const MQServerUrl = "amqp://localhost";

        const conn = await amqp.connect(MQServerUrl);
        const channel = await conn.createChannel();
        await channel.assertQueue(MESSAGE_QUEUE);
        channel.sendToQueue(MESSAGE_QUEUE, message.payload);

        // await redis.publish(chatRoomId, JSON.stringify(content));
    }

    getUserInbox(id: string, message: IMessage) {
        const take = message.payload.take;
        const skip = message.payload.skip;
        const userInbox = this.getLatestMessages(id, take, skip);
        this.res.json(GET_INBOX, { userInbox });
    }

    async getChats(id: string) {
        const users = await prisma.user.findMany({
            where: {
                NOT: { id },
            },
            select: {
                id: true,
                fullName: true,
                username: true,
                profilePic: true,
                email: true,
            },
        });

        const groups = await prisma.chatRoom.findMany({
            where: {
                roomType: "GROUP",
                participants: { some: { id } },
            },
            select: {
                id: true,
                name: true,
                picture: true,
                participants: {
                    select: {
                        id: true,
                        username: true,
                        profilePic: true,
                    },
                },
            },
        });

        const payload = {
            users,
            groups,
        };

        this.res.json(FIND_CHATS, payload);
    }

    async handleGroupConvo(socket: WebSocket, id: string, message: IMessage) {
        const selectedUsers = message as any;
        const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB
        const participants = selectedUsers.payload.userDetails;
        const groupDetails = selectedUsers.payload.groupDetails;

        const { name, profilePic, pictureName } = groupDetails;

        const fileSize = Buffer.byteLength(profilePic);

        printlogs("fileSize:", fileSize);

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
                    connect: participants.map((user: any) => ({
                        id: user.id,
                    })),
                },
                // isGroup: true,
                // Group: {
                //     create: {
                //         name,
                //         picture: result.secure_url,
                //         superAdminId: id,
                //         adminOf: { connect: { id } },
                //         createdAt: new Date(Date.now()),
                //         members: {
                //             connect: participants.map((user: any) => ({
                //                 id: user.id,
                //             })),
                //         },
                //     },
                // },
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
                // Group: {
                //     select: {
                //         id: true,
                //         name: true,
                //         picture: true,
                //         createdAt: true,
                //         chatRoomId: true,
                //         adminOf: {
                //             select: { id: true },
                //         },
                //         superAdminId: true,
                //     },
                // },
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
                    // groupDetails: newChatRoom.Group,
                },
            })
        );
    }

    async handleGroupExists(participantIds: string[]) {
        const potentialGroups = await this.prisma.chatRoom.findMany({
            where: {
                AND: [
                    {
                        participants: {
                            every: { id: { in: participantIds } },
                        },
                    },
                    {
                        participants: {
                            none: { id: { notIn: participantIds } },
                        },
                    },
                ],
            },
            select: {
                id: true,
                name: true,
                picture: true,
                participants: {
                    select: {
                        id: true,
                        profilePic: true,
                        fullName: true,
                        username: true,
                    },
                },
                createdBy: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });

        printlogs("Potential group details:", potentialGroups);

        const existingGroups = potentialGroups.filter((room) => room.participants.length === participantIds.length);

        printlogs("Existing group details:", existingGroups);

        if (existingGroups?.length) {
            this.res.status(409).json(ROOM_EXISTS, { existingGroups, isGroup: true });
            return;
        }

        this.res.json(ROOM_EXISTS, { isGroup: true });
    }

    async handleChatRoomCreation(id: string, message: IRoomExistsRequest) {
        const participants = message.payload.selectedUsers;

        printlogs("participants:", participants);

        if (!participants || !participants.length) {
            this.res.status(400).error(ROOM_EXISTS, "Participants not found");
            return;
        }

        if (participants?.length < 1) {
            this.res.status(400).error(ROOM_EXISTS, "Please select atleast one person to start a conversation with");
            return;
        }

        if (participants.length === 1 && participants[0].id === id) {
            this.res.status(400).error(ROOM_EXISTS, "Cannot start a chat with yourself");
            return;
        }

        if (participants.length === 1 && participants[0].id !== id) {
            participants.push({ id });
        }

        const isGroup = participants.length > 2;
        const participantIds = participants.map((user) => user.id);

        printlogs("participantIds", participantIds);

        if (isGroup) {
            await this.handleGroupExists(participantIds);
            return;
        }

        const existingChatRoom = await this.prisma.chatRoom.findFirst({
            where: {
                AND: [
                    {
                        participants: {
                            every: { id: { in: participantIds } },
                        },
                    },
                    {
                        participants: {
                            none: { id: { notIn: participantIds } },
                        },
                    },
                ],
            },
            select: {
                id: true,
                createdAt: true,
                messages: {
                    select: {
                        id: true,
                        content: true,
                        senderId: true,
                        readBy: true,
                        editedAt: true,
                        chatRoomId: true,
                        sentAt: true,
                    },
                    orderBy: {
                        sentAt: "desc",
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
            },
        });

        if (existingChatRoom?.id) {
            this.res.status(409).json(ROOM_EXISTS, { existingChatRoom, isGroup: false });
            return;
        }

        const chatRoomDetails = await prisma.chatRoom.create({
            data: {
                participants: {
                    connect: participantIds.map((sub) => ({
                        id: sub,
                    })),
                },
            },
            select: {
                id: true,
                createdAt: true,
                participants: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                        profilePic: true,
                    },
                },
                messages: {
                    select: {
                        id: true,
                        content: true,
                        sentAt: true,
                        editedAt: true,
                        readBy: true,
                        sentBy: true,
                        isEdited: true,
                        chatRoomId: true,
                        receivedBy: true,
                        recipients: true,
                    },
                },
            },
        });

        // work on this
        this.subscriber.subscribe(chatRoomDetails.id);
        this.subscriber.on("message", async (channel, message) => {
            printlogs("subscribed channel:", channel);
            printlogs("subscribed message:", JSON.parse(message));
        });

        this.res.status(201).json(ROOM_EXISTS, { chatRoomDetails });
    }

    async handleChangeGroupName(id: string, message: IUpdateChatRoomName) {
        const updatedGroupName = message.payload.groupName;
        const chatRoomId = message.payload.chatRoomId;

        const isMember = await this.prisma.chatRoom.findFirst({
            where: { AND: [{ id: chatRoomId, participants: { some: { id } } }] },
            select: { id: true },
        });

        if (!isMember?.id) {
            this.res.error(CHANGE_GROUP_NAME, "Only members of the group can change the group name", 403);
            return;
        }

        await this.prisma.chatRoom.update({
            where: { id: chatRoomId },
            data: {
                name: updatedGroupName,
            },
            select: {
                name: true,
            },
        });

        this.res.json(CHANGE_GROUP_NAME, { message: "Group name updated successfully", updatedGroupName });
    }

    async handleLeaveGroupChat(id: string, message: ILeaveGroupChat) {
        try {
            const chatRoomId = message.payload.chatRoomId;

            const chatRoom = await this.prisma.chatRoom.findFirst({
                where: { id: chatRoomId, participants: { some: { id } } },
                select: {
                    id: true,
                    superAdminId: true,
                    participants: { select: { id: true, username: true, fullName: true, profilePic: true } },
                },
            });

            if (!chatRoom || !chatRoom.id) {
                this.res
                    .status(STATUS_CODE.FORBIDDEN)
                    .json(
                        LEAVE_GROUP_CHAT,
                        { message: "You are not a member of this group", action: "not-member" },
                        { success: false }
                    );
                return;
            }

            if (chatRoom.superAdminId === id && chatRoom.participants.length > 2) {
                this.res.status(STATUS_CODE.FORBIDDEN).json(
                    LEAVE_GROUP_CHAT,
                    {
                        message:
                            "Super admin cannot leave the group. Please transfer this role to someone else to leave the group chat",
                        action: "select-superadmin",
                        participants: chatRoom.participants,
                    },
                    { success: false }
                );
                return;
            }

            if (chatRoom.superAdminId === id && chatRoom.participants.length === 2) {
                this.res
                    .status(STATUS_CODE.FORBIDDEN)
                    .json(
                        LEAVE_GROUP_CHAT,
                        { participants: chatRoom.participants, action: "auto-superadmin" },
                        { success: false }
                    );
                return;
            }

            await this.prisma.chatRoom.update({
                where: { id: chatRoomId },
                data: {
                    participants: { disconnect: { id } },
                    admins: { disconnect: { id } },
                    superAdmin: { disconnect: { id } },
                },
            });

            this.res.json(LEAVE_GROUP_CHAT, { message: "You have successfully left the group chat" });
        } catch (error) {
            printlogs("ERROR in handleLeaveGroupChat()", error);
            this.res.error(LEAVE_GROUP_CHAT, "An error occurred while trying to leave the group chat");
        }
    }

    async handleSuperAdminTranferAndLeaveGroupChat(id: string, message: ITransferSuperAdminAndLeaveGroupChat) {
        try {
            const newSuperAdminId = message.payload.newSuperAdminId;
            const chatRoomId = message.payload.chatRoomId;

            const chatRoom = await this.prisma.chatRoom.findFirst({
                where: { id: chatRoomId, participants: { some: { id } } },
                select: {
                    id: true,
                    superAdminId: true,
                    participants: { select: { id: true, fullName: true, profilePic: true, username: true } },
                },
            });

            if (!chatRoom || !chatRoom.id) {
                this.res.error(TRANSFER_SUPER_ADMIN, "This chat room does not exists", STATUS_CODE.NOT_FOUND);
                return;
            }

            const isSuperAdmin = chatRoom.superAdminId === id;

            if (!isSuperAdmin) {
                this.res.error(
                    TRANSFER_SUPER_ADMIN,
                    "You do not have enough permissions to perform this action",
                    STATUS_CODE.FORBIDDEN
                );
                return;
            }

            const isMember = chatRoom.participants.find((member) => member.id === newSuperAdminId);

            if (!isMember) {
                this.res.error(
                    TRANSFER_SUPER_ADMIN,
                    "Only members of the group chat can be made super admin",
                    STATUS_CODE.BAD_REQUEST
                );
                return;
            }

            await this.prisma.chatRoom.update({
                where: { id: chatRoomId },
                data: {
                    superAdmin: {
                        disconnect: {
                            id,
                        },
                        connect: {
                            id: newSuperAdminId,
                        },
                    },
                    participants: {
                        disconnect: {
                            id,
                        },
                    },
                    admins: {
                        disconnect: {
                            id,
                        },
                    },
                },
                select: {
                    id: true,
                },
            });

            const newSuperAdmin = chatRoom.participants.find((member) => member.id === newSuperAdminId);

            this.res.json(TRANSFER_SUPER_ADMIN, { message: "success", newSuperAdmin, leaveGroupMemberId: id });
        } catch (error) {
            printlogs("ERROR inside ", error);
            this.res.error(
                TRANSFER_SUPER_ADMIN,
                "An error occurred while trying to transfer super admin and leave the group chat"
            );
        }
    }

    async handleAddAdmin(socket: WebSocket, id: string, message: IMessage) {
        const adminId = message.payload.userId;
        const groupId = message.payload.groupId;

        // const memberExists = await this.prisma.group.findFirst({
        //     where: {
        //         AND: [{ id: groupId }, { members: { some: { id: adminId } } }, { superAdminId: id }],
        //     },
        //     select: {
        //         id: true,
        //     },
        // });

        // if (!memberExists) {
        //     socket.send(
        //         JSON.stringify({
        //             type: MAKE_ADMIN,
        //             payload: {
        //                 result: ERROR,
        //             },
        //         })
        //     );
        //     return;
        // }

        // const userDetails = await this.prisma.group.update({
        //     where: { id: groupId },
        //     data: {
        //         adminOf: {
        //             connect: {
        //                 id: adminId,
        //             },
        //         },
        //     },
        //     include: {
        //         adminOf: {
        //             where: {
        //                 id: adminId,
        //             },
        //         },
        //     },
        // });

        // socket.send(
        //     JSON.stringify({
        //         type: MAKE_ADMIN,
        //         payload: {
        //             userDetails,
        //         },
        //     })
        // );
    }

    async handleRemoveAdmin(socket: WebSocket, id: string, message: IMessage) {
        const adminId = message.payload.userId;
        const groupId = message.payload.groupId;

        // const memberExists = await this.prisma.group.findFirst({
        //     where: {
        //         AND: [{ id: groupId }, { members: { some: { id: adminId } } }, { superAdminId: id }],
        //     },
        //     select: {
        //         id: true,
        //     },
        // });

        // if (!memberExists) {
        //     socket.send(
        //         JSON.stringify({
        //             type: MAKE_ADMIN,
        //             payload: {
        //                 result: ERROR,
        //             },
        //         })
        //     );
        //     return;
        // }

        // await this.prisma.group.update({
        //     where: { id: groupId },
        //     data: {
        //         adminOf: {
        //             disconnect: {
        //                 id: adminId,
        //             },
        //         },
        //     },
        // });

        // socket.send(
        //     JSON.stringify({
        //         type: MAKE_ADMIN,
        //         payload: {
        //             adminId,
        //         },
        //     })
        // );
    }

    async getChatRoomDetails(message: IGetChatRoomById) {
        try {
            const chatRoomId = message.payload.chatRoomId;

            const chatRoomDetails = await this.prisma.chatRoom.findUnique({
                where: { id: chatRoomId },
                select: {
                    id: true,
                    createdAt: true,
                    participants: { select: { id: true, fullName: true, username: true, profilePic: true } },
                    roomType: true,
                    messages: {
                        select: {
                            id: true,
                            content: true,
                            editedAt: true,
                            sentAt: true,
                            readBy: { select: { id: true, fullName: true, username: true, profilePic: true } },
                            isEdited: true,
                            sentBy: { select: { id: true, fullName: true, username: true, profilePic: true } },
                            chatRoomId: true,
                            receivedBy: { select: { id: true, fullName: true, username: true, profilePic: true } },
                            recipients: { select: { id: true, fullName: true, username: true, profilePic: true } },
                        },
                    },
                    name: true,
                    nameUpdatedAt: true,
                    picture: true,
                    pictureUpdatedAt: true,
                    createdBy: { select: { id: true, fullName: true, username: true, profilePic: true } },
                    admins: { select: { id: true, fullName: true, username: true, profilePic: true } },
                    superAdmin: { select: { id: true, fullName: true, username: true, profilePic: true } },
                },
            });

            if (!chatRoomDetails?.id) {
                this.res.status(404).json(CHATROOM_DETAILS_BY_ID, { message: "This chat room does not exists" });
                return;
            }

            const modifiedChatRoomDetails = {
                ...chatRoomDetails,
                isGroup: chatRoomDetails.roomType === "GROUP" ? true : false,
            };

            this.res.json(CHATROOM_DETAILS_BY_ID, modifiedChatRoomDetails);
        } catch (error) {
            printlogs("ERROR in getChatRoomDetails():", error);
            this.res.error(CHATROOM_DETAILS_BY_ID, "There was an error trying to fetch chat room details");
        }
    }

    async addUserToChat(socket: WebSocket, id: string, message: IMessage) {
        const chatRoomDetails = message.payload.chatRoomDetails;
        const newUsersDetails: any[] = message.payload.newUsersDetails;

        printlogs("user id:", id);

        if (!chatRoomDetails || !newUsersDetails?.length || !chatRoomDetails?.id) {
            const payload = {
                result: "error",
                message: "Invalid DM or user details",
                statusCode: 400,
            };
            socket.send(JSON.stringify({ type: ADD_TO_CHAT, payload }));
            return;
        }

        const chatRoom = await this.prisma.chatRoom.findUnique({
            where: { id: chatRoomDetails.id },
            // select: {
            //     isGroup: true,
            // },
        });

        // if (!chatRoom?.isGroup) {
        //     const payload = {
        //         result: "error",
        //         message: "Cannot add members to a private DM",
        //         statusCode: 400,
        //     };
        //     socket.send(JSON.stringify({ type: ADD_TO_CHAT, payload }));
        //     return;
        // }

        const hasPermission = await this.prisma.chatRoom.findFirst({
            where: {
                id: chatRoomDetails.id,
                // Group: {
                //     OR: [{ adminOf: { some: { id } } }, { superAdmin: { id } }],
                // },
            },
            select: { id: true },
        });

        printlogs("Has permission:", hasPermission);

        if (!hasPermission?.id) {
            const payload = {
                result: "error",
                message: "You do not have enough permissions to add members to this group",
                statusCode: 403,
            };

            socket.send(JSON.stringify({ type: ADD_TO_CHAT, payload }));
            return;
        }

        const participantsIds: any[] = chatRoomDetails?.participants?.length
            ? chatRoomDetails.participants.map((user: any) => user.id)
            : [];

        newUsersDetails.map((newUser: any) => participantsIds.push(newUser?.id));

        printlogs("participantsIds", participantsIds);

        const potentialChatRooms = await this.prisma.chatRoom.findMany({
            where: {
                AND: [
                    {
                        participants: {
                            every: { id: { in: participantsIds } },
                        },
                    },
                    {
                        participants: {
                            none: { id: { notIn: participantsIds } },
                        },
                    },
                ],
            },
            select: {
                id: true,
                participants: true,
            },
        });

        printlogs("Potential chat room details:", potentialChatRooms);

        const existingChatRoom = potentialChatRooms.find(
            (room: any) => room.participants.length === participantsIds.length
        );

        printlogs("existingChatRoom", existingChatRoom);

        printlogs("participantsIds length", participantsIds.length);

        if (existingChatRoom?.id) {
            const payload = {
                result: "error",
                message: "A group with all the selected members already exists",
                statusCode: 409,
            };
            socket.send(JSON.stringify({ type: ADD_TO_CHAT, payload }));
            return;
        }

        const successfullyAddedUsers = [];

        for (const newUserDetails of newUsersDetails) {
            const isAlreadyInGroup = await this.prisma.chatRoom.findFirst({
                where: {
                    id: chatRoomDetails.id,
                    participants: {
                        some: {
                            id: newUserDetails.id,
                        },
                    },
                },
                select: { id: true },
            });

            if (isAlreadyInGroup?.id) {
                const payload = {
                    result: "error",
                    message: `User ${newUserDetails.username} is already in this group`,
                    statusCode: 409,
                };
                socket.send(JSON.stringify({ type: ADD_TO_CHAT, payload }));
                continue;
            }

            const updatedChatRoom = await this.prisma.chatRoom.update({
                where: { id: chatRoomDetails.id },
                data: {
                    participants: {
                        connect: {
                            id: newUserDetails.id,
                        },
                    },
                },
                select: {
                    participants: {
                        where: {
                            id: newUserDetails.id,
                        },
                        select: {
                            id: true,
                            username: true,
                            email: true,
                            profilePic: true,
                            fullName: true,
                        },
                    },
                },
            });

            if (!updatedChatRoom.participants.length) {
                const payload = {
                    result: "error",
                    messsage: `User ${newUserDetails.username} does not exist`,
                    statusCode: 404,
                };
                socket.send(JSON.stringify({ type: ADD_TO_CHAT, payload }));
                continue;
            }

            successfullyAddedUsers.push(updatedChatRoom.participants[0]);
        }

        if (!successfullyAddedUsers.length) {
            const payload = {
                result: "error",
                message: "No new users were added to the group",
                statusCode: 400,
            };
            socket.send(JSON.stringify({ type: ADD_TO_CHAT, payload }));
            return;
        }

        const payload = {
            result: "success",
            newUsersDetails: successfullyAddedUsers,
            statusCode: 200,
        };

        socket.send(JSON.stringify({ type: ADD_TO_CHAT, payload }));
    }

    async removeUserFromChat(socket: WebSocket, id: string, message: IMessage) {
        const chatRoomId = message.payload.chatRoomId;
        const memberId = message.payload.memberId;

        if (!chatRoomId || !memberId) {
            const payload = {
                result: "error",
                message: "Invalid DM or user details",
                statusCode: 400,
            };

            socket.send(JSON.stringify({ type: REMOVE_FROM_CHAT, payload }));
            return;
        }

        printlogs("chatRoomId", chatRoomId);

        const chatRoom = await this.prisma.chatRoom.findUnique({
            where: { id: chatRoomId },
            // select: {
            //     isGroup: true,
            // },
        });

        printlogs("chatRoom details", chatRoom);

        // if (!chatRoom?.isGroup) {
        //     const payload = {
        //         result: "error",
        //         message: "This group does not exist",
        //         statusCode: 400,
        //     };
        //     socket.send(JSON.stringify({ type: REMOVE_FROM_CHAT, payload }));
        //     return;
        // }

        const memberExists = await this.prisma.chatRoom.findUnique({
            where: { id: chatRoomId, participants: { some: { id: memberId } } },
            select: { id: true },
        });

        if (!memberExists?.id) {
            const payload = {
                result: "error",
                message: "This member is not a part of this group",
                statusCode: 409,
            };
            socket.send(JSON.stringify({ type: REMOVE_FROM_CHAT, payload }));
            return;
        }

        const hasPermission = await this.prisma.chatRoom.findFirst({
            where: {
                id: chatRoomId,
                // Group: {
                //     AND: [
                //         {
                //             OR: [{ adminOf: { some: { id } } }, { superAdmin: { id } }],
                //         },
                //         {
                //             superAdmin: { id: { notIn: [memberId] } },
                //         },
                //     ],
                // },
            },
            select: { id: true },
        });

        if (!hasPermission?.id) {
            const payload = {
                result: "error",
                message: "You do not have enough permissions to remove this member from the group",
                statusCode: 403,
            };

            socket.send(JSON.stringify({ type: REMOVE_FROM_CHAT, payload }));
            return;
        }

        await this.prisma.chatRoom.update({
            where: { id: chatRoomId },
            data: {
                participants: {
                    disconnect: {
                        id: memberId,
                    },
                },
            },
            select: {
                id: true,
            },
        });

        const payload = {
            result: SUCCESS,
            data: {
                removedMemberId: memberId,
                chatRoomId,
                message: "Successfully removed from the group",
            },
            statusCode: 200,
        };

        socket.send(JSON.stringify({ type: REMOVE_FROM_CHAT, payload }));
    }

    async handleIncomingMessages(id: string, socket: WebSocket) {
        console.log("Inside handle incoming request");
        socket.on("message", async (data) => {
            const message = JSON.parse(data.toString());

            switch (message.type) {
                case GET_INBOX:
                    this.getUserInbox(id, message);
                    break;
                case FIND_CHATS:
                    this.getChats(id);
                    break;
                case ROOM_EXISTS:
                    this.handleChatRoomCreation(id, message);
                    break;
                // start the frontend synchronization from here
                case CHATROOM_DETAILS_BY_ID:
                    this.getChatRoomDetails(message);
                    break;
                case TRANSFER_SUPER_ADMIN:
                    this.handleSuperAdminTranferAndLeaveGroupChat(id, message);
                    break;
                // start the backend from here
                case CREATE_GROUP:
                    this.handleGroupConvo(socket, id, message);
                    break;
                case NEW_MESSAGE:
                    this.handleNewMessage(socket, message);
                    break;
                case CHANGE_GROUP_NAME:
                    this.handleChangeGroupName(id, message);
                    break;
                case LEAVE_GROUP_CHAT:
                    this.handleLeaveGroupChat(id, message);
                    break;
                case MAKE_ADMIN:
                    this.handleAddAdmin(socket, id, message);
                    break;
                case REMOVE_AS_ADMIN:
                    this.handleRemoveAdmin(socket, id, message);
                    break;
                case ADD_TO_CHAT:
                    this.addUserToChat(socket, id, message);
                    break;
                case REMOVE_FROM_CHAT:
                    this.removeUserFromChat(socket, id, message);
                    break;
                default:
                    break;
            }
        });
    }
}
