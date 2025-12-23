import { Server } from "socket.io";
import express from "express";
import { roomEvents } from "./sockets/room.js";
import { messageEvents } from "./sockets/message.js";
import { queueEvents } from "./sockets/queue.js";
import { playbackEvents } from "./sockets/playback.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.get("/", (_req: express.Request, res: express.Response) => {
    const stats = {
        uptime: Math.floor(process.uptime()) + " Seconds",
        memoryUsage: {
            // Bytes -> MegBytes
            rss: Math.round(process.memoryUsage().rss / 1024 / 1024) + " MB",
            heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + " MB",
            heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + " MB",
        },
        serverTime: new Date().toISOString(),
    };
    res.json({
        message: "Unison server",
        status: 200,
        availability: "Online",
        ...stats,
    });
});

const server = app.listen(process.env.PORT || 4000, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT || 4000}`);
});

export const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV || "http://localhost:3000",
    },
});

io.on("connection", async socket => {
    console.log("connected:", socket.id);

    roomEvents(io, socket);
    messageEvents(io, socket);
    queueEvents(io);
    playbackEvents(io, socket);

    socket.on("disconnect", () => {
        console.log("disconnected:", socket.id);
    });
});
