"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Music, Users, Zap } from "lucide-react";
import { useSession } from "next-auth/react";

export default function LandingPage() {
    const { data: session } = useSession();

    return (
        <main className="min-h-screen flex flex-col bg-accent/5">
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
                                        className="min-w-48 bg-foreground text-background hover:bg-muted-foreground transition-theme"
                                    >
                                        Get Started
                                    </Button>
                                </Link>
                                <a href="#features">
                                    <Button
                                        size="lg"
                                        variant="outline"
                                        className="min-w-48 border-2 border-muted-foreground text-foreground hover:bg-muted transition-theme bg-transparent"
                                    >
                                        Learn More
                                    </Button>
                                </a>
                            </>
                        ) : (
                            <Link href="/dashboard">
                                <Button
                                    size="lg"
                                    className="min-w-48 bg-foreground text-background hover:bg-muted-foreground transition-theme"
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
                                <div className="p-3 bg-accent/10 rounded-lg">
                                    <Zap className="h-6 w-6 text-accent" />
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
                                <div className="p-3 bg-accent/10 rounded-lg">
                                    <Music className="h-6 w-6 text-accent" />
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
                                <div className="p-3 bg-accent/10 rounded-lg">
                                    <Users className="h-6 w-6 text-accent" />
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
        </main>
    );
}
