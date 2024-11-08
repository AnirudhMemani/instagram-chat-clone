import { SocketResponse } from "@instachat/common/common";
import { prisma } from "@instachat/db/client";
import {
    ADD_TO_CHAT,
    CHANGE_GROUP_NAME,
    CHATROOM_DETAILS_BY_ID,
    CREATE_GROUP,
    DELETE_CHAT,
    FIND_CHATS,
    GET_INBOX,
    LEAVE_GROUP_CHAT,
    MAKE_ADMIN,
    NEW_MESSAGE,
    READ_MESSAGE,
    REMOVE_AS_ADMIN,
    REMOVE_FROM_CHAT,
    ROOM_EXISTS,
    SEND_MESSAGE,
    TRANSFER_SUPER_ADMIN,
    UPDATE_INBOX,
    UPDATE_PROFILE,
} from "@instachat/messages/messages";
import {
    IAddUserToGroupChat,
    IAdminStatusChange,
    IDeleteGroupChat,
    IGetChatRoomById,
    ILeaveGroupChat,
    IMessage,
    IMessageRead,
    IRemoveUserFromGroupChat,
    IRoomExistsRequest,
    ISendMessage,
    IStartConvoMessageRequest,
    ITransferSuperAdminAndLeaveGroupChat,
    IUpdateChatRoomName,
    IUpdateProfile,
} from "@instachat/messages/types";
import cloudinary from "cloudinary";
import { Redis } from "ioredis";
import WebSocket from "ws";
import { redis } from "../redis/client.js";
import { getChatRoom, getLatestChatRoomMessages } from "../services/chatroom.js";
import { STATUS_CODE } from "../utils/constants.js";
import { printlogs } from "../utils/logs.js";
import { IUserWithSocket, UserManager } from "./UserManager.js";

/**
 * TODO:
 * Maybe switch to singleton since the scores array is being tracked?
 * Add redis
 */

export class InboxManager {
    private redis: Redis = redis;
    private prisma: typeof prisma = prisma;
    private userManager: UserManager;
    private res: SocketResponse;

    constructor(socket: WebSocket, userManager: UserManager) {
        this.res = new SocketResponse(socket);
        this.userManager = userManager;
    }

    async subscribeToUserChatRooms(userId: string, socket: WebSocket) {
        const userChatRooms = await prisma.chatRoom.findMany({
            where: { participants: { some: { id: userId } } },
            select: { id: true },
        });

        userChatRooms.forEach((chatRoom) => {
            this.userManager.addUserToRoom(userId, chatRoom.id);
        });
    }

    async connectUser(user: IUserWithSocket) {
        this.handleIncomingMessages(user.id, user.socket);
        await this.subscribeToUserChatRooms(user.id, user.socket);
    }

    async getLatestMessages(userId: string, take: number, skip: number) {
        try {
            // const cacheKey = getSortedSetKey(userId);

            // LRANGE "key" start "stop"
            // Where start and stop are zero-based indexes. The stop index is inclusive, meaning the element at the stop index is included in the result.
            // const cachedDMs = await this.redis.lrange(cacheKey, skip, skip + take - 1);

            // if (cachedDMs.length > 0) {
            //     return cachedDMs.map((cachedDM: any) => JSON.parse(cachedDM));
            // }

            const chatRooms = await getLatestChatRoomMessages(userId, { take, skip, orderBy: "desc" });

            if (!chatRooms) {
                this.res.error(GET_INBOX, "User is not a paricipant of any chat room", STATUS_CODE.NOT_FOUND);
                return;
            }

            const messageVisibility = await this.prisma.messageVisibility.findMany({
                where: { userId },
                select: { deletedAt: true, chatRoomId: true },
            });

            const visibilityMap = messageVisibility.reduce(
                (map, record) => {
                    map[record.chatRoomId] = record.deletedAt;
                    return map;
                },
                {} as Record<string, Date>
            );

            const filteredChatRooms = chatRooms.filter((chatRoom) => {
                const deletedAt = visibilityMap[chatRoom.id];

                // If chatRoom is DIRECT_MESSAGE and there’s no latest message, exclude it
                if (chatRoom.roomType === "DIRECT_MESSAGE" && !chatRoom.latestMessage) {
                    return false;
                }

                // Only include direct messages sent after deletedAt timestamp
                if (
                    chatRoom.roomType === "DIRECT_MESSAGE" &&
                    deletedAt &&
                    chatRoom.latestMessage &&
                    chatRoom.latestMessage.sentAt <= deletedAt
                ) {
                    return false;
                }

                return true;
            });

            const stringifiedChatRooms = filteredChatRooms.map((chatRoom) => {
                const { roomType, id: chatRoomId, ...rest } = chatRoom;

                return {
                    ...rest,
                    chatRoomId,
                    hasRead: chatRoom?.latestMessage?.readBy?.some((user) => user.id === userId) ?? true,
                    isGroup: chatRoom.roomType === "GROUP",
                };
            });

            // if (filteredChatRooms.length > 0) {
            //     // Push the new messages to the head of the list
            //     await this.redis.lpush(cacheKey, ...stringifiedChatRooms.map((message) => JSON.stringify(message)));
            //     // Trim the list to keep only the most recent 50 messages
            //     await this.redis.ltrim(cacheKey, 0, 49);
            // }

            return stringifiedChatRooms;
        } catch (error) {
            printlogs("ERROR inside getLatestMessages():", error);
            this.res.error(GET_INBOX, "There was an issue trying to get your inbox");
        }
    }

