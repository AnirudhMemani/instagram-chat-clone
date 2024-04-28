import { Redis } from "ioredis";

const getRedisClient = () => {
    return new Redis();
};

const redis = getRedisClient();

export const connectToRedis = async () => {
    redis.on("error", (error) => console.error(error));

    redis.on("connect", () => console.log("Connected to Redis"));

    redis.on("close", () => console.log("Disconnected from Redis"));
};

export default redis;
