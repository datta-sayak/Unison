"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "@/providers";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import axios from "axios";

export default function CreateRoomPage() {
    const { data: session, status } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [roomName, setRoomName] = useState("");
    const [isPrivate, setIsPrivate] = useState(false);
    const [password, setPassword] = useState("");
    const router = useRouter();
    const { setRoomId } = useTheme();

    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") {
            router.push("/api/auth/signin");
        }
    }, [router, status]);

    const handleCreateRoom = async () => {
        if (!session?.user) {
            toast.error("Please sign in to create a room");
            return;
        }
        if (isPrivate && !password.trim()) {
            toast.error("Private rooms require a password");
            return;
        }
        setIsLoading(true);

        try {
            const payload: {
                email?: string;
                roomName?: string;
                isPrivate?: boolean;
                password?: string;
            } = {};
            const trimmedName = roomName.trim();
            payload.email = session.user.email;
            if (trimmedName) payload.roomName = trimmedName;
            payload.isPrivate = isPrivate;
            if (isPrivate && password.trim()) {
                payload.password = password.trim();
            }

            const response = await axios.post("/api/rooms/create", payload);
            const data = response.data;

            setRoomId(data.room.roomId);
            toast.success(`Room "${data.room.roomName}" created successfully!`);
            router.push(`/room?id=${data.room.roomId}`);
        } catch (error) {
            console.error("Room creation error:", error);
            toast.error("Failed to create room");
        } finally {
            setIsLoading(false);
        }
    };

    if (status === "loading") {
        return (
            <main className="min-h-screen flex items-center justify-center bg-background">
                <p className="text-muted-foreground">Loading</p>
            </main>
        );
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-8">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold text-foreground">Create Your Room</h1>
                </div>
                <div className="bg-card rounded-2xl p-8 shadow-sm border border-border space-y-6">
                    {/* Room Name Section */}
                    <div className="space-y-2">
                        <Label htmlFor="roomName" className="text-sm font-medium text-foreground">
                            Room Name
                        </Label>
                        <Input
                            id="roomName"
                            placeholder="e.g. Chill Vibes, Rock Out, Study Session"
                            value={roomName}
                            onChange={e => setRoomName(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && !isLoading && handleCreateRoom()}
                            className="bg-input border-border text-foreground placeholder:text-muted-foreground h-11 rounded-lg"
                            disabled={isLoading}
                            autoComplete="off"
                        />
                    </div>

                    {/* Room Privacy Section */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <div className="text-sm font-medium text-foreground">
                                    {isPrivate ? "Private Room" : "Public Room"}
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    {isPrivate ? "Password required to join" : "Open to everyone"}
                                </p>
                            </div>
                            <Switch checked={isPrivate} onCheckedChange={setIsPrivate} disabled={isLoading} />
                        </div>
                    </div>

                    {/* Password Section - Only show for private rooms */}
                    {isPrivate && (
                        <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                            <Label htmlFor="roomPassword" className="text-sm font-medium text-foreground">
                                Room Password
                            </Label>
                            <Input
                                id="roomPassword"
                                type="text"
                                placeholder="Choose a secret code for your room"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && !isLoading && handleCreateRoom()}
                                className="bg-input border-border text-foreground placeholder:text-muted-foreground h-11 rounded-lg"
                                disabled={isLoading}
                                autoComplete="off"
                            />
                        </div>
                    )}

                    {/* Create Button */}
                    <Button
                        onClick={handleCreateRoom}
                        disabled={isLoading}
                        className="w-full bg-primary text-primary-foreground hover:opacity-90 h-12 font-medium rounded-lg"
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                Creating Room...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">Create Room</span>
                        )}
                    </Button>
                </div>
            </div>
        </main>
    );
}
