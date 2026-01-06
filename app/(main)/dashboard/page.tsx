"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Share2, Play, Users, Lock, LogIn, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import { useRoomStore } from "@/stores/roomStore";

interface UserData {
    name: string;
    email: string;
    avatarUrl?: string;
    createdAt: string;
    room: Array<{
        roomId: string;
        roomName: string;
        accessMode: string;
        createdAt: string;
        createdBy: {
            name: string | null;
            avatarUrl: string | null;
        };
        _count: {
            roomUsers: number;
        };
    }>;
}

export default function DashboardPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [userData, setUserData] = useState<UserData | null>(null);
    const [loading, setLoading] = useState(true);

    const { resetRoom } = useRoomStore();

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

    const handleDeleteRoom = async (roomCode: string) => {
        try {
            const payload: { roomCode: string } = { roomCode: roomCode };
            const res = await axios.post("/api/rooms/delete", payload);
            if (res.data.status === 200) {
                // Clear the room state from the store
                resetRoom(roomCode);

                toast.success(res.data.message);

                // Mutate the room data list which re-renders the data component
                setUserData(prev => ({
                    ...prev,
                    room: prev.room.filter(r => r.roomId !== roomCode),
                }));
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.error("Failed to delete room: ", error);
        }
    };

    const handleShareRoom = (roomId: string) => {
        const roomLink = `${window.location.origin}/room?id=${roomId}`;
        navigator.clipboard.writeText(roomLink);
        toast.success("Room link copied to clipboard!");
    };

    return (
        <main className="min-h-screen bg-background text-foreground relative overflow-hidden">
            {/* Main Content */}
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Hero Section */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2 leading-tight">Your Rooms</h1>
                    <p className="text-base text-muted-foreground leading-relaxed max-w-2xl">
                        Create collaborative music rooms or join existing ones. Vote on songs and listen in perfect
                        sync.
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="grid md:grid-cols-2 gap-4 mb-8">
                    <Link href="/join">
                        <div className="bg-card border border-border rounded-lg p-4 hover:border-foreground/20 transition-all cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-foreground text-background rounded flex items-center justify-center">
                                    <LogIn className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold mb-0.5">Join Room</h3>
                                    <p className="text-xs text-muted-foreground">Enter with a room code</p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    <Link href="/create">
                        <div className="bg-card border border-border rounded-lg p-4 hover:border-foreground/20 transition-all cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-foreground text-background rounded flex items-center justify-center">
                                    <Plus className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-base font-semibold mb-0.5">Create Room</h3>
                                    <p className="text-xs text-muted-foreground">Start a new music session</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Rooms Section */}
                <div>
                    <h2 className="text-xl font-bold mb-4">Active Rooms</h2>

                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                            <Loader2 className="w-8 h-8 animate-spin mb-3" />
                            <p className="text-sm">Loading rooms...</p>
                        </div>
                    ) : userData?.room.length === 0 ? (
                        <div className="bg-card border border-border rounded-lg p-8 text-center">
                            <div className="flex justify-center mb-4">
                                <div className="w-12 h-12 bg-muted border border-border rounded-full flex items-center justify-center">
                                    <Play className="h-6 w-6 text-muted-foreground" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold mb-2">No rooms yet</h3>
                            <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto leading-relaxed">
                                Create your first collaborative music room or join one using a room code. Start
                                listening together today.
                            </p>
                            <Link href="/create">
                                <Button size="default" className="bg-foreground text-background hover:opacity-90">
                                    Create Your First Room
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-4">
                            {userData?.room.map(room => (
                                <div
                                    key={room.roomId}
                                    className="bg-card border border-border rounded-xl p-5 hover:border-foreground/30 hover:shadow-sm transition-all duration-200"
                                >
                                    {/* Room Header */}
                                    <div className="flex items-start justify-between gap-3 mb-4">
                                        <div className="flex items-start gap-4 flex-1 min-w-0">
                                            {room.createdBy && (
                                                <div className="w-11 h-11 rounded-full bg-gradient-to-br from-muted to-muted/50 border border-border flex items-center justify-center flex-shrink-0 shadow-sm">
                                                    {room.createdBy.avatarUrl ? (
                                                        <Image
                                                            src={room.createdBy.avatarUrl}
                                                            alt={room.createdBy.name || "Host"}
                                                            width={44}
                                                            height={44}
                                                            className="w-11 h-11 rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <span className="text-sm font-bold text-foreground">
                                                            {(room.createdBy.name || "H").charAt(0).toUpperCase()}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start gap-2 mb-1">
                                                    <h3 className="text-lg font-semibold truncate leading-tight">
                                                        {room.roomName}
                                                    </h3>
                                                    {room.accessMode === "Private" && (
                                                        <Lock className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                                                    )}
                                                </div>
                                                {room.createdBy && (
                                                    <p className="text-sm text-muted-foreground mb-2">
                                                        by{" "}
                                                        <span className="font-medium text-foreground">
                                                            {room.createdBy.name}
                                                        </span>
                                                    </p>
                                                )}
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1.5">
                                                        <Users className="h-3.5 w-3.5" />
                                                        <span className="font-medium">{room._count.roomUsers}</span>
                                                    </div>
                                                    <span className="text-muted-foreground/60">•</span>
                                                    <span className="font-mono text-[11px] tracking-wide bg-muted/50 px-2 py-0.5 rounded">
                                                        {room.roomId}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Actions */}
                                        <div className="flex gap-1.5 flex-shrink-0">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleShareRoom(room.roomId)}
                                                className="h-8 w-8 p-0 hover:bg-muted/80"
                                                title="Share room"
                                            >
                                                <Share2 className="h-3.5 w-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleDeleteRoom(room.roomId)}
                                                className="h-8 w-8 p-0 hover:bg-red-500/10 hover:text-red-500"
                                                title="Delete room"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </Button>
                                        </div>
                                    </div>

                                    {/* Primary Action */}
                                    <Link href={`/room?id=${room.roomId}`} className="block">
                                        <Button
                                            size="sm"
                                            className="w-full bg-gradient-to-r from-foreground to-foreground/90 text-background hover:from-foreground/90 hover:to-foreground/80 h-9 text-sm font-medium shadow-sm border border-foreground/10 transition-all"
                                        >
                                            <Play className="h-3.5 w-3.5 mr-2 fill-current" />
                                            Enter Room
                                        </Button>
                                    </Link>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </main>
    );
}
