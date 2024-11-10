import { prisma } from "@instachat/db/client";

export const getChatRoom = async (chatRoomId: string, participantId?: string) => {
    return await prisma.chatRoom.findUnique({
        where: { id: chatRoomId, participants: participantId ? { some: { id: participantId } } : undefined },
        select: {
            id: true,
            picture: true,
            roomType: true,
            participants: { select: { id: true, username: true, fullName: true, profilePic: true } },
            admins: { select: { id: true, username: true, fullName: true, profilePic: true } },
            superAdmin: { select: { id: true, username: true, fullName: true, profilePic: true } },
            createdAt: true,
            nameUpdatedAt: true,
            pictureUpdatedAt: true,
            createdBy: { select: { id: true, username: true, fullName: true, profilePic: true } },
        },
    });
};

export const getLatestChatRoomMessages = async (
    userId: string,
    queryOptions?: { take?: number; skip?: number; orderBy?: "asc" | "desc" }
) => {
    return await prisma.chatRoom.findMany({
        where: { participants: { some: { id: userId } } },
        select: {
            id: true,
            picture: true,
            name: true,
            roomType: true,
            latestMessage: {
                select: {
                    id: true,
                    content: true,
                    sentAt: true,
                    readBy: { select: { id: true, username: true, fullName: true, profilePic: true } },
                    sentBy: { select: { id: true, username: true, fullName: true, profilePic: true } },
                },
            },
            createdBy: { select: { id: true, username: true, fullName: true, profilePic: true } },
            participants: { select: { id: true, username: true, profilePic: true, fullName: true } },
            createdAt: true,
        },
        orderBy: [
            {
                createdAt: "desc",
            },
            {
                latestMessage: {
                    sentAt: queryOptions?.orderBy ?? "desc",
                },
            },
        ],
        take: queryOptions?.take ?? undefined,
        skip: queryOptions?.skip ?? undefined,
    });
};
