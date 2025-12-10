import { Server } from "socket.io";
import express from "express";
import { roomEvents } from "./sockets/room.js";
import { messageEvents } from "./sockets/message.js";
import { queueEvents } from "./sockets/queue.js";
import dotenv from "dotenv";
dotenv.config();

const app = express();

app.get("/", (_req: express.Request, res: express.Response) => {
    res.send("Hello, Unison Server!");
});

const server = app.listen(process.env.PORT || 4000, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT || 4000}`);
});

export const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === "production" ? "https://unisonmedia.vercel.app" : "http://localhost:3000",
    },
});

io.on("connection", async socket => {
    console.log("connected:", socket.id);

    roomEvents(io, socket);
    messageEvents(io, socket);
    queueEvents(io, socket);

    socket.on("disconnect", () => {
        console.log("disconnected:", socket.id);
    });
});
