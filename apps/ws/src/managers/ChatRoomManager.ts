import { Redis } from "ioredis";
import { IUser } from "./UserManager.js";
import redis from "../redis/client.js";
import { GET_DM } from "./Messages.js";
import { prisma } from "@instachat/db/client";
import { TOP_DM } from "./RedisKeys.js";

// This is completely wrong, start from scratch to make it work. Even the prisma schema is wrong, fix that first

export class ChatRoomManager {
    private redis: Redis = redis;
    private prisma: typeof prisma = prisma;

    getRecentMessage(user: IUser) {}

    private userHandler(user: IUser) {
        user.socket.on("message", async (data) => {
            const message = JSON.parse(data.toString());

            if (message.type === GET_DM) {
                const dm = await this.getUserDm(user.id);
                user.socket.send(dm);
            }
        });
    }

    private async getUserDm(id: string) {
        const cachedDm = await redis.zrangebyscore(TOP_DM, "-inf", "+inf");

        if (!cachedDm.length) {
            const dm = await prisma.user.findMany({
                where: { id },
            });
        }

        return cachedDm.map((dm) => JSON.parse(dm));
    }
}
