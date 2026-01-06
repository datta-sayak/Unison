"use client";

import { useState, Suspense, useEffect, useRef } from "react";
import { Music, Users, MessageCircle, Info, List } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { disconnectSocket } from "@/lib/socket";
import { toast } from "sonner";
import axios from "axios";
import { QueueSection } from "@/components/room/QueueSection";
import { SongSection } from "@/components/room/SongSection";
import { MembersSection } from "@/components/room/MembersSection";
import { ChatSection } from "@/components/room/ChatSection";
import { InfoSection } from "@/components/room/InfoSection";
import { YouTubePlayerSection, YouTubePlayerHandle } from "@/components/room/YouTubePlayerSection";
import LoadingContext from "@/components/LoadingContext";
import type { SongMetaData } from "@/lib";

import { useRoomMembership } from "@/hooks/useRoomMembership";
import { useServerHealth } from "@/hooks/useServerHealth";
import { useRoomSocket } from "@/hooks/useRoomSocket";
import { useInitialFetch } from "@/hooks/useInitialFetch";
import { useRoomStore } from "@/stores/roomStore";

function RoomPageContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const roomId = searchParams.get("id");
    const { data: session, status } = useSession();
    const contentRef = useRef<HTMLDivElement | null>(null);
    const playerRef = useRef<YouTubePlayerHandle>(null);
    const [newMessage, setNewMessage] = useState("");
    const [hasUnreadMessages, setHasUnreadMessages] = useState(false);
    const previousMessageCountRef = useRef(0);

    const {
        setCurrentRoomId,
        getCurrentRoomData,
        setQueue: setStoredQueue,
        setMessages: setStoredMessages,
        setAllUsers: setStoredAllUsers,
        setActiveSection,
        setUserVotes,
    } = useRoomStore();

    useEffect(() => {
        if (roomId) {
            setCurrentRoomId(roomId);
        }
    }, [roomId, setCurrentRoomId]);

    const roomData = getCurrentRoomData();
    const storedQueue = roomData.queue;
    const storedMessages = roomData.messages;
    const storedAllUsers = roomData.allUsers;
    const activeSection = roomData.activeSection;
    const userVotes = roomData.userVotes;

    const { serverOnline, checkingServer } = useServerHealth();

    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") {
            router.push(`/api/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`);
        }
    }, [status, router]);

    const { isChecking } = useRoomMembership({ roomId, session, status });
    const {
        socket,
        queue: socketQueue,
        messages: socketMessages,
        onlineUsers,
    } = useRoomSocket({ isChecking, roomId, session, playerRef });
    const { allUsers: dbUsers } = useInitialFetch({ session, isChecking, roomId });

    // The data from the sockets and the API may take time so untill then show the stored ones
    const queue = socketQueue.length > 0 ? socketQueue : storedQueue;
    const messages = socketMessages.length > 0 ? socketMessages : storedMessages;
    const allUsers = storedAllUsers;

    useEffect(() => {
        if (socketQueue.length > 0 && roomId) {
            setStoredQueue(roomId, socketQueue);
        }
    }, [socketQueue, roomId, setStoredQueue]);

    useEffect(() => {
        if (socketMessages.length > 0 && roomId) {
            setStoredMessages(roomId, socketMessages);
        }
    }, [socketMessages, roomId, setStoredMessages]);

    useEffect(() => {
        if (roomId) {
            setStoredAllUsers(roomId, currentUsers => {
                if (currentUsers.length === 0 && dbUsers.length > 0) {
                    return dbUsers;
                }

                const userAvatars = new Set();
                currentUsers.forEach(user => userAvatars.add(user.avatar));

                const newUsersToAdd = [];

                dbUsers.forEach(dbUser => {
                    if (!userAvatars.has(dbUser.avatar)) {
                        newUsersToAdd.push(dbUser);
                        userAvatars.add(dbUser.avatar);
                    }
                });

                onlineUsers.forEach(onlineUser => {
                    if (!userAvatars.has(onlineUser.avatar)) {
                        newUsersToAdd.push(onlineUser);
                        userAvatars.add(onlineUser.avatar);
                    }
                });

                return newUsersToAdd.length > 0 ? [...currentUsers, ...newUsersToAdd] : currentUsers;
            });
        }
    }, [dbUsers, onlineUsers, roomId, setStoredAllUsers]);

    const usersWithStatus = allUsers
        .map(user => ({
            ...user,
            isOnline: onlineUsers.some(u => u.avatar === user.avatar),
        }))
        .sort((a, b) => {
            if (a.isOnline && !b.isOnline) return -1;
            if (!a.isOnline && b.isOnline) return 1;
            return 0;
        });

    useEffect(() => {
        if (messages.length > previousMessageCountRef.current && activeSection !== "chat") {
            setHasUnreadMessages(true);
        }
        previousMessageCountRef.current = messages.length;
    }, [messages, activeSection]);

    // For auto scroll to bottom of the page
    useEffect(() => {
        if (activeSection === "chat") {
            window.scrollTo({
                top: document.documentElement.scrollHeight,
                behavior: "smooth",
            });
        }
    }, [activeSection]);

    const handleAddSong = async (song: SongMetaData) => {
        const newSong = {
            ...song,
            votes: 0,
        };

        try {
            const payload = {
                roomCode: roomId,
                videoId: newSong.videoId,
                title: newSong.title,
                channelName: newSong.channelName,
                duration: newSong.duration,
                thumbnail: newSong.thumbnail,
            };
            const res = await axios.post("/api/queue/add", payload);
            if (res?.data?.status === 200) {
                toast.success(res.data.message);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error(error);
            toast.error("Failed to update Queue");
        }
    };

    const handleRemoveSong = async (song: SongMetaData) => {
        try {
            const payload = {
                roomCode: roomId,
                videoId: song.videoId,
                title: song.title,
                channelName: song.channelName,
                duration: song.duration,
                thumbnail: song.thumbnail,
            };
            const res = await axios.post("/api/queue/remove", payload);

            if (res?.data?.status === 200) {
                toast.success("Song Removed from queue");
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Get current users votes
    const currentUserVotes = userVotes[session?.user?.email] || {};

    const handleVote = async (videoId: string, direction: "up" | "down") => {
        const song = queue.find(s => s.videoId === videoId);
        if (!song) {
            toast.error("Song not found in queue");
            return;
        }

        const voteType = direction === "up" ? "upvote" : "downvote";

        const newVote = { ...currentUserVotes, [videoId]: voteType as "upvote" | "downvote" };
        setUserVotes(roomId, { ...userVotes, [session.user.email]: newVote });

        try {
            const payload = {
                roomCode: roomId,
                videoId: song.videoId,
                voteState: voteType,
            };

            const res = await axios.post("/api/queue/vote", payload);

            if (res?.data?.status === 200) {
                toast.success(direction === "up" ? "Upvoted" : "Downvoted");
            } else {
                toast.error(res.data.message || "Failed to vote");
            }
        } catch (error) {
            console.error("Failed to vote:", error);
            toast.error("Failed to vote");
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(`${window.location.origin}/room?id=${roomId}`);
        toast.success("Room link copied to clipboard!");
    };

    const handleLeaveRoom = () => {
        if (socket) {
            disconnectSocket();
        }
        router.push("/dashboard");
    };

    const handleSendMessage = () => {
        if (!newMessage.trim()) return;

        socket.emit("send_message", {
            roomId,
            userEmail: session.user.email,
            userName: session.user.name,
            userAvatar: session.user.image || session.user.name?.substring(0, 2).toUpperCase(),
            content: newMessage,
        });
        setNewMessage("");
    };

    if (!roomId || isChecking || checkingServer || !serverOnline) return <LoadingContext />;

    return (
        <main className="min-h-screen bg-background flex flex-col">
            {/* YouTube Player Section */}
            <YouTubePlayerSection
                ref={playerRef}
                queue={queue}
                socket={socket}
                roomId={roomId}
                userEmail={session.user.email}
                onSongEnd={videoId => {
                    console.log("Song ended:", videoId);
                }}
            />

            {/* Main Content Area - Scrollable */}
            <div ref={contentRef} className="flex-1 overflow-y-auto">
                {/* Section Tabs */}
                <div className="flex gap-1 sticky top-0 z-30 bg-card/95 backdrop-blur-sm shadow-sm p-2 max-w-4xl mx-auto">
                    <button
                        onClick={() => setActiveSection(roomId, "queue")}
                        className={`flex-1 px-3 py-2.5 text-sm font-medium transition-all rounded-lg flex flex-col items-center gap-1.5 ${
                            activeSection === "queue"
                                ? "bg-primary text-primary-foreground shadow-md"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                    >
                        <List className="w-5 h-5" />
                        <span className="text-xs font-semibold">Queue</span>
                    </button>
                    <button
                        onClick={() => setActiveSection(roomId, "songs")}
                        className={`flex-1 px-3 py-2.5 text-sm font-medium transition-all rounded-lg flex flex-col items-center gap-1.5 ${
                            activeSection === "songs"
                                ? "bg-primary text-primary-foreground shadow-md"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                    >
                        <Music className="w-5 h-5" />
                        <span className="text-xs font-semibold">Songs</span>
                    </button>
                    <button
                        onClick={() => setActiveSection(roomId, "members")}
                        className={`flex-1 px-3 py-2.5 text-sm font-medium transition-all rounded-lg flex flex-col items-center gap-1.5 ${
                            activeSection === "members"
                                ? "bg-primary text-primary-foreground shadow-md"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                    >
                        <Users className="w-5 h-5" />
                        <span className="text-xs font-semibold">Members</span>
                    </button>
                    <button
                        onClick={() => {
                            setActiveSection(roomId, "chat");
                            setHasUnreadMessages(false);
                        }}
                        className={`flex-1 px-3 py-2.5 text-sm font-medium transition-all rounded-lg flex flex-col items-center gap-1.5 relative ${
                            activeSection === "chat"
                                ? "bg-primary text-primary-foreground shadow-md"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                    >
                        <MessageCircle className="w-5 h-5" />
                        <span className="text-xs font-semibold">Chat</span>
                        {hasUnreadMessages && (
                            <span className="top-1 right-13 absolute bg-green-500 rounded-full h-3 w-3"></span>
                        )}
                    </button>
                    <button
                        onClick={() => setActiveSection(roomId, "info")}
                        className={`flex-1 px-3 py-2.5 text-sm font-medium transition-all rounded-lg flex flex-col items-center gap-1.5 ${
                            activeSection === "info"
                                ? "bg-primary text-primary-foreground shadow-md"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                    >
                        <Info className="w-5 h-5" />
                        <span className="text-xs font-semibold">Info</span>
                    </button>
                </div>

                {/* Queue Section */}
                {activeSection === "queue" && (
                    <QueueSection
                        queue={queue}
                        handleVote={handleVote}
                        handleRemoveSong={handleRemoveSong}
                        userVotes={currentUserVotes}
                    />
                )}

                {/* Songs Section */}
                {activeSection === "songs" && <SongSection handleAddSong={handleAddSong} />}

                {/* Members Section */}
                {activeSection === "members" && <MembersSection allUsers={usersWithStatus} />}

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
                        allUsers={usersWithStatus}
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
