import { Redis } from "ioredis";
import WebSocket from "ws";
import redis from "../redis/client.js";

export interface IUser {
    id: string;
    fullName: string;
    profilePic: string;
    socket: WebSocket;
}

export class UserManager {
    private redis: Redis = redis;
    constructor(
        id: string,
        fullName: string,
        profilePic: string,
        socket: WebSocket
    ) {
        const userInfo = {
            id,
            fullName,
            profilePic,
            socket,
        };
        this.redis.hset(id, "userInfo", JSON.stringify(userInfo));
    }
}
