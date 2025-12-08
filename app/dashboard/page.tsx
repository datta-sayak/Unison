"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Share2, Play, Users, Activity, Lock, LogIn, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";

interface UserData {
    name: string;
    email: string;
    avatarUrl?: string;
    createdAt: string;
    createdRooms: Array<{
        roomId: string;
        roomName: string;
        accessMode: string;
        createdAt: string;
        createdBy: {
            name: string | null;
            avatarUrl: string | null;
        } | null;
        _count: {
            roomUsers: number;
            queueEntries: number;
        };
        playbackState: {
            currentEntry: {
                song: {
                    title: string;
                    smallImage: string | null;
                };
            } | null;
        } | null;
    }>;
    roomUsers: Array<{
        room: {
            roomId: string;
            roomName: string;
            accessMode: string;
            createdAt: string;
            createdBy: {
                name: string | null;
                avatarUrl: string | null;
            } | null;
            _count: {
                roomUsers: number;
                queueEntries: number;
            };
            playbackState: {
                currentEntry: {
                    song: {
                        title: string;
                        smallImage: string | null;
                    };
                } | null;
            } | null;
        };
    }>;
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") {
            router.push("/api/auth/signin");
        }
    }, [router, status]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const response = await axios.get("/api/user");
                setUserData(response.data);
            } catch (error) {
                console.error("Failed to fetch user data:", error);
                signOut({ callbackUrl: "/" });
            } finally {
                setLoading(false);
            }
        };
        if (status === "authenticated") {
            fetchUserData();
        }
    }, [status, session?.user?.email]);

    const handleDeleteRoom = (roomId: string) => {
        console.log("Delete room:", roomId);
    };

    const handleShareRoom = (roomId: string) => {
        const roomLink = `${window.location.origin}/room?id=${roomId}`;
        navigator.clipboard.writeText(roomLink);
        toast.info(`"${roomId}" copied!`);
    };

    return (
        <main className="min-h-screen bg-accent/5 transition-theme">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 rounded-t-3xl">
                <div className="flex justify-center">
                    <div className="w-full max-w-5xl">
                        <div className="space-y-6">
                            {/* Section Header */}
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold text-foreground">Your Rooms</h2>
                                    <p className="font-bold text-accent">
                                        {userData?.createdRooms &&
                                        userData.createdRooms.length + userData.roomUsers.length > 0
                                            ? `${userData.createdRooms.length} created, ${userData.roomUsers.length} joined`
                                            : "Create or join a room to get started"}
                                    </p>
                                </div>
                            </div>
                            {/* Join Room and New Room Cards - Above Empty State */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <Link href="/join" className="block">
                                    <div className="bg-gradient-to-br from-accent/5 to-accent/10 border-2 border-accent rounded-2xl p-4 hover:border-accent hover:shadow-xl hover:shadow-accent/20 hover:from-accent/10 hover:to-accent/15 transition-all cursor-pointer group active:scale-95">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-accent group-hover:bg-accent/90 transition-colors flex items-center justify-center shadow-lg">
                                                <LogIn className="h-5 w-5 text-accent-foreground" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                                                    Join Room
                                                </h3>
                                                <p className="text-xs text-muted-foreground">
                                                    Connect to existing rooms
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>

                                <Link href="/create" className="block">
                                    <div className="bg-gradient-to-br from-accent/5 to-accent/10 border-2 border-accent rounded-2xl p-4 hover:border-accent hover:shadow-xl hover:shadow-accent/20 hover:from-accent/10 hover:to-accent/15 transition-all cursor-pointer group active:scale-95">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-lg bg-accent group-hover:bg-accent/90 transition-colors flex items-center justify-center shadow-lg">
                                                <Plus className="h-5 w-5 text-accent-foreground" />
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-semibold text-foreground group-hover:text-accent transition-colors">
                                                    New Room
                                                </h3>
                                                <p className="text-xs text-muted-foreground">
                                                    Create your own music room
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                            {/* Rooms Grid */}
                            {loading ? (
                                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                                    <Loader2 className="w-8 h-8 animate-spin text-accent mb-3" />
                                    <p>Loading rooms...</p>
                                </div>
                            ) : !userData?.createdRooms ||
                              (userData.createdRooms.length === 0 && userData.roomUsers.length === 0) ? (
                                <>
                                    <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center space-y-4">
                                        <div className="flex justify-center">
                                            <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center">
                                                <Play className="h-8 w-8 text-accent" />
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-foreground text-lg">No rooms yet</h3>
                                            <p className="text-sm text-muted-foreground mt-2 max-w-xs mx-auto">
                                                Create your first collaborative music room or join one using a room code
                                            </p>
                                        </div>
                                        <Link href="/create">
                                            <Button className="bg-accent text-accent-foreground hover:opacity-90 transition-theme">
                                                Create Your First Room
                                            </Button>
                                        </Link>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Rooms Grid */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {[
                                            ...userData.createdRooms,
                                            ...userData.roomUsers
                                                .map(ru => ru.room)
                                                .filter(
                                                    joinedRoom =>
                                                        !userData.createdRooms.some(
                                                            created => created.roomId === joinedRoom.roomId,
                                                        ),
                                                ),
                                        ].map(room => (
                                            <div
                                                key={room.roomId}
                                                className="group rounded-xl bg-card border border-border p-4 hover:border-accent/50 hover:shadow-lg transition-all"
                                            >
                                                {/* Room Header */}
                                                <div className="flex items-start gap-3 mb-3">
                                                    {room.createdBy && (
                                                        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
                                                            {room.createdBy.avatarUrl ? (
                                                                <Image
                                                                    src={room.createdBy.avatarUrl}
                                                                    alt={room.createdBy.name || "Host"}
                                                                    width={40}
                                                                    height={40}
                                                                    className="w-10 h-10 rounded-full object-cover"
                                                                />
                                                            ) : (
                                                                <span className="text-sm font-bold text-accent">
                                                                    {(room.createdBy.name || "H")
                                                                        .charAt(0)
                                                                        .toUpperCase()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="text-lg font-bold text-foreground truncate">
                                                            {room.roomName}
                                                        </h3>
                                                        {room.createdBy && (
                                                            <p className="text-xs text-muted-foreground truncate mb-1">
                                                                by {room.createdBy.name || "Unknown"}
                                                            </p>
                                                        )}
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Users className="h-3 w-3" />
                                                                {room._count.roomUsers}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">•</span>
                                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                                <Activity className="h-3 w-3" />
                                                                {room._count.queueEntries}
                                                            </span>
                                                            {room.accessMode === "Private" && (
                                                                <>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        •
                                                                    </span>
                                                                    <Lock className="h-3 w-3 text-muted-foreground" />
                                                                    <span className="text-xs text-muted-foreground">
                                                                        Private
                                                                    </span>
                                                                </>
                                                            )}
                                                            {room.playbackState?.currentEntry?.song && (
                                                                <>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        •
                                                                    </span>
                                                                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action Buttons */}
                                                <div className="flex gap-2">
                                                    <Link href={`/room?id=${room.roomId}`} className="flex-1">
                                                        <button className="w-full px-3 py-2 rounded-lg bg-accent text-accent-foreground font-medium text-sm hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
                                                            <Play className="h-4 w-4" />
                                                            Enter
                                                        </button>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleShareRoom(room.roomId)}
                                                        className="px-3 py-2 rounded-lg border border-border hover:bg-muted transition-colors"
                                                        title="Share room"
                                                    >
                                                        <Share2 className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRoom(room.roomId)}
                                                        className="px-3 py-2 rounded-lg border border-border hover:bg-destructive/10 hover:border-destructive/30 hover:text-destructive transition-colors"
                                                        title="Delete room"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
}
