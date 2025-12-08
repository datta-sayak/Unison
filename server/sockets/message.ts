import { Server, Socket } from "socket.io";

type MessageData = {
    roomId: string;
    userId: string;
    userName: string;
    userAvatar: string;
    content: string;
};

export function messageEvents(io: Server, socket: Socket) {
    socket.on("send_message", (data: MessageData) => {
        io.to(data.roomId).emit("message", {
            roomId: data.roomId,
            userId: data.userId,
            userName: data.userName,
            userAvatar: data.userAvatar,
            content: data.content,
        });
    });
}
