import { Server, Socket } from "socket.io";

type UserData = {
    socketId: string;
    userId: string;
    userName: string;
    userAvatar: string;
};

/**
 * @param Record<RoomId, UserData[]>
 */
const roomParticipants: Record<string, UserData[]> = {};

export function roomEvents(io: Server, socket: Socket) {
    socket.on("join_room", (data: { roomId: string; userId: string; userName: string; userAvatar: string }) => {
        socket.join(data.roomId);
        if (!roomParticipants[data.roomId]) roomParticipants[data.roomId] = [];

        roomParticipants[data.roomId]!.push({
            socketId: socket.id,
            userId: data.userId,
            userName: data.userName,
            userAvatar: data.userAvatar,
        });

        io.to(data.roomId).emit("room_participants", roomParticipants[data.roomId]!);
        console.log(`User ${data.userId} joined room ${data.roomId}`);
    });

    socket.on("disconnect", () => {
        for (const roomId in roomParticipants) {
            const room = roomParticipants[roomId];
            if (!room) continue;

            const userIndex = room.findIndex(u => u.socketId === socket.id);
            if (userIndex === -1) continue;

            const user = room.splice(userIndex, 1)[0];
            if (user) {
                io.to(roomId).emit("room_participants", room);
                console.log(`User ${user.userId} left room ${roomId}`);
            }

            if (room.length === 0) delete roomParticipants[roomId];
        }
    });
}
