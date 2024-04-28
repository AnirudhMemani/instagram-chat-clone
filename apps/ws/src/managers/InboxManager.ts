import WebSocket from "ws";
import redis from "../redis/client.js";
import { prisma } from "@instachat/db/client";
import { Redis } from "ioredis";
import {
    FIND_USERS,
    GET_DM,
    NEW_MESSAGE,
    START_CONVO,
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
        socket.send(
            JSON.stringify({
                type: FIND_USERS,
                payload: users,
            })
        );
    }

    async handleDMs(socket: WebSocket, id: string, message: IMessage) {
        const selectedUsers = message as IStartConvoMessage;
        const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
        let groupProfilePic;
        let chatRoomName: string;
        const isGroup = selectedUsers.payload.groupDetails;

        if (selectedUsers.payload.groupDetails) {
            const { name, profilePic, pictureName } =
                selectedUsers.payload.groupDetails;

            const fileSize = Buffer.byteLength(profilePic);

            if (fileSize > MAX_FILE_SIZE) {
                return;
            }

            chatRoomName = name;
            const decodedImage = Buffer.from(profilePic, "base64");

            await fs.mkdir("pictures", { recursive: true });
            groupProfilePic = `pictures/${crypto.randomUUID()}~${pictureName}`;
            await fs.writeFile(groupProfilePic, decodedImage);
        } else {
            chatRoomName = selectedUsers.payload.userDetails[0].fullName;
        }

        const existingChatRoom = await prisma.chatRoom.findFirst({
            where: {
                name: chatRoomName,
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
                Group: {
                    select: {
                        id: true,
                        name: true,
                        picture: true,
                        createdAt: true,
                        members: {
                            select: {
                                id: true,
                                fullName: true,
                                username: true,
                                profilePic: true,
                            },
                        },
                        adminOf: {
                            select: {
                                id: true,
                            },
                        },
                        superAdmin: {
                            select: {
                                id: true,
                            },
                        },
                    },
                },
            },
        });

        if (existingChatRoom) {
            socket.send(
                JSON.stringify({
                    type: START_CONVO,
                    payload: {
                        chatRoomId: existingChatRoom.id,
                        chatRoomName: existingChatRoom.name,
                        createdAt: existingChatRoom.createdAt,
                        messageDetails: existingChatRoom.messages || [],
                        groupDetails: existingChatRoom.Group || [],
                    },
                })
            );
            return;
        } else {
            const newChatRoom = await prisma.chatRoom.create({
                data: {
                    name: chatRoomName,
                    createdAt: new Date(Date.now()),
                    participants: {
                        connect: selectedUsers.payload.userDetails.map(
                            (user) => ({
                                id: user.id,
                            })
                        ),
                    },
                    Group: {
                        ...(isGroup
                            ? {
                                  create: {
                                      name: chatRoomName,
                                      picture: groupProfilePic!,
                                      superAdminId: id,
                                      adminOf: { connect: { id } },
                                      createdAt: new Date(Date.now()),
                                      members: {
                                          connect:
                                              selectedUsers.payload.userDetails.map(
                                                  (user) => ({
                                                      id: user.id,
                                                  })
                                              ),
                                      },
                                  },
                              }
                            : {}),
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
                        ...(isGroup
                            ? {
                                  select: {
                                      name: true,
                                      superAdminId: true,
                                      adminOf: {
                                          select: { id: true },
                                      },
                                      chatRoomId: true,
                                      picture: true,
                                      createdAt: true,
                                  },
                              }
                            : {}),
                    },
                },
            });
            socket.send(
                JSON.stringify({
                    type: START_CONVO,
                    payload: {
                        chatRoomName: newChatRoom.name,
                        createdAt: newChatRoom.createdAt,
                        participants: newChatRoom.participants,
                        ...(newChatRoom.Group && {
                            groupDetails: newChatRoom.Group,
                        }),
                    },
                })
            );
        }
    }

    async handleIncomingMessages(id: string, socket: WebSocket) {
        console.log("Inside handle incoming request");
        socket.on("message", async (data) => {
            console.log("on message");
            const message = JSON.parse(data.toString());
            console.log("message", message);

            switch (message.type) {
                case NEW_MESSAGE:
                    this.handleNewMessage(message);
                    break;
                case GET_DM:
                    this.getDMs(socket, id, message);
                    break;
                case FIND_USERS:
                    this.getUsers(socket, id);
                    break;
                case START_CONVO:
                    this.handleDMs(socket, id, message);
                    break;
            }
        });
    }
}
