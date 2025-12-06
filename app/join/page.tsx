'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import axios from 'axios';
import type { AxiosError } from 'axios';
import { useSession } from 'next-auth/react';
import { toast } from 'sonner';

function JoinRoomForm() {
    const { status } = useSession();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [roomCode, setRoomCode] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswordInput, setShowPasswordInput] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const code = searchParams.get('roomId');
        if (code) {
            setRoomCode(code.toUpperCase());
        }
    }, [searchParams]);

    useEffect(() => {
        if (status === 'loading') return;
        if (status === 'unauthenticated') {
            router.push(`/api/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`);
        }
    }, [status, router]);

    const handleJoinRoom = async (pwd?: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const response = await axios.post('/api/rooms/join', {
                roomCode: roomCode.toUpperCase(),
                ...(pwd && { password: pwd }),
            });

            router.push(`/room?id=${response.data.roomId}`);
        } catch (err) {
            const axiosError = err as AxiosError<{ message?: string }>;
            const errorMessage = axiosError.response?.data?.message || 'Failed to join room';

            if (!pwd && errorMessage.includes('requires an access code')) {
                setShowPasswordInput(true);
            } else {
                toast.error(errorMessage);
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <main className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md space-y-8">
                <div className="space-y-2 text-center">
                    <h1 className="text-3xl font-bold text-foreground">Join a Room</h1>
                    <p className="text-muted-foreground">
                        Enter the room code shared by your friends
                    </p>
                </div>

                <div className="bg-card rounded-2xl p-8 shadow-sm border border-border space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Room Code</label>
                        <Input
                            placeholder="Enter room code"
                            value={roomCode}
                            onChange={e => setRoomCode(e.target.value.toUpperCase())}
                            onKeyDown={e => e.key === 'Enter' && handleJoinRoom()}
                            className="bg-input border-border text-foreground placeholder:text-muted-foreground h-11 rounded-lg"
                            maxLength={9}
                            disabled={showPasswordInput}
                        />
                    </div>

                    {error && (
                        <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    {!showPasswordInput ? (
                        <Button
                            onClick={() => handleJoinRoom()}
                            disabled={isLoading || !roomCode}
                            className="w-full bg-accent text-accent-foreground hover:opacity-90 h-11 font-medium transition-theme"
                        >
                            {isLoading ? 'Checking...' : 'Continue'}
                        </Button>
                    ) : (
                        <>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground">
                                    Access Code
                                </label>
                                <Input
                                    type="password"
                                    placeholder="Enter access code"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleJoinRoom(password)}
                                    className="bg-input border-border text-foreground placeholder:text-muted-foreground h-11 rounded-lg"
                                />
                            </div>
                            <Button
                                onClick={() => handleJoinRoom(password)}
                                disabled={isLoading || !password}
                                className="w-full bg-accent text-accent-foreground hover:opacity-90 h-11 font-medium transition-theme"
                            >
                                {isLoading ? 'Joining...' : 'Join Room'}
                            </Button>
                            <Button
                                onClick={() => {
                                    setShowPasswordInput(false);
                                    setPassword('');
                                    setError(null);
                                    router.push('/dashboard');
                                }}
                                variant="outline"
                                className="w-full bg-transparent border-border text-foreground hover:bg-muted"
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
        <Suspense
            fallback={
                <main className="min-h-screen flex items-center justify-center bg-background px-4">
                    <div className="w-full max-w-md space-y-8">
                        <div className="space-y-2 text-center">
                            <h1 className="text-3xl font-bold text-foreground">Join a Room</h1>
                            <p className="text-muted-foreground">Loading...</p>
                        </div>
                    </div>
                </main>
            }
        >
            <JoinRoomForm />
        </Suspense>
    );
}
