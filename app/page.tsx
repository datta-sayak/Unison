"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Play, ArrowRight, ChevronUp, MessageCircle, Users } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import axios from "axios";
import { AppHeader } from "./components/AppHeader";
import { useTheme } from "./providers";

export default function LandingPage() {
    const { data: session } = useSession();
    const { mode } = useTheme();
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
        <main className="min-h-screen bg-background text-foreground relative overflow-hidden">
            {/* Subtle Background Elements */}
            <div className="absolute inset-0 pointer-events-none">
                {/* Top glow */}
                <div className="absolute top-0 right-32 w-[700px] h-[700px] bg-foreground/[0.11] rounded-full blur-3xl" />

                {/* Hero glow */}
                <div className="absolute top-32 left-20 w-[700px] h-[700px] bg-foreground/[0.12] rounded-full blur-3xl" />

                {/* How It Works section glow */}
                <div className="absolute top-[55%] right-10 w-[600px] h-[600px] bg-foreground/[0.10] rounded-full blur-3xl" />

                {/* Middle accent */}
                <div className="absolute top-[60%] left-32 w-[550px] h-[550px] bg-foreground/[0.11] rounded-full blur-3xl" />

                {/* Bottom glow */}
                <div className="absolute bottom-40 right-20 w-[650px] h-[650px] bg-foreground/[0.10] rounded-full blur-3xl" />

                {/* Final CTA glow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-foreground/[0.09] rounded-full blur-3xl" />
            </div>

            {/* Header */}
            <AppHeader />

            {/* Hero */}
            <section className="max-w-6xl mx-auto px-6 pt-24 pb-16 relative">
                <div className="max-w-3xl">
                    <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-tight">
                        Listen together.
                        <br />
                        Decide together.
                    </h1>
                    <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-2xl">
                        A collaborative music room where everyone controls the queue. Vote on songs. Chat in real-time.
                        Synced playback.
                    </p>
                    <div className="flex gap-3">
                        <Link href={session?.user ? "/dashboard" : "/api/auth/signin"}>
                            <Button size="lg" className="bg-foreground text-background hover:opacity-90">
                                Get Started
                            </Button>
                        </Link>
                        <a href="#features">
                            <Button size="lg" variant="outline" className="border-2">
                                Learn More
                            </Button>
                        </a>
                    </div>
                </div>
            </section>

            {/* Main Section Separator */}
            <div className="pt-16 pb-24">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="h-1 bg-gradient-to-r from-transparent via-border to-transparent" />
                </div>
            </div>

            {/* What You Can Do */}
            <section id="features" className="py-20 relative">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl font-bold mb-12">What you can do</h2>
                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Collaborative Queue */}
                        <div className="space-y-3">
                            <div className="w-10 h-10 bg-muted border border-border rounded flex items-center justify-center">
                                <ChevronUp className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-semibold">Collaborative Queue</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Add YouTube songs to a shared queue. Vote on what plays next. Higher votes play first.
                            </p>
                        </div>

                        {/* Synced Playback */}
                        <div className="space-y-3">
                            <div className="w-10 h-10 bg-muted border border-border rounded flex items-center justify-center">
                                <Play className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-semibold">Synced Playback</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Everyone hears the same thing at the same time. Play, pause, and skip are synced across
                                all listeners.
                            </p>
                        </div>

                        {/* Live Chat */}
                        <div className="space-y-3">
                            <div className="w-10 h-10 bg-muted border border-border rounded flex items-center justify-center">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <h3 className="text-lg font-semibold">Live Chat</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                                Talk with your room while listening. Messages sync in real-time.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Separator Line */}
            <div className="max-w-6xl mx-auto px-6">
                <div className="h-px bg-border/50" />
            </div>

            {/* How It Works */}
            <section className="py-20 relative">
                <div className="max-w-6xl mx-auto px-6">
                    <h2 className="text-3xl font-bold mb-12">How it works</h2>
                    <div className="grid md:grid-cols-4 gap-8">
                        {[
                            { num: "1", label: "Create or join a room", detail: "Room code: A9K2Q" },
                            { num: "2", label: "Add a YouTube song", detail: "Search by title or URL" },
                            { num: "3", label: "Vote with the room", detail: "Queue sorts by votes" },
                            { num: "4", label: "Music plays automatically", detail: "Synced for everyone" },
                        ].map((step, i) => (
                            <div key={i} className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-foreground text-background rounded font-bold flex items-center justify-center text-sm">
                                        {step.num}
                                    </div>
                                    {i < 3 && <ArrowRight className="w-4 h-4 text-muted-foreground" />}
                                </div>
                                <div className="text-sm font-medium">{step.label}</div>
                                <div className="text-xs text-muted-foreground font-mono">{step.detail}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Separator Line */}
            <div className="max-w-6xl mx-auto px-6">
                <div className="h-px bg-border/50" />
            </div>

            {/* Why It Works */}
            <section className="py-20 relative">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="bg-card border border-border rounded-lg p-8">
                        <h2 className="text-2xl font-semibold mb-8">Everything stays in sync</h2>
                        <div className="grid md:grid-cols-3 gap-8">
                            <div className="space-y-3">
                                <div className="w-10 h-10 bg-muted border border-border rounded flex items-center justify-center">
                                    <div className="w-2 h-2 bg-foreground rounded-full animate-pulse" />
                                </div>
                                <h3 className="text-base font-semibold">Real-time updates</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    When someone adds a song or casts a vote, you see it instantly. No refreshing
                                    needed.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <div className="w-10 h-10 bg-muted border border-border rounded flex items-center justify-center">
                                    <Play className="w-5 h-5" />
                                </div>
                                <h3 className="text-base font-semibold">Perfect sync</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Everyone hears the same moment at the same time. Play, pause, and skip stay
                                    synchronized.
                                </p>
                            </div>
                            <div className="space-y-3">
                                <div className="w-10 h-10 bg-muted border border-border rounded flex items-center justify-center">
                                    <Users className="w-5 h-5" />
                                </div>
                                <h3 className="text-base font-semibold">Built for groups</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Works smoothly whether you're listening with 2 friends or 200. No lag, no delays.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Separator Line */}
            <div className="max-w-6xl mx-auto px-6">
                <div className="h-px bg-border/50" />
            </div>

            {/* Privacy & Security */}
            <section className="py-20 relative">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="max-w-2xl">
                        <h2 className="text-2xl font-semibold mb-6">Privacy & Security</h2>
                        <div className="space-y-4 text-sm text-muted-foreground">
                            <div className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2" />
                                <div>
                                    <span className="text-foreground font-medium">Sign in with Google</span> — Quick and
                                    secure. No passwords to remember.
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2" />
                                <div>
                                    <span className="text-foreground font-medium">Keep rooms private</span> — Only
                                    people with your room code can join.
                                </div>
                            </div>
                            <div className="flex items-start gap-3">
                                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full mt-2" />
                                <div>
                                    <span className="text-foreground font-medium">Your data stays yours</span> — No
                                    tracking, no ads, no data selling.
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Separator Line */}
            <div className="max-w-6xl mx-auto px-6">
                <div className="h-px bg-border/50" />
            </div>

            {/* Final CTA */}
            <section className="py-32 relative">
                <div className="max-w-5xl mx-auto px-6">
                    <div className="flex items-center gap-8">
                        <img
                            src={mode === "dark" ? "/unison-logo-white.svg" : "/unison-logo.svg"}
                            alt="Unison Logo"
                            className="w-32 h-32 flex-shrink-0"
                        />
                        <div className="text-left">
                            <h2 className="text-5xl md:text-6xl font-bold leading-tight">Listen together.</h2>
                            <h2 className="text-5xl md:text-6xl font-bold leading-tight">Decide together.</h2>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-border py-8">
                <div className="max-w-6xl mx-auto px-6">
                    <div className="flex flex-col md:flex-row justify-between gap-8">
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <img
                                    src={mode === "dark" ? "/unison-logo-white.svg" : "/unison-logo.svg"}
                                    alt="Unison Logo"
                                    className="w-6 h-6"
                                />
                                <div className="font-semibold">Unison</div>
                            </div>
                            <div className="text-xs text-muted-foreground">Listen together, anywhere</div>
                        </div>
                        <div className="flex flex-col md:items-end gap-3">
                            <div className="flex items-center gap-2">
                                <div
                                    className={`w-2 h-2 rounded-full ${
                                        serverStatus === "online"
                                            ? "bg-green-500"
                                            : serverStatus === "offline"
                                              ? "bg-red-500"
                                              : "bg-yellow-500 animate-pulse"
                                    }`}
                                />
                                <span className="text-xs text-muted-foreground">
                                    {serverStatus === "online"
                                        ? "All systems online"
                                        : serverStatus === "offline"
                                          ? "System offline"
                                          : "Checking status..."}
                                </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                © {new Date().getFullYear()} Sayak Datta
                            </div>
                        </div>
                    </div>
                </div>
            </footer>
        </main>
    );
}
