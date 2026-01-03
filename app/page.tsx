"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Music, Users, Zap } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";

export default function LandingPage() {
    const { data: session } = useSession();
    const [serverStatus, setServerStatus] = useState<"checking" | "online" | "offline">("checking");

    useEffect(() => {
        const checkServerHealth = async () => {
            try {
                const { data } = await axios.get("/api/health");
                const isOnline = data?.status === 200;
                setServerStatus(isOnline ? "online" : "offline");
            } catch {
                setServerStatus("offline");
            }
        };

        checkServerHealth();
        const interval = setInterval(checkServerHealth, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <main className="min-h-screen flex flex-col bg-background">
            {/* Hero Section */}
            <div className="flex-1 flex flex-col items-center justify-center px-4 py-12">
                <div className="max-w-3xl text-center space-y-8">
                    {/* Logo/Title */}
                    <div className="space-y-4">
                        <h1 className="text-5xl md:text-6xl font-bold text-foreground tracking-tight text-balance">
                            Listen Together, Seamlessly.
                        </h1>
                        <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto text-balance leading-relaxed">
                            Create a room, invite friends, and enjoy music in sync. Control the queue democratically
                            with voting.
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-8">
                        {!session ? (
                            <>
                                <Link href="/api/auth/signin">
                                    <Button
                                        size="lg"
                                        className="min-w-48 bg-foreground text-background hover:bg-muted-foreground"
                                    >
                                        Get Started
                                    </Button>
                                </Link>
                                <a href="#features">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="min-w-48 border-2 border-muted-foreground text-foreground hover:bg-muted bg-transparent"
                                    >
                                        Learn More
                                    </Button>
                                </a>
                            </>
                        ) : (
                            <Link href="/dashboard">
                                <Button
                                    size="lg"
                                    className="min-w-48 bg-foreground text-background hover:bg-muted-foreground"
                                >
                                    Go to Dashboard
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <section id="features" className="py-16 px-4 bg-card/30 border-t border-border">
                <div className="max-w-4xl mx-auto">
                    <h2 className="text-3xl font-bold text-foreground text-center mb-12">How It Works</h2>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="space-y-4 text-center">
                            <div className="flex justify-center">
                                <div className="p-3 bg-primary/10 rounded-lg">
                                    <Zap className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">Create a Room</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                Generate a unique room code and invite your friends to join your listening session.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="space-y-4 text-center">
                            <div className="flex justify-center">
                                <div className="p-3 bg-primary/10 rounded-lg">
                                    <Music className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">Search & Queue</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                Search for YouTube music and add songs to the shared queue. Everyone can contribute.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="space-y-4 text-center">
                            <div className="flex justify-center">
                                <div className="p-3 bg-primary/10 rounded-lg">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-foreground">Vote & Sync</h3>
                            <p className="text-muted-foreground text-sm leading-relaxed">
                                Upvote or downvote songs. Higher voted tracks play first, keeping everyone happy.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-4 border-t">
                <div className="max-w-4xl mx-auto px-4 md:px-0 flex flex-col md:flex-row items-center justify-between gap-3 md:gap-0">
                    <div className="text-sm text-center md:text-left">
                        &copy; {new Date().getFullYear()} <span className="font-semibold">Unison</span> by Sayak Datta.
                    </div>
                    <div className="flex items-center space-x-2">
                        <div
                            className={`h-2 w-2 rounded-full ${
                                serverStatus === "online"
                                    ? "bg-green-500"
                                    : serverStatus === "offline"
                                      ? "bg-red-500"
                                      : "bg-yellow-500 animate-pulse"
                            }`}
                        />
                        <span className="text-sm">
                            {serverStatus === "online"
                                ? "All systems online"
                                : serverStatus === "offline"
                                  ? "System offline"
                                  : "Checking status..."}
                        </span>
                    </div>
                </div>
            </footer>
        </main>
    );
}
