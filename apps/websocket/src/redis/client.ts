import { Redis } from "ioredis";

const getRedisClient = () => {
  const port = process.env.REDIS_PORT || 6379;
  return new Redis({
    host: process.env.REDIS_HOST,
    port: Number(port),
    password: process.env.REDIS_PASSWORD,
  });
};

const redis = getRedisClient();
const redisPublisher = redis.duplicate();
const redisSubscriber = redis.duplicate();

export const connectToRedis = async () => {
  redis.on("error", (error) => console.error(error));

  redis.on("connect", () => console.log("Connected to Redis"));

  redis.on("close", () => console.log("Disconnected from Redis"));
};

export { redis, redisPublisher, redisSubscriber };
