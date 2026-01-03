"use client";

import { UserAvatar } from "@/components/UserAvatar";
import { ThemeSelector } from "@/components/ThemeSelector";

export function AppHeader() {
    return (
        <header className="sticky top-0 z-40 border-b border-border backdrop-blur bg-background/90">
            <div className="flex items-center px-4 md:px-6 py-3 max-w-full">
                <div className="flex-1 flex justify-start">
                    <ThemeSelector />
                </div>
                <h1 className="text-2xl font-black text-foreground tracking-wide">Unison</h1>
                <div className="flex-1 flex justify-end">
                    <UserAvatar />
                </div>
            </div>
        </header>
    );
}
