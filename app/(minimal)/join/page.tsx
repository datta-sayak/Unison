"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import LoadingContext from "@/components/LoadingContext";

function JoinRoomForm() {
    const { status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [roomCode, setRoomCode] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswordInput, setShowPasswordInput] = useState(false);

    useEffect(() => {
        const code = searchParams.get("roomId");
        if (code) {
            setRoomCode(code.toUpperCase());
        }
    }, [searchParams]);

    useEffect(() => {
        if (status === "loading") return;
        if (status === "unauthenticated") {
            router.push(`/api/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`);
        }
    }, [status, router]);

    const handleJoinRoom = async (pwd?: string) => {
        setIsLoading(true);
        try {
            const payload: { roomCode: string; password?: string } = {
                roomCode: roomCode.toUpperCase(),
            };
            if (pwd) payload.password = pwd;

            const { data } = await axios.post("/api/rooms/join", payload);
            router.push(`/room?id=${data.roomId}`);
        } catch (err) {
            const error = err.response?.data;
            if (error?.isPvt === true) {
                setShowPasswordInput(true);
                return;
            }
            toast.error(error?.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center space-y-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Join a Room</h1>
                </div>

                <div className="bg-card rounded-2xl p-8 shadow-sm border border-border space-y-6">
                    <div>
                        <label className="text-sm font-medium text-foreground mb-2 block">Room Code</label>
                        <Input
                            placeholder="Enter room code"
                            value={roomCode}
                            onChange={e => setRoomCode(e.target.value.toUpperCase())}
                            onKeyDown={e => e.key === "Enter" && handleJoinRoom()}
                            className="bg-input border-border text-foreground placeholder:text-muted-foreground h-11 rounded-lg"
                            maxLength={9}
                            disabled={showPasswordInput}
                            autoComplete="off"
                            autoCapitalize="characters"
                        />
                    </div>

                    {!showPasswordInput ? (
                        <Button
                            onClick={() => handleJoinRoom()}
                            disabled={isLoading || !roomCode}
                            className="w-full bg-primary text-primary-foreground hover:opacity-90 h-11 text-base font-medium"
                        >
                            {isLoading ? "Joining" : "Continue"}
                        </Button>
                    ) : (
                        <>
                            <div className="space-y-1.5">
                                <label className="text-sm font-medium text-foreground">Access Code</label>
                                <Input
                                    type="password"
                                    placeholder="Enter access code"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleJoinRoom(password)}
                                    className="bg-input border-border text-foreground placeholder:text-muted-foreground h-11 text-base rounded-lg"
                                    autoComplete="off"
                                />
                            </div>
                            <Button
                                onClick={() => handleJoinRoom(password)}
                                disabled={isLoading || !password}
                                className="w-full bg-primary text-primary-foreground hover:opacity-90 h-11 text-base font-medium"
                            >
                                {isLoading ? "Joining..." : "Join Room"}
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowPasswordInput(false);
                                    setPassword("");
                                    router.push("/dashboard");
                                }}
                                variant="outline"
                                className="w-full bg-transparent border-border text-foreground hover:bg-muted h-11 text-base"
                            >
                                Back
                            </Button>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}

export default function JoinRoomPage() {
    return (
        <Suspense fallback={<LoadingContext />}>
            <JoinRoomForm />
        </Suspense>
    );
}
