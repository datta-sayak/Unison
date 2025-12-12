import { Socket, Server } from "socket.io";

interface Playback {
    roomId: string;
    isPlaying: boolean;
    timestamp: number;
}

interface ChangeSong {
    roomId: string;
    currentSongIndex: number;
}

interface Sync extends Playback, ChangeSong {
    requesterId: string;
}

export function playbackEvents(io: Server, socket: Socket) {
    socket.on("playback_controls", (data: Playback) => {
        socket.to(data.roomId).emit("playback_controls", {
            isPlaying: data.isPlaying,
            timestamp: data.timestamp,
        });
    });

    socket.on("change_song", (data: ChangeSong) => {
        socket.to(data.roomId).emit("change_song", {
            currentSongIndex: data.currentSongIndex,
        });
    });

    socket.on("request_sync", (roomId: string) => {
        socket.to(roomId).emit("provide_sync", {
            requesterId: socket.id,
        });
    });

    socket.on("res_provide_sync", (data: Sync) => {
        socket.to(data.requesterId).emit("receive_sync", {
            isPlaying: data.isPlaying,
            timestamp: data.timestamp,
            currentSongIndex: data.currentSongIndex,
        });
    });
}
