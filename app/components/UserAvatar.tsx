"use client";

import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function UserAvatar() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    if (status === "loading" || !session?.user) return null;

    const handleLogout = () => {
        signOut();
        router.push("/");
    };

    return (
        <div className="flex items-center gap-3">
            <div className="flex flex-col items-end">
                <p className="text-sm font-medium text-foreground">{session.user.name}</p>
            </div>

            {/* Avatar with image*/}
            <div className="relative">
                <Button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    variant="ghost"
                    size="icon"
                    className="relative rounded-full overflow-hidden w-10 h-10"
                >
                    {session?.user?.image && (
                        <Image
                            src={session.user.image}
                            alt={session.user.name || "Avatar"}
                            width={40}
                            height={40}
                            className="rounded-full object-cover"
                        />
                    )}
                </Button>

                {/* Dropdown Menu */}
                <div
                    className={`absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg transition-all z-50 ${
                        isMenuOpen ? "opacity-100 visible" : "opacity-0 invisible"
                    }`}
                >
                    <div className="p-4 border-b border-border">
                        <p className="text-sm font-medium text-foreground">{session.user.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">{session.user.email}</p>
                    </div>
                    <Link href="/dashboard" className="block" onClick={() => setIsMenuOpen(false)}>
                        <button className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                            Dashboard
                        </button>
                    </Link>
                    <Link href="/" className="block" onClick={() => setIsMenuOpen(false)}>
                        <button className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors">
                            Home
                        </button>
                    </Link>
                    <button
                        onClick={() => {
                            setIsMenuOpen(false);
                            handleLogout();
                        }}
                        className="w-full text-left bg-destructive/10 text-destructive hover:bg-destructive/20 px-4 py-2 text-sm transition-colors border-border flex items-center gap-2"
                    >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
