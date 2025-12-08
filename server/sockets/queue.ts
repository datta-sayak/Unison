import { Server, Socket } from "socket.io";

export function queueEvents(io: Server, socket: Socket) {
    // Queue add event
    socket.on("queue-add", (data: { roomCode: string; songCode: string }) => {
        console.log(`🎵 Song ${data.songCode} added to queue in room ${data.roomCode}`);
        io.to(data.roomCode).emit("queue-updated", {
            action: "add",
            songCode: data.songCode,
        });
    });

    // Queue remove event
    socket.on("queue-remove", (data: { roomCode: string; songCode: string }) => {
        console.log(`🗑️ Song ${data.songCode} removed from queue in room ${data.roomCode}`);
        io.to(data.roomCode).emit("queue-updated", {
            action: "remove",
            songCode: data.songCode,
        });
    });

    // Queue vote event
    socket.on("queue-vote", (data: { roomCode: string; songCode: string; direction: "up" | "down" }) => {
        console.log(`👍 Vote ${data.direction} for song ${data.songCode} in room ${data.roomCode}`);
        io.to(data.roomCode).emit("queue-updated", {
            action: "vote",
            songCode: data.songCode,
            direction: data.direction,
        });
    });
}
