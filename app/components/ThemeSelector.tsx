"use client";

import { useTheme } from "@/providers";
import { Button } from "@/components/ui/button";
import { X, Check, Moon, Sun } from "lucide-react";

type Theme = "blue" | "teal" | "lilac" | "rose" | "sage" | "warm";

const THEMES: { name: string; value: Theme; color: string }[] = [
    { name: "Soft Blue", value: "blue", color: "oklch(0.65 0.08 260)" },
    { name: "Muted Teal", value: "teal", color: "oklch(0.62 0.09 195)" },
    { name: "Soft Lilac", value: "lilac", color: "oklch(0.68 0.08 310)" },
    { name: "Dusty Rose", value: "rose", color: "oklch(0.68 0.09 25)" },
    { name: "Muted Green", value: "sage", color: "oklch(0.65 0.06 150)" },
    { name: "Warm Gray", value: "warm", color: "oklch(0.68 0.08 50)" },
];

interface ThemeSelectorProps {
    onClose: () => void;
}

export function ThemeSelector({ onClose }: ThemeSelectorProps) {
    const { currentTheme, setCurrentTheme, mode, setMode } = useTheme();

    return (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl p-8 max-w-sm w-full shadow-2xl border border-border space-y-6 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Customize</h2>
                        <p className="text-sm text-muted-foreground mt-1">Theme and appearance</p>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={onClose}
                        className="text-muted-foreground hover:text-foreground h-8 w-8"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Display Mode
                    </label>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setMode("light")}
                            variant={mode === "light" ? "default" : "outline"}
                            className="flex-1 flex items-center justify-center gap-2"
                        >
                            <Sun className="h-4 w-4" />
                            Light
                        </Button>
                        <Button
                            onClick={() => setMode("dark")}
                            variant={mode === "dark" ? "default" : "outline"}
                            className="flex-1 flex items-center justify-center gap-2"
                        >
                            <Moon className="h-4 w-4" />
                            Dark
                        </Button>
                    </div>
                </div>

                <div className="space-y-3">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        Accent Color
                    </label>
                    <div className="grid grid-cols-3 gap-3">
                        {THEMES.map(theme => (
                            <button
                                key={theme.value}
                                onClick={() => {
                                    setCurrentTheme(theme.value);
                                }}
                                className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-all focus-visible:ring-2 focus-visible:ring-accent"
                            >
                                <div
                                    className={`w-12 h-12 rounded-full border-2 transition-all ${
                                        currentTheme === theme.value
                                            ? "border-accent scale-110 ring-2 ring-accent/30"
                                            : "border-border hover:border-accent/50"
                                    }`}
                                    style={{ backgroundColor: theme.color }}
                                >
                                    {currentTheme === theme.value && (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Check className="h-5 w-5 text-white" />
                                        </div>
                                    )}
                                </div>
                                <span className="text-xs font-semibold text-foreground text-center text-balance leading-tight">
                                    {theme.name}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                <Button onClick={onClose} className="w-full bg-accent text-accent-foreground hover:bg-accent/90">
                    Done
                </Button>
            </div>
        </div>
    );
}
