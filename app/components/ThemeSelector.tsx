"use client";

import { useTheme } from "@/providers";
import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeSelector() {
    const { mode, setMode } = useTheme();
    const [mounted, setMounted] = useState(false);

    // To prevent the hydration error while setting the saved theme which was conflicting with the SSR
    useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted) return null;

    return (
        <Button
            onClick={() => setMode(mode === "light" ? "dark" : "light")}
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            title={mode === "light" ? "Switch to dark mode" : "Switch to light mode"}
        >
            {mode === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
        </Button>
    );
}
