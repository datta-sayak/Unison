"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/UserAvatar";
import { ThemeSelector } from "@/components/ThemeSelector";
import { useTheme } from "../providers";

export function AppHeader() {
    const { mode } = useTheme();
    const { data } = useSession();
    return (
        <header className="sticky top-0 z-40 border-b border-border/50 backdrop-blur-md bg-background/80 relative">
            <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-2">
                <Link href="/" className="flex items-center gap-1">
                    <img src={mode === 'dark' ? "/unison-logo-white.svg" : "/unison-logo.svg"} alt="Unison Logo" className="w-6 h-6" />
                    <h1 className="text-lg font-bold tracking-tight">Unison</h1>
                </Link>
                <div className="flex items-center gap-2">
                    <ThemeSelector />
                    {data?.user ? (
                        <UserAvatar />
                    ) : (
                        <Link href="/api/auth/signin">
                            <Button variant="outline" size="sm" className="h-8 text-xs">
                                Sign In
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