    async handleNewMessage(userId: string, message: ISendMessage) {
        try {
            const { chatRoomId, content } = message.payload;

            if (!chatRoomId || !content) {
                this.res
                    .status(STATUS_CODE.BAD_REQUEST)
                    .json(SEND_MESSAGE, { message: "Invalid params", action: "invalid-params" });
                return;
            }

            if (content.trim().length < 1) {
                this.res
                    .status(STATUS_CODE.BAD_REQUEST)
                    .json(SEND_MESSAGE, { message: "Message cannot be empty", action: "empty-message" });
                return;
            }

            const chatRoom = await getChatRoom(chatRoomId, userId);

            if (!chatRoom) {
                this.res.error(
                    SEND_MESSAGE,
                    "Chat room not found or user not a part of this chat room",
                    STATUS_CODE.FORBIDDEN
                );
                return;
            }

            const chatRoomMessages = await this.prisma.chatRoom.update({
                where: { id: chatRoomId },
                data: {
                    messages: {
                        create: {
                            sentBy: { connect: { id: userId } },
                            content,
                            recipients: { connect: chatRoom.participants.map((member) => ({ id: member.id })) },
                            readBy: { connect: { id: userId } },
                            receivedBy: { connect: { id: userId } },
                            latestMessageChatRoom: { connect: { id: chatRoomId } },
                        },
                    },
                },
                select: {
                    id: true,
                    name: true,
                    picture: true,
                    roomType: true,
                    createdAt: true,
                    createdBy: { select: { id: true, username: true, fullName: true, profilePic: true } },
                    latestMessage: {
                        select: {
                            id: true,
                            content: true,
                            sentAt: true,
                            editedAt: true,
                            readBy: { select: { id: true, username: true, fullName: true, profilePic: true } },
                            isEdited: true,
                            sentBy: { select: { id: true, username: true, fullName: true, profilePic: true } },
                            receivedBy: { select: { id: true, username: true, fullName: true, profilePic: true } },
                            recipients: { select: { id: true, username: true, fullName: true, profilePic: true } },
                            chatRoomId: true,
                        },
                    },
                    participants: { select: { id: true, username: true, fullName: true, profilePic: true } },
                },
            });

            if (!chatRoomMessages) {
                this.res.error(SEND_MESSAGE, "There was an error trying to send this message");
                return;
            }

            const { roomType, id, ...rest } = chatRoomMessages;

            const modifiedChatRoom = {
                ...rest,
                chatRoomId,
                isGroup: chatRoomMessages.roomType === "GROUP",
                hasRead: chatRoomMessages.latestMessage?.readBy.some((user) => user.id === userId) || false,
            };

            const formattedInboxMessage = {
                isGroup: modifiedChatRoom.isGroup,
                hasRead: false,
                chatRoomId: modifiedChatRoom.chatRoomId,
                name: modifiedChatRoom.name,
                picture: modifiedChatRoom.picture,
                participants: modifiedChatRoom.participants,
                latestMessage: {
                    id: modifiedChatRoom.latestMessage?.id,
                    content: modifiedChatRoom.latestMessage?.content,
                    sentAt: modifiedChatRoom.latestMessage?.sentAt,
                    sentBy: modifiedChatRoom.latestMessage?.sentBy,
                    readBy: modifiedChatRoom.latestMessage?.readBy,
                },
                createdAt: modifiedChatRoom.createdAt,
                createdBy: modifiedChatRoom.createdBy,
            };

            // const cacheKey = getSortedSetKey(userId);
            // const cachedMessages = await this.redis.lrange(cacheKey, 0, -1);

            // const updatedCache = cachedMessages.map((cachedMsg) => {
            //     const parsedMsg = JSON.parse(cachedMsg);
            //     return parsedMsg?.chatRoomId === chatRoomId ? JSON.stringify(formattedInboxMessage) : cachedMsg;
            // });

            // await this.redis.del(cacheKey);
            // await this.redis.lpush(cacheKey, ...updatedCache);
            // await this.redis.ltrim(cacheKey, 0, 49);

            const newMessagePayload = {
                type: NEW_MESSAGE,
                payload: {
                    message: "New message received",
                    messageDetails: modifiedChatRoom,
                },
                status: STATUS_CODE.OK,
                success: true,
            };

            const updateInboxPayload = {
                type: UPDATE_INBOX,
                payload: formattedInboxMessage,
                status: STATUS_CODE.OK,
                success: true,
            };

            this.userManager.publishToRoom(chatRoomId, userId, newMessagePayload);
            this.userManager.publishToRoom(chatRoomId, userId, updateInboxPayload);

            this.res.json(SEND_MESSAGE, { message: "Message sent", messageDetails: modifiedChatRoom });
            this.res.json(UPDATE_INBOX, { ...formattedInboxMessage, hasRead: true });

            // fix this
            // const MQServerUrl = "amqp://localhost";

            // const conn = await amqp.connect(MQServerUrl);
            // const channel = await conn.createChannel();
            // await channel.assertQueue(MESSAGE_QUEUE);
            // channel.sendToQueue(MESSAGE_QUEUE, message.payload);

            // await redis.publish(chatRoomId, JSON.stringify(content));
        } catch (error) {
            printlogs("ERROR inside handleNewMessage()", error);
            this.res.error(NEW_MESSAGE, "There was an error trying to send this message");
        }
    }

