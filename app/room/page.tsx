"use client";

import { useState, Suspense, useEffect, useRef } from "react";
import { Music, Users, MessageCircle, Info, List } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Socket } from "socket.io-client";
import { clientSocket, disconnectSocket } from "@/lib/socket";
import { toast } from "sonner";
import axios from "axios";
import { QueueSection } from "@/components/room/QueueSection";
import { SongSection } from "@/components/room/SongSection";
import { MembersSection } from "@/components/room/MembersSection";
import { ChatSection } from "@/components/room/ChatSection";
import { InfoSection } from "@/components/room/InfoSection";
import { YouTubePlayerSection } from "@/components/room/YouTubePlayerSection";
import LoadingContext from "@/components/LoadingContext";
import type { Song, Participant, ChatMessage, RoomUserFromAPI, SongMetaData } from "@/lib";

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
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") {
            router.push(`/api/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`);
        }
    }, [status, router]);

    useEffect(() => {
        if (!roomId || !session?.user || status === "loading") return;

        const checkUserPresentInRoom = async () => {
            try {
                setIsChecking(true);
                const { data } = await axios.get(`/api/roomusers?roomCode=${roomId}`);
                const isMember = data.some((roomUsers: RoomUserFromAPI) => roomUsers.user.email === session.user.email);

                if (!isMember) {
                    toast.info("You need to join this room");
                    router.push(`/join?roomId=${roomId}`);
                    return;
                }
                setIsChecking(false);
            } catch (error) {
                console.error("Failed to check room membership:", error);
                toast.error("Failed to join room");
                router.push("/dashboard");
            }
        };

        checkUserPresentInRoom();
    }, [roomId, session?.user, status, router]);

    // For auto scroll to bottom of the page
    useEffect(() => {
        window.scrollTo({
            top: document.documentElement.scrollHeight,
            behavior: "smooth",
        });
    }, [activeSection]);

    useEffect(() => {
        if (!roomId || !session?.user || hasInitializedSocket.current || isChecking) return;

        hasInitializedSocket.current = true;
        const socketInstance = clientSocket();

        const handleConnect = () => {
            console.log("Connected to Socket with roomId:", roomId);
            socketInstance.emit("join_room", {
                roomId,
                userId: session.user.email,
                userName: session.user.name,
                userAvatar: session.user.image || "",
            });
            const fetchInitialQueue = async () => {
                try {
                    const response = await axios.get(`/api/queue/fetch?roomCode=${roomId}`);
                    // console.log(response.data.data.queue)    for testing purposes
                    if (response.data.data.queue) {
                        const parsedQueue: Song[] = response.data.data.queue.map((u: string) => JSON.parse(u));
                        setQueue(parsedQueue);
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

        const handleUpdatedQueue = (rawQueue: any) => {
            console.log("Received updated queue:", rawQueue);
            setQueue(rawQueue);
        };

        if (socketInstance.connected) {
            handleConnect();
        }

        socketInstance.on("connect", handleConnect);
        socketInstance.on("room_participants", handleRoomParticipants);
        socketInstance.on("message", handleIncomingMessage);
        socketInstance.on("updated_queue", handleUpdatedQueue);

        socketRef.current = socketInstance;

        return () => {
            socketInstance.off("connect", handleConnect);
            socketInstance.off("room_participants", handleRoomParticipants);
            socketInstance.off("message", handleIncomingMessage);
            socketInstance.off("updated_queue", handleUpdatedQueue);
        };
    }, [roomId, session?.user, isChecking]);

    // cleanup when the user logouts or closes tab
    useEffect(() => {
        return () => {
            hasInitializedSocket.current = false;
            if (socketRef.current) {
                disconnectSocket();
            }
        };
    }, []);

    useEffect(() => {
        if (!roomId || !session?.user || isChecking) return;

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
    }, [roomId, session?.user, isChecking]);

    const handleAddSong = async (song: SongMetaData) => {
        const newSong: Song = {
            ...song,
            votes: 0,
        };
        console.log(newSong);
        try {
            const payload: any = {
                roomCode: roomId,
                videoId: newSong.videoId,
                title: newSong.title,
                channelName: newSong.channelName,
                duration: newSong.duration,
                thumbnail: newSong.thumbnail,
            };
            const res = await axios.post("/api/queue/add", payload);
            console.log(res);
        } catch (error) {
            console.error(error);
            toast.error("Failed to update Queue");
        }
    };

    const handleVote = (id: string, direction: "up" | "down") => {
        setQueue(
            queue.map(song =>
                song.videoId === id
                    ? {
                          ...song,
                          votes: direction === "up" ? song.votes + 1 : Math.max(0, song.votes - 1),
                      }
                    : song,
            ),
        );
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/room?id=${roomId}`);
        toast.success("Room link copied to clipboard!");
    };

    const handleLeaveRoom = () => {
        if (socketRef.current) {
            disconnectSocket();
        }
        router.push("/dashboard");
    };

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        socketRef.current.emit("send_message", {
            roomId,
            userEmail: session.user.email,
            userName: session.user.name,
            userAvatar: session.user.image || session.user.name?.substring(0, 2).toUpperCase(),
            content: newMessage,
        });
        setNewMessage("");
    };

    if (!roomId || isChecking) return <LoadingContext />;

    return (
        <main className="min-h-screen bg-background flex flex-col">
            {/* YouTube Player Section */}
            <YouTubePlayerSection
                queue={queue}
                onSongEnd={videoId => {
                    console.log("Song ended:", videoId);
                }}
            />

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
                        <List className="w-5 h-5" />
                        <span className="text-xs font-semibold">Queue</span>
                    </button>
                    <button
                        onClick={() => setActiveSection("songs")}
                        className={`flex-1 px-3 py-2.5 text-sm font-medium transition-all rounded-lg flex flex-col items-center gap-1.5 ${
                            activeSection === "songs"
                                ? "bg-accent text-accent-foreground shadow-md"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                    >
                        <Music className="w-5 h-5" />
                        <span className="text-xs font-semibold">Songs</span>
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

                {/* Queue Section */}
                {activeSection === "songs" && <SongSection handleAddSong={handleAddSong} />}

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
