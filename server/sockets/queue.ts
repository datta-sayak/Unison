import { Server } from "socket.io";
import { redis, redisSubscriber } from "../redis.js";
import { QueueSort } from "../lib/queueSort.js";

let isSubsribed = false;

export function queueEvents(io: Server) {
    if (!isSubsribed) {
        redisSubscriber.subscribe("updated_queue", async (roomCode: string) => {
            isSubsribed = true;
            try {
                const hashKey = `roomId:${roomCode}`;
                const queue = await redis.hGetAll(hashKey);

                const parsedQueue = Object.values(queue)
                    .map(song => {
                        try {
                            return JSON.parse(song);
                        } catch {
                            return null;
                        }
                    })
                    .filter(Boolean);

                // Sort Queue using custom logic
                const sortedQueue = QueueSort(parsedQueue);
                io.to(roomCode).emit("updated_queue", sortedQueue);
            } catch (error) {
                console.error("Failed to emit queue: ", error);
            }
        });
    }
}
