"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import React from "react";
import { Toaster } from "sonner";

type Theme = "blue" | "teal" | "lilac" | "rose" | "sage" | "warm";
type Mode = "light" | "dark";

interface ThemeContextType {
    currentTheme: Theme;
    setCurrentTheme: (theme: Theme) => void;
    mode: Mode;
    setMode: (mode: Mode) => void;
    roomId?: string;
    setRoomId: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function ThemeProviderInner({ children }: { children: React.ReactNode }) {
    const [currentTheme, setCurrentTheme] = useState<Theme>("blue");
    const [mode, setMode] = useState<Mode>("light");
    const [roomId, setRoomId] = useState<string>("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const savedTheme = localStorage.getItem("Unison-theme") as Theme;
        const savedMode = localStorage.getItem("Unison-mode") as Mode;
        if (savedTheme) setCurrentTheme(savedTheme);
        if (savedMode) setMode(savedMode);
    }, []);

    useEffect(() => {
        if (mounted) {
            localStorage.setItem("Unison-theme", currentTheme);
            document.documentElement.className = `theme-${currentTheme} ${mode}`;
        }
    }, [currentTheme, mounted, mode]);

    return (
        <ThemeContext.Provider
            value={{
                currentTheme,
                setCurrentTheme,
                mode,
                setMode,
                roomId,
                setRoomId,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
}

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <ThemeProviderInner>{children}</ThemeProviderInner>
            <Toaster position="top-center" richColors />
        </SessionProvider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("wrap useTheme inside ThemeProvider");
    }
    return context;
}
