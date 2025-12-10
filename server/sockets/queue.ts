import { Server, Socket } from "socket.io";
import { redis, redisSubscriber } from "../redis.js";

let isSubsribed = false;

export function queueEvents(io: Server, socket: Socket) {
    if (!isSubsribed) {
        redisSubscriber.subscribe("updated_queue", async roomCode => {
            try {
                const rawQueue = await redis.zRange(roomCode, 0, -1);
                const queue = rawQueue.map(v => JSON.parse(v));
                io.to(roomCode).emit("updated_queue", queue);
            } catch (error) {
                console.error("Failed to emit queue: ", error);
            }
        });

        isSubsribed = true;
    }

    socket.on("queue-vote", (data: { roomCode: string; songCode: string; direction: "up" | "down" }) => {
        console.log(`👍 Vote ${data.direction} for song ${data.songCode} in room ${data.roomCode}`);
        io.to(data.roomCode).emit("queue-updated", {
            action: "vote",
            songCode: data.songCode,
            direction: data.direction,
        });
    });
}
