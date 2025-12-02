import { Server, Socket } from "socket.io"
import express from "express"

type MessageData = {
    roomId: string
    userId: string
    userName: string
    userAvatar: string
    content: string
}

type UserData = {
    socketId: string
    userId: string
    userName: string
    userAvatar: string
}

const roomParticipants: Record<string, UserData[]> = {}

const app = express()

app.get("/", (req: express.Request, res: express.Response) => {
    res.send("Hello, Unison Server!")
})

const server = app.listen(process.env.PORT || 4000, () => {
    console.log(`Server is running on http://localhost:${process.env.PORT || 4000}`)
}) 

const io = new Server(server, {
    cors: {
        origin: process.env.NODE_ENV === "production" ? "https://unisonmedia.vercel.app" : "http://localhost:3000",
    }
})

io.on("connection", (socket: Socket) => {    
    socket.on("join_room", (data: { roomId: string; userId: string; userName: string; userAvatar: string }) => {
        socket.join(data.roomId)
        if (!roomParticipants[data.roomId])     roomParticipants[data.roomId] = []
        
        roomParticipants[data.roomId]!.push({
            socketId: socket.id,
            userId: data.userId,
            userName: data.userName,
            userAvatar: data.userAvatar
        })
        
        io.to(data.roomId).emit("room_participants", roomParticipants[data.roomId]!)
        console.log(`User ${data.userId} joined room ${data.roomId}`)
    })

    socket.on("send_message", (data: MessageData) => {
        io.to(data.roomId).emit("message", {
            roomId: data.roomId,
            userId: data.userId,
            userName: data.userName,
            userAvatar: data.userAvatar,
            content: data.content
        })
    })

    socket.on("disconnect", () => {
        for (const roomId in roomParticipants) {
            const room = roomParticipants[roomId]
            if (!room) continue
            
            const userIndex = room.findIndex(u => u.socketId === socket.id)
            if (userIndex === -1) continue
            
            const user = room.splice(userIndex, 1)[0]
            if (user) {
                io.to(roomId).emit("room_participants", room)
                console.log(`User ${user.userId} left room ${roomId}`)
            }
            
            if (room.length === 0) delete roomParticipants[roomId]
        }
    })
})