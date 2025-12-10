import { createClient } from "redis";

export const redis = createClient();

export const redisSubscriber = createClient()
redis.on("error", err => console.error("Redis Client Error", err));

await redis.connect();
await redisSubscriber.connect();