    async handleMessageRead(userId: string, message: IMessageRead) {
        const chatRoomId = message.payload.chatRoomId;

        if (!chatRoomId) {
            this.res.error(READ_MESSAGE, "Invalid params", STATUS_CODE.BAD_REQUEST);
            return;
        }

        try {
            const unreadMessages = await this.prisma.message.findMany({
                where: {
                    chatRoomId,
                    readBy: { none: { id: userId } },
                },
                select: { id: true },
            });

            if (unreadMessages.length > 0) {
                await Promise.all(
                    unreadMessages.map((message) =>
                        this.prisma.message.update({
                            where: { id: message.id },
                            data: {
                                readBy: {
                                    connect: { id: userId },
                                },
                            },
                        })
                    )
                );
            }

            this.res.json(READ_MESSAGE, { message: "All messages marked as read", readerId: userId, chatRoomId });
        } catch (error) {
            console.error("Error in handleMessageRead():", error);
            this.res.error(READ_MESSAGE, "Failed to mark messages as read");
        }
    }

    async getUserInbox(id: string, message: IMessage) {
        const take = Number.isNaN(Number(message.payload.take)) ? Infinity : message.payload.take;
        const skip = Number.isNaN(Number(message.payload.skip)) ? 0 : message.payload.skip;

        const userInbox = await this.getLatestMessages(id, take, skip);
        this.res.json(GET_INBOX, userInbox);
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

    async handleGroupCreation(id: string, message: IStartConvoMessageRequest) {
        try {
            const selectedUsers = message.payload.selectedUsers;
            const groupDetails = message.payload.groupDetails;

            const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB

            const { name, profilePic, pictureName } = groupDetails;

            let result;

            if (profilePic) {
                const fileSize = Buffer.byteLength(profilePic);

                if (fileSize > MAX_FILE_SIZE) {
                    this.res.error(
                        CREATE_GROUP,
                        "Exceeded max file size of 8 MB for group image",
                        STATUS_CODE.BAD_REQUEST
                    );
                    return;
                }

                result = await cloudinary.v2.uploader.upload(profilePic, {
                    public_id: pictureName,
                    upload_preset: process.env.CLOUDINARY_PRESET_NAME,
                });
            }

            const newChatRoom = await prisma.chatRoom.create({
                data: {
                    name,
                    participants: {
                        connect: selectedUsers.map((user) => ({
                            id: user.id,
                        })),
                    },
                    roomType: "GROUP",
                    picture: result?.secure_url,
                    superAdmin: { connect: { id } },
                    admins: { connect: { id } },
                    createdBy: { connect: { id } },
                },
                select: {
                    id: true,
                    name: true,
                    createdAt: true,
                    picture: true,
                    nameUpdatedAt: true,
                    pictureUpdatedAt: true,
                    createdBy: {
                        select: {
                            id: true,
                            fullName: true,
                            username: true,
                            profilePic: true,
                        },
                    },
                    admins: {
                        select: {
                            id: true,
                            fullName: true,
                            username: true,
                            profilePic: true,
                        },
                    },
                    participants: {
                        select: {
                            id: true,
                            fullName: true,
                            username: true,
                            profilePic: true,
                        },
                    },
                    superAdmin: {
                        select: {
                            id: true,
                            fullName: true,
                            username: true,
                            profilePic: true,
                        },
                    },
                },
            });

            newChatRoom.participants.forEach((user) => {
                this.userManager.addUserToRoom(user.id, newChatRoom.id);
            });

            const formattedInboxMessage = {
                isGroup: true,
                hasRead: true,
                chatRoomId: newChatRoom.id,
                name: newChatRoom.name,
                picture: newChatRoom.picture,
                participants: newChatRoom.participants,
                latestMessage: null,
                createdAt: newChatRoom.createdAt,
                createdBy: newChatRoom.createdBy,
            };

            const updateInboxPayload = {
                type: UPDATE_INBOX,
                payload: formattedInboxMessage,
                status: STATUS_CODE.OK,
                success: true,
            };

            this.userManager.publishToRoom(newChatRoom.id, id, updateInboxPayload);

            this.res.json(CREATE_GROUP, { ...newChatRoom, message: "Group created successfully" });
            this.res.json(UPDATE_INBOX, { ...formattedInboxMessage, hasRead: true });
        } catch (error) {
            printlogs("ERROR inside handleGroupCreation()", error);
            this.res.error(CREATE_GROUP, "An error occurred while trying to create this group");
        }
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

        const existingGroups = potentialGroups.filter((room) => room.participants.length === participantIds.length);

        if (existingGroups?.length) {
            this.res.status(STATUS_CODE.CONFLICT).json(ROOM_EXISTS, { existingGroups, isGroup: true });
            return;
        }

        this.res.json(ROOM_EXISTS, { isGroup: true });
    }

    async handleChatRoomCreation(id: string, message: IRoomExistsRequest) {
        const participants = message.payload.selectedUsers;

        if (!participants || !participants.length) {
            this.res.status(STATUS_CODE.BAD_REQUEST).error(ROOM_EXISTS, "Participants not found");
            return;
        }

        if (participants?.length < 1) {
            this.res
                .status(STATUS_CODE.BAD_REQUEST)
                .error(ROOM_EXISTS, "Please select atleast one person to start a conversation with");
            return;
        }

        if (participants.length === 1 && participants[0].id === id) {
            this.res.status(STATUS_CODE.BAD_REQUEST).error(ROOM_EXISTS, "Cannot start a chat with yourself");
            return;
        }

        if (participants.length === 1 && participants[0].id !== id) {
            participants.push({ id });
        }

        const isGroup = participants.length > 2;
        const participantIds = participants.map((user) => user.id);

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

        if (existingChatRoom) {
            const messageVisibility = await this.prisma.messageVisibility.findUnique({
                where: { chatRoomId_userId: { chatRoomId: existingChatRoom.id, userId: id } },
                select: { deletedAt: true },
            });
            printlogs("messageVisibility", messageVisibility);

            printlogs("existingChatRoom | BEFORE:", existingChatRoom);

            const filteredMessages = existingChatRoom.messages.filter((message) =>
                messageVisibility?.deletedAt ? message.sentAt >= messageVisibility.deletedAt : true
            );
            printlogs("filteredMessages:", filteredMessages);

            const modifiedChatRoom = {
                ...existingChatRoom,
                messages: filteredMessages,
            } satisfies typeof existingChatRoom;

            printlogs("modifiedChatRoom | AFTER:", modifiedChatRoom);

            this.res
                .status(STATUS_CODE.CONFLICT)
                .json(ROOM_EXISTS, { existingChatRoom: modifiedChatRoom, isGroup: false });
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

        participants.forEach((user) => {
            this.userManager.addUserToRoom(user.id, chatRoomDetails.id);
        });

        this.res.status(STATUS_CODE.CREATED).json(ROOM_EXISTS, { chatRoomDetails });
    }

    async handleChangeGroupName(id: string, message: IUpdateChatRoomName) {
        const updatedGroupName = message.payload.groupName;
        const chatRoomId = message.payload.chatRoomId;

        const isMember = await this.prisma.chatRoom.findFirst({
            where: { AND: [{ id: chatRoomId, participants: { some: { id } } }] },
            select: { id: true },
        });

        if (!isMember?.id) {
            this.res.error(
                CHANGE_GROUP_NAME,
                "Only members of the group can change the group name",
                STATUS_CODE.FORBIDDEN
            );
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

            const chatRoom = await this.prisma.chatRoom.findUnique({
                where: { id: chatRoomId },
                select: {
                    id: true,
                    superAdmin: { select: { id: true } },
                    participants: { select: { id: true, username: true, fullName: true, profilePic: true } },
                },
            });

            if (!chatRoom || !chatRoom.id) {
                this.res
                    .status(STATUS_CODE.NOT_FOUND)
                    .json(LEAVE_GROUP_CHAT, { message: "This chat room does not exists" }, { success: false });
                return;
            }

            if (!chatRoom.participants.find((member) => member.id === id)?.id) {
                this.res
                    .status(STATUS_CODE.FORBIDDEN)
                    .json(
                        LEAVE_GROUP_CHAT,
                        { message: "You are not a member of this group", action: "not-member" },
                        { success: false }
                    );
                return;
            }

            if (chatRoom.superAdmin?.id === id && chatRoom.participants.length > 2) {
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

            if (chatRoom.superAdmin?.id === id && chatRoom.participants.length === 2) {
                this.res
                    .status(STATUS_CODE.FORBIDDEN)
                    .json(
                        LEAVE_GROUP_CHAT,
                        { participants: chatRoom.participants, action: "auto-superadmin" },
                        { success: false }
                    );
                return;
            }

            if (chatRoom.participants.length === 1) {
                await this.prisma.chatRoom.delete({ where: { id: chatRoomId } });
                this.res.json(LEAVE_GROUP_CHAT, { message: "You have successfully left the group chat" });
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

            if (!newSuperAdminId || !chatRoomId) {
                this.res
                    .status(STATUS_CODE.BAD_REQUEST)
                    .json(
                        TRANSFER_SUPER_ADMIN,
                        { message: "Invalid request parameters", action: "invalid-params" },
                        { success: false }
                    );
                return;
            }

            const userExits = await this.prisma.user.findUnique({
                where: { id: newSuperAdminId },
                select: { id: true },
            });

            if (!userExits?.id) {
                this.res.status(STATUS_CODE.NOT_FOUND).json(TRANSFER_SUPER_ADMIN, {
                    message: "This user does not exists",
                    action: "user",
                    notFoundUserId: newSuperAdminId,
                });
                return;
            }

            const chatRoom = await this.prisma.chatRoom.findUnique({
                where: { id: chatRoomId },
                select: {
                    id: true,
                    superAdmin: { select: { id: true } },
                    participants: { select: { id: true, fullName: true, profilePic: true, username: true } },
                },
            });

            if (!chatRoom || !chatRoom.id) {
                this.res.status(STATUS_CODE.NOT_FOUND).json(TRANSFER_SUPER_ADMIN, {
                    message: "This group does not exists",
                    action: "chat-room",
                    notFoundUser: newSuperAdminId,
                });
                return;
            }

            if (chatRoom.superAdmin?.id !== id) {
                this.res.error(
                    TRANSFER_SUPER_ADMIN,
                    "You do not have enough permissions to perform this action",
                    STATUS_CODE.FORBIDDEN
                );
                return;
            }

            const isMember = chatRoom.participants.find((member) => member.id === newSuperAdminId);

            if (!isMember?.id) {
                this.res.status(STATUS_CODE.BAD_REQUEST).json(
                    TRANSFER_SUPER_ADMIN,
                    {
                        message: "Only members of the group chat can be made super admin",
                        action: "only-members",
                    },
                    { success: false }
                );
                return;
            }

            await this.prisma.chatRoom.update({
                where: { id: chatRoomId },
                data: {
                    superAdmin: {
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
                        connect: {
                            id: newSuperAdminId,
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

    async handleAddAdmin(id: string, message: IAdminStatusChange) {
        try {
            const adminId = message.payload.adminId;
            const chatRoomId = message.payload.chatRoomId;

            if (!adminId || !chatRoomId) {
                this.res.error(MAKE_ADMIN, "Invalid params", STATUS_CODE.BAD_REQUEST);
                return;
            }

            const chatRoom = await this.prisma.chatRoom.findUnique({
                where: { id: chatRoomId },
                select: {
                    id: true,
                    participants: { select: { id: true, username: true, fullName: true, profilePic: true } },
                    superAdmin: { select: { id: true, username: true, fullName: true, profilePic: true } },
                    admins: { select: { id: true, username: true, fullName: true, profilePic: true } },
                },
            });

            if (!chatRoom) {
                this.res.error(MAKE_ADMIN, "Group not found", STATUS_CODE.NOT_FOUND);
                return;
            }

            const isUserMember = chatRoom.participants.find((member) => member.id === adminId);

            if (!isUserMember) {
                this.res.status(STATUS_CODE.FORBIDDEN).json(
                    MAKE_ADMIN,
                    {
                        message: "This person is not a member of this group",
                        action: "not-member",
                    },
                    { success: false }
                );
                return;
            }

            const hasPermission = chatRoom.admins.find((member) => member.id === id);

            if (!hasPermission) {
                this.res.status(STATUS_CODE.FORBIDDEN).json(
                    MAKE_ADMIN,
                    {
                        message: "You do not have enough permissions to perform this action",
                        action: "permission",
                    },
                    { success: false }
                );
                return;
            }

            const isUserAlreadyAdmin = chatRoom.admins.find((admin) => admin.id === adminId);

            if (isUserAlreadyAdmin) {
                this.res.error(MAKE_ADMIN, "This member is already an admin", STATUS_CODE.CONFLICT);
                return;
            }

            const updatedChatRoom = await this.prisma.chatRoom.update({
                where: { id: chatRoomId },
                data: { admins: { connect: { id: adminId } } },
                select: { id: true },
            });

            if (!updatedChatRoom) {
                this.res.error(MAKE_ADMIN, "Error while trying to make user an admin");
                return;
            }

            this.res.json(MAKE_ADMIN, { message: "Made user an admin successfully", newAdmin: isUserMember });
        } catch (error) {
            printlogs("ERROR inside handleAddAdmin():", error);
            this.res.error(MAKE_ADMIN, "There was an error trying to make this user an admin");
        }
    }

    async handleRemoveAdmin(id: string, message: IAdminStatusChange) {
        try {
            const chatRoomId = message.payload.chatRoomId;
            const adminId = message.payload.adminId;

            if (!chatRoomId || !adminId) {
                this.res.error(REMOVE_AS_ADMIN, "Invalid params", STATUS_CODE.BAD_REQUEST);
                return;
            }

            const chatRoom = await this.prisma.chatRoom.findUnique({
                where: { id: chatRoomId },
                select: {
                    id: true,
                    participants: { select: { id: true, username: true, fullName: true, profilePic: true } },
                    superAdmin: { select: { id: true, username: true, fullName: true, profilePic: true } },
                    admins: { select: { id: true, username: true, fullName: true, profilePic: true } },
                },
            });

            if (!chatRoom) {
                this.res.error(REMOVE_AS_ADMIN, "Group not found!", STATUS_CODE.NOT_FOUND);
                return;
            }

            const isUserSuperAdmin = chatRoom.superAdmin?.id === adminId;

            const hasPermission = chatRoom.admins.find((admin) => admin.id === id) || chatRoom.superAdmin?.id === id;

            if (isUserSuperAdmin || !hasPermission) {
                this.res
                    .status(STATUS_CODE.FORBIDDEN)
                    .json(REMOVE_AS_ADMIN, { message: "Cannot remove super admin" }, { success: false });
                return;
            }

            const isUserAdmin = chatRoom.admins.find((admin) => admin.id === adminId);

            if (!isUserAdmin) {
                this.res.error(REMOVE_AS_ADMIN, "This user is not an admin", STATUS_CODE.CONFLICT);
                return;
            }

            const updatedChatRoom = await this.prisma.chatRoom.update({
                where: { id: chatRoomId },
                data: { admins: { disconnect: { id: adminId } } },
                select: { id: true },
            });

            if (!updatedChatRoom) {
                this.res.error(REMOVE_AS_ADMIN, "There was an error trying to remove as admin");
                return;
            }

            this.res.json(REMOVE_AS_ADMIN, { message: "Successfully removed as admin", removedAdmin: isUserAdmin });
        } catch (error) {
            printlogs("ERROR inside handleRemoveAdmin():", error);
            this.res.error(REMOVE_AS_ADMIN, "There was an error trying to remove as admin");
        }
    }

    async getChatRoomDetails(userId: string, message: IGetChatRoomById) {
        try {
            const chatRoomId = message.payload.chatRoomId;

            const chatRoomDetails = await this.prisma.chatRoom.findUnique({
                where: { id: chatRoomId, participants: { some: { id: userId } } },
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
                this.res.error(
                    CHATROOM_DETAILS_BY_ID,
                    "This chat room does not exist or you are not a part of this chat room",
                    STATUS_CODE.NOT_FOUND
                );
                return;
            }

            const messageVisibility = await this.prisma.messageVisibility.findUnique({
                where: { chatRoomId_userId: { chatRoomId, userId } },
                select: { deletedAt: true },
            });

            printlogs("messageVisibility:", messageVisibility);

            const isGroup = chatRoomDetails.roomType === "GROUP";

            printlogs("isGroup:", isGroup);

            printlogs("filtering messages | Before:", chatRoomDetails.messages);

            const filteredMessages = chatRoomDetails.messages.filter((message) =>
                !isGroup && messageVisibility?.deletedAt ? message.sentAt >= messageVisibility.deletedAt : true
            );

            printlogs("filtering messages | After:", chatRoomDetails.messages);

            const unreadMessages = await this.prisma.message.findMany({
                where: {
                    chatRoomId,
                    readBy: { none: { id: userId } },
                },
                select: { id: true },
            });

            if (unreadMessages.length > 0) {
                await Promise.all(
                    unreadMessages.map((message) =>
                        this.prisma.message.update({
                            where: { id: message.id },
                            data: {
                                readBy: {
                                    connect: { id: userId },
                                },
                            },
                        })
                    )
                );
            }

            const modifiedChatRoomDetails = {
                ...chatRoomDetails,
                messages: filteredMessages,
                isGroup,
            };

            this.res.json(CHATROOM_DETAILS_BY_ID, modifiedChatRoomDetails);
        } catch (error) {
            printlogs("ERROR in getChatRoomDetails():", error);
            this.res.error(CHATROOM_DETAILS_BY_ID, "There was an error trying to fetch chat room details");
        }
    }

    async handleUpdateProfile(userId: string, message: IUpdateProfile) {
        const { email, username, fullName, profilePic, pictureName } = message.payload;

        if (!email || !username || !fullName || !profilePic) {
            this.res.error(UPDATE_PROFILE, "Invalid params", STATUS_CODE.BAD_REQUEST);
            return;
        }

        try {
            const userExists = await this.prisma.user.findUnique({ where: { id: userId } });

            if (!userExists) {
                this.res.error(UPDATE_PROFILE, "User not found", STATUS_CODE.NOT_FOUND);
                return;
            }

            const identityExists = await this.prisma.user.findFirst({
                where: {
                    OR: [
                        { username, id: { not: userId } },
                        { email, id: { not: userId } },
                    ],
                },
                select: { username: true, email: true },
            });

            if (identityExists) {
                const action = identityExists.username === username ? "username" : "email";
                this.res
                    .status(STATUS_CODE.CONFLICT)
                    .json(UPDATE_PROFILE, { message: `${action} already exists`, action }, { success: false });
                return;
            }

            const MAX_FILE_SIZE = 8 * 1024 * 1024; // 8 MB

            const fileSize = Buffer.byteLength(profilePic);

            if (fileSize > MAX_FILE_SIZE) {
                this.res
                    .status(STATUS_CODE.BAD_REQUEST)
                    .json(UPDATE_PROFILE, { fileSize, action: "file-size" }, { success: false });
                return;
            }

            const result = await cloudinary.v2.uploader.upload(profilePic, {
                public_id: pictureName,
                upload_preset: process.env.CLOUDINARY_PRESET_NAME,
            });

            const updatedProfile = await this.prisma.user.update({
                where: { id: userId },
                data: { username, email, profilePic: result?.secure_url, fullName },
                select: { id: true, username: true, email: true, profilePic: true, fullName: true },
            });

            this.res.json(UPDATE_PROFILE, updatedProfile);
        } catch (error) {
            printlogs("ERROR inside handleUpdateProfile()", error);
            this.res.error(UPDATE_PROFILE, "There was an issue trying to update your profile");
        }
    }

    async addUserToChat(id: string, message: IAddUserToGroupChat) {
        const { chatRoomId, addUsersId } = message.payload;

        if (!chatRoomId || !addUsersId) {
            this.res
                .status(STATUS_CODE.BAD_REQUEST)
                .json(ADD_TO_CHAT, { message: "Invalid parameters", action: "invalid-params" }, { success: false });
            return;
        }

        if (!addUsersId.length) {
            this.res
                .status(STATUS_CODE.BAD_REQUEST)
                .json(ADD_TO_CHAT, { message: "No users selected", action: "no-users" }, { success: false });
            return;
        }

        const chatRoom = await this.prisma.chatRoom.findUnique({
            where: { id: chatRoomId },
            select: {
                id: true,
                participants: { select: { id: true } },
                admins: { select: { id: true } },
                superAdmin: { select: { id: true } },
                roomType: true,
            },
        });

        if (!chatRoom || !chatRoom.id) {
            this.res
                .status(STATUS_CODE.NOT_FOUND)
                .json(
                    REMOVE_FROM_CHAT,
                    { message: "This chat room does not exists", action: "chat-room" },
                    { success: false }
                );
            return;
        }

        if (chatRoom.roomType === "DIRECT_MESSAGE") {
            this.res.status(STATUS_CODE.BAD_REQUEST).json(
                REMOVE_FROM_CHAT,
                {
                    message: "Members can only be added to group chats",
                    action: "not-group",
                },
                { success: false }
            );
            return;
        }

        const hasPermission = chatRoom.admins.find((admin) => admin.id === id) || chatRoom.superAdmin?.id === id;

        if (!hasPermission) {
            this.res.error(
                ADD_TO_CHAT,
                "You do not have the required permissions to add members to this group",
                STATUS_CODE.FORBIDDEN
            );
            return;
        }

        const usersToAdd: { id: string; username: string; fullName: string; profilePic: string }[] = [];

        for (const userId of addUsersId) {
            const user = await this.prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, username: true, fullName: true, profilePic: true },
            });

            if (!user?.id) {
                this.res
                    .status(STATUS_CODE.NOT_FOUND)
                    .json(
                        ADD_TO_CHAT,
                        { message: "This user does not exists", user, action: "user" },
                        { success: false }
                    );
                return;
            }

            const isAlreadyParticipant = chatRoom.participants.find((member) => member.id === userId);

            if (isAlreadyParticipant) {
                this.res.status(STATUS_CODE.CONFLICT).json(
                    ADD_TO_CHAT,
                    {
                        message: "The member you are trying to add is already a part of this group",
                        user,
                    },
                    { success: false }
                );
            } else {
                usersToAdd.push(user);
            }
        }

        if (usersToAdd.length < 1) {
            return;
        }

        await this.prisma.chatRoom.update({
            where: { id: chatRoomId },
            data: { participants: { connect: usersToAdd.map((user) => ({ id: user.id })) } },
            select: { id: true },
        });

        this.res.json(ADD_TO_CHAT, { message: "Users added successfully", addedUsers: usersToAdd });
    }

    async removeUserFromChat(id: string, message: IRemoveUserFromGroupChat) {
        const { chatRoomId, removeUserId } = message.payload;

        if (!chatRoomId || !removeUserId) {
            this.res
                .status(STATUS_CODE.BAD_REQUEST)
                .json(
                    REMOVE_FROM_CHAT,
                    { message: "Invalid parameters", action: "invalid-params" },
                    { success: false }
                );
            return;
        }

        const chatRoom = await this.prisma.chatRoom.findUnique({
            where: { id: chatRoomId },
            select: {
                id: true,
                participants: { select: { id: true } },
                admins: { select: { id: true } },
                superAdmin: { select: { id: true } },
                roomType: true,
            },
        });

        if (!chatRoom || !chatRoom.id) {
            this.res.error(REMOVE_FROM_CHAT, "This chat room does not exists", STATUS_CODE.NOT_FOUND);
            return;
        }

        if (chatRoom.roomType === "DIRECT_MESSAGE") {
            this.res.status(STATUS_CODE.BAD_REQUEST).json(
                REMOVE_FROM_CHAT,
                {
                    message: "Members can only be removed from group chats",
                    action: "not-group",
                },
                { success: false }
            );
            return;
        }

        const isUserAdmin = chatRoom.admins.find((member) => member.id === id);
        const isUserSuperAdmin = chatRoom.superAdmin?.id === id;
        const isRemoveUserParticipant = chatRoom.participants.find((member) => member.id === removeUserId);

        if (!isUserSuperAdmin && !isUserAdmin) {
            this.res.status(STATUS_CODE.FORBIDDEN).json(
                REMOVE_FROM_CHAT,
                {
                    message: "You do not have the required permissions to remove members from this group",
                    action: "permission-denied",
                },
                { success: false }
            );
            return;
        }

        if (!isRemoveUserParticipant) {
            this.res.status(STATUS_CODE.CONFLICT).json(
                REMOVE_FROM_CHAT,
                {
                    message: "The member you are trying to remove is not part of this group",
                    removeUserId,
                },
                { success: false }
            );
            return;
        }

        const isRemoveUserSuperAdmin = chatRoom.superAdmin?.id === removeUserId;

        if (!isUserSuperAdmin && isRemoveUserSuperAdmin) {
            this.res.status(STATUS_CODE.FORBIDDEN).json(
                REMOVE_FROM_CHAT,
                {
                    message: "Super Admin cannot be removed by an admin",
                    action: "super-admin",
                },
                { success: false }
            );
            return;
        }

        await this.prisma.chatRoom.update({
            where: { id: chatRoomId },
            data: {
                participants: { disconnect: { id: removeUserId } },
                admins: { disconnect: { id: removeUserId } },
                superAdmin: isRemoveUserSuperAdmin ? { disconnect: { id: removeUserId } } : undefined,
            },
            select: { id: true },
        });

        this.res.json(REMOVE_FROM_CHAT, {
            message: "Member removed successfully",
            removedMemberId: removeUserId,
        });
    }

    async handleChatMessageDeletion(userId: string, chatRoomId: string) {
        const deleteAt = await this.prisma.messageVisibility.upsert({
            where: { chatRoomId_userId: { chatRoomId, userId } },
            update: { deletedAt: new Date() },
            create: { chatRoomId, userId, deletedAt: new Date() },
            select: { deletedAt: true },
        });

        this.res.send(DELETE_CHAT, { message: "Chats deleted", deleteAt, isGroup: false });
    }

    async handleGroupChatDeletion(userId: string, message: IDeleteGroupChat) {
        try {
            const chatRoomId = message.payload.chatRoomId;

            if (!chatRoomId) {
                this.res.error(DELETE_CHAT, "Invalid params", STATUS_CODE.BAD_REQUEST);
                return;
            }

            const chatRoom = await this.prisma.chatRoom.findUnique({
                where: { id: chatRoomId },
                select: {
                    id: true,
                    roomType: true,
                    superAdmin: { select: { id: true } },
                    participants: { select: { id: true } },
                },
            });

            if (!chatRoom) {
                this.res.error(DELETE_CHAT, "This group chat does not exist", STATUS_CODE.NOT_FOUND);
                return;
            }

            const isGroup = chatRoom.roomType === "GROUP";

            if (!isGroup) {
                const isUserMember = chatRoom.participants.some((member) => member.id === userId);
                if (!isUserMember) {
                    this.res
                        .status(STATUS_CODE.BAD_REQUEST)
                        .json(
                            DELETE_CHAT,
                            { message: "Not a part of this chat", action: "not-member" },
                            { success: false }
                        );
                    return;
                }
                this.handleChatMessageDeletion(userId, chatRoomId);
                return;
            }

            const hasPermission = chatRoom.superAdmin?.id === userId;

            if (!hasPermission) {
                this.res.error(
                    DELETE_CHAT,
                    "You do not have permission to delete this group chat",
                    STATUS_CODE.FORBIDDEN
                );
                return;
            }

            const deletedChatRoom = await this.prisma.chatRoom.delete({
                where: { id: chatRoomId },
                select: { id: true },
            });

            if (!deletedChatRoom) {
                this.res.error(DELETE_CHAT, "There was an error trying to delete this group chat");
                return;
            }

            this.res.json(DELETE_CHAT, { message: "Deleted successfully", isGroup: true });
        } catch (error) {
            printlogs("ERROR inside :", error);
            this.res.error(DELETE_CHAT, "There was an error trying to delete this chat");
        }
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
                    this.getChatRoomDetails(id, message);
                    break;
                case TRANSFER_SUPER_ADMIN:
                    this.handleSuperAdminTranferAndLeaveGroupChat(id, message);
                    break;
                case CREATE_GROUP:
                    this.handleGroupCreation(id, message);
                    break;
                case CHANGE_GROUP_NAME:
                    this.handleChangeGroupName(id, message);
                    break;
                case LEAVE_GROUP_CHAT:
                    this.handleLeaveGroupChat(id, message);
                    break;
                case REMOVE_FROM_CHAT:
                    this.removeUserFromChat(id, message);
                    break;
                case DELETE_CHAT:
                    this.handleGroupChatDeletion(id, message);
                    break;
                case ADD_TO_CHAT:
                    this.addUserToChat(id, message);
                    break;
                case MAKE_ADMIN:
                    this.handleAddAdmin(id, message);
                    break;
                case REMOVE_AS_ADMIN:
                    this.handleRemoveAdmin(id, message);
                    break;
                // start the backend from here
                case SEND_MESSAGE:
                    this.handleNewMessage(id, message);
                    break;
                case READ_MESSAGE:
                    this.handleMessageRead(id, message);
                    break;
                case UPDATE_PROFILE:
                    this.handleUpdateProfile(id, message);
                    break;
                default:
                    break;
            }
        });
    }
}
