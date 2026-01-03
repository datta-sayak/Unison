"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { SessionProvider } from "next-auth/react";
import React from "react";
import { Toaster } from "sonner";

type Mode = "light" | "dark";

interface ThemeContextType {
    mode: Mode;
    setMode: (mode: Mode) => void;
    roomId?: string;
    setRoomId: (id: string) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

function ThemeProviderInner({ children }: { children: React.ReactNode }) {
    const [mode, setMode] = useState<Mode>("light");
    const [roomId, setRoomId] = useState<string>("");

    useEffect(() => {
        document.documentElement.className = mode;
    }, [mode]);

    return (
        <ThemeContext.Provider
            value={{
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
