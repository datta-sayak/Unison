import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { clientSocket, disconnectSocket } from "@/lib/socket";
import { Socket } from "socket.io-client";
import { Session } from "next-auth";
import type { Song, Participant, ChatMessage } from "@/lib";
import { YouTubePlayerHandle } from "@/components/room/YouTubePlayerSection";

interface UseRoomSocketProps {
    roomId: string;
    session: Session | null;
    isChecking: boolean;
    playerRef: React.RefObject<YouTubePlayerHandle> | null;
}

export function useRoomSocket({ isChecking, roomId, session, playerRef }: UseRoomSocketProps) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const hasInitializedSocket = useRef(false);
    const [queue, setQueue] = useState<Song[]>([]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [onlineUsers, setonlineUsers] = useState<Participant[]>([]);

    useEffect(() => {
        if (!roomId || !session?.user || hasInitializedSocket.current || isChecking) return;

        hasInitializedSocket.current = true;
        const socketInstance = clientSocket();

        const handleConnect = () => {
            console.log("Connected to Socket with roomId:", roomId);
            socketInstance.emit(
                "join_room",
                {
                    roomId,
                    userId: session.user.email,
                    userName: session.user.name,
                    userAvatar: session.user.image || "",
                },
                () => {
                    socketInstance.emit("request_sync", roomId);
                },
            );

            const fetchInitialQueue = async () => {
                try {
                    const response = await axios.get(`/api/queue/fetch?roomCode=${roomId}`);

                    if (!response.data.data) return;
                    else {
                        const receivedQueue: Song[] = response.data.data.queue;
                        setQueue(receivedQueue);
                    }
                } catch (error) {
                    console.error("Failed to fetch initial queue:", error);
                }
            };

            // Not awaiting fetchInitialQueue() so that it can do it's task in background,
            // and wont block the current execution
            fetchInitialQueue();
        };

        const handleRoomParticipants = (
            users: Array<{
                socketId: string;
                userId: string;
                userName: string;
                userAvatar: string;
            }>,
        ) => {
            const participants: Participant[] = users.map(user => ({
                id: user.socketId,
                name: user.userName,
                avatar: user.userAvatar,
                isHost: user.userId === session.user?.email,
                isActive: true,
            }));
            setonlineUsers(participants);
        };

        const handleIncomingMessage = (data: {
            roomId: string;
            userEmail: string;
            userName: string;
            userAvatar: string;
            content: string;
        }) => {
            const newMessage: ChatMessage = {
                id: `msg_${data.roomId}_${Date.now()}_${data.userEmail}`,
                user: data.userName,
                avatar: data.userAvatar || data.userName.substring(0, 2).toUpperCase(),
                message: data.content,
                timestamp: new Date().toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                }),
            };
            setMessages(prev => [newMessage, ...prev]);
        };

        const handleUpdatedQueue = (rawQueue: Song[]) => {
            setQueue(rawQueue);
        };

        const handleProvideSync = (data: { requesterId: string }) => {
            if (playerRef?.current) {
                const playerState = playerRef.current.getPlayerState();

                if (playerState) {
                    socketInstance.emit("res_provide_sync", {
                        roomId,
                        requesterId: data.requesterId,
                        isPlaying: playerState.isPlaying,
                        timestamp: playerState.timestamp,
                        currentSongIndex: playerState.currentSongIndex,
                        senderId: session.user.email,
                        sentAt: playerState.sentAt,
                    });
                }
            }
        };

        const handleReceiveSync = async (data: {
            isPlaying: boolean;
            timestamp: number;
            currentSongIndex: number;
            sentAt: number;
        }) => {
            if (playerRef?.current) {
                await playerRef.current.applySync(data);
            }
        };

        if (socketInstance.connected) {
            handleConnect();
        }

        socketInstance.on("connect", handleConnect);
        socketInstance.on("room_participants", handleRoomParticipants);
        socketInstance.on("message", handleIncomingMessage);
        socketInstance.on("updated_queue", handleUpdatedQueue);
        socketInstance.on("provide_sync", handleProvideSync);
        socketInstance.on("receive_sync", handleReceiveSync);

        // This is not a issue as we are checking "hasInitializedSocket" and if its true we dont set this
        // eslint-disable-next-line
        setSocket(socketInstance);
    }, [roomId, session?.user, isChecking, playerRef]);

    // Cleanup when the user logouts or closes tab
    useEffect(() => {
        return () => {
            hasInitializedSocket.current = false;
            if (socket) {
                disconnectSocket();
            }
        };
    }, [socket]);

    return { socket, queue, messages, onlineUsers };
}
