"use client";

import { useState, Suspense, useEffect, useRef } from "react";
import { Music, Users, MessageCircle, Info } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { io, Socket } from "socket.io-client";
import { toast } from "sonner";
import axios from "axios";
import { QueueSection } from "@/components/room/QueueSection";
import { MembersSection } from "@/components/room/MembersSection";
import { ChatSection } from "@/components/room/ChatSection";
import { InfoSection } from "@/components/room/InfoSection";
import { YouTubePlayerSection } from "@/components/room/YouTubePlayerSection";
import LoadingContext from "@/components/LoadingContext";
import type { Song, Participant, SongInput, ChatMessage, RoomUserFromAPI } from "@/lib";

function RoomPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const roomId = searchParams.get("id");
    const { data: session, status } = useSession();
    const socketRef = useRef<Socket | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);
    const hasInitializedSocket = useRef(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [onlineUsers, setonlineUsers] = useState<Participant[]>([]);
    const [allUsers, setAllUsers] = useState<Participant[]>([]);
    const [queue, setQueue] = useState<Song[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [activeSection, setActiveSection] = useState("queue");
    const [currentSong] = useState<Song | null>(null);

    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") {
            router.push(`/api/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`);
        }
    }, [status, router]);

    useEffect(() => {
        if (!roomId || !session?.user || hasInitializedSocket.current) return;

        hasInitializedSocket.current = true;
        console.log("Connecting to socket with roomId:", roomId);
        const socketUrl =
            process.env.NODE_ENV === "production"
                ? process.env.NEXT_PUBLIC_WEBSOCKET_SERVER_URL?.replace("http://", "wss://").replace(
                      "https://",
                      "wss://",
                  )
                : process.env.NEXT_PUBLIC_WEBSOCKET_SERVER_URL || "http://localhost:4000";

        const socketInstance = io(socketUrl, {
            reconnection: true,
            reconnectionDelay: 1000,
            reconnectionAttempts: 5,
        });

        socketInstance.on("connect", () => {
            socketInstance.emit("join_room", {
                roomId,
                userId: session.user.email || "",
                userName: session.user.name || "Anonymous",
                userAvatar: session.user.image || "",
            });
        });

        socketInstance.on(
            "room_participants",
            (
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
            },
        );

        socketInstance.on(
            "message",
            (data: { roomId: string; userId: string; userName: string; userAvatar: string; content: string }) => {
                const newMessage: ChatMessage = {
                    id: `msg_${data.roomId}_${Date.now()}_${data.userId}`,
                    user: data.userName,
                    avatar: data.userAvatar || data.userName.substring(0, 2).toUpperCase(),
                    message: data.content,
                    timestamp: new Date().toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                    }),
                };
                setMessages(prev => [newMessage, ...prev]);
            },
        );
        socketRef.current = socketInstance;

        return () => {
            hasInitializedSocket.current = false;
            socketInstance.disconnect();
        };
    }, [roomId, session?.user]);

    useEffect(() => {
        if (!roomId || !session?.user) return;

        const fetchRoomUsers = async () => {
            try {
                const response = await axios.get(`/api/roomusers?roomCode=${roomId}`);
                const roomUsers = response.data;

                const users: Participant[] = roomUsers.map((roomUser: RoomUserFromAPI) => ({
                    id: roomUser.userId,
                    name: roomUser.user.name || roomUser.user.email,
                    avatar: roomUser.user.avatarUrl || roomUser.user.name?.substring(0, 2).toUpperCase(),
                    isHost: false, // You might want to determine this from the room creator
                    isActive: true, // Assume active for now, could be enhanced with lastSeen logic
                }));

                setAllUsers(users);
            } catch (error) {
                console.error("Failed to fetch room users:", error);
            }
        };

        fetchRoomUsers();
    }, [roomId, session?.user]);

    useEffect(() => {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth",
        });
    }, [activeSection]);

    const handleAddSong = (song: SongInput) => {
        const newSong: Song = {
            ...song,
            requestedBy: session?.user?.name,
            votes: 0,
        };
        setQueue([...queue, newSong]);
    };

    const handleVote = (id: string, direction: "up" | "down") => {
        setQueue(
            queue.map(song =>
                song.id === id
                    ? {
                          ...song,
                          votes: direction === "up" ? song.votes + 1 : Math.max(0, song.votes - 1),
                      }
                    : song,
            ),
        );
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/join?roomId=${roomId}`);
        toast.success("Room link copied to clipboard!");
    };

    const handleLeaveRoom = () => {
        if (socketRef.current) {
            socketRef.current.disconnect();
        }
        router.push("/dashboard");
    };

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        socketRef.current.emit("send_message", {
            roomId,
            userId: session.user.email,
            userName: session.user.name,
            userAvatar: session.user.image || session.user.name?.substring(0, 2).toUpperCase(),
            content: newMessage,
        });

        setNewMessage("");
    };

    if (!roomId) return <LoadingContext />;

    return (
        <main className="min-h-screen bg-background flex flex-col">
            {/* YouTube Player Section */}
            <YouTubePlayerSection currentSong={currentSong} />

            {/* Main Content Area - Scrollable */}
            <div ref={contentRef} className="flex-1 overflow-y-auto">
                {/* Section Tabs */}
                <div className="flex gap-1 sticky top-0 z-30 bg-card/95 backdrop-blur-sm shadow-sm p-2 max-w-4xl mx-auto">
                    <button
                        onClick={() => setActiveSection("queue")}
                        className={`flex-1 px-3 py-2.5 text-sm font-medium transition-all rounded-lg flex flex-col items-center gap-1.5 ${
                            activeSection === "queue"
                                ? "bg-accent text-accent-foreground shadow-md"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                    >
                        <Music className="w-5 h-5" />
                        <span className="text-xs font-semibold">Queue</span>
                    </button>
                    <button
                        onClick={() => setActiveSection("members")}
                        className={`flex-1 px-3 py-2.5 text-sm font-medium transition-all rounded-lg flex flex-col items-center gap-1.5 ${
                            activeSection === "members"
                                ? "bg-accent text-accent-foreground shadow-md"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                    >
                        <Users className="w-5 h-5" />
                        <span className="text-xs font-semibold">Members</span>
                    </button>
                    <button
                        onClick={() => setActiveSection("chat")}
                        className={`flex-1 px-3 py-2.5 text-sm font-medium transition-all rounded-lg flex flex-col items-center gap-1.5 ${
                            activeSection === "chat"
                                ? "bg-accent text-accent-foreground shadow-md"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                    >
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-xs font-semibold">Chat</span>
                    </button>
                    <button
                        onClick={() => setActiveSection("info")}
                        className={`flex-1 px-3 py-2.5 text-sm font-medium transition-all rounded-lg flex flex-col items-center gap-1.5 ${
                            activeSection === "info"
                                ? "bg-accent text-accent-foreground shadow-md"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                    >
                        <Info className="w-5 h-5" />
                        <span className="text-xs font-semibold">Info</span>
                    </button>
                </div>

                {/* Queue Section */}
                {activeSection === "queue" && (
                    <QueueSection queue={queue} handleAddSong={handleAddSong} handleVote={handleVote} />
                )}

                {/* Members Section */}
                {activeSection === "members" && <MembersSection allUsers={allUsers} onlineUsers={onlineUsers} />}

                {/* Chat Section */}
                {activeSection === "chat" && (
                    <ChatSection
                        messages={messages}
                        newMessage={newMessage}
                        setNewMessage={setNewMessage}
                        handleSendMessage={handleSendMessage}
                    />
                )}

                {/* Info Section */}
                {activeSection === "info" && (
                    <InfoSection
                        roomId={roomId}
                        allUsers={allUsers}
                        queue={queue}
                        handleCopyLink={handleCopyLink}
                        handleLeaveRoom={handleLeaveRoom}
                    />
                )}
            </div>
        </main>
    );
}

export default function RoomPage() {
    return (
        <Suspense fallback={<LoadingContext />}>
            <RoomPageContent />
        </Suspense>
    );
}
