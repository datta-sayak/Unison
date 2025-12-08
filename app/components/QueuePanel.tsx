"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronUp, ChevronDown, Trash2 } from "lucide-react";

interface QueueItem {
    id: string;
    title: string;
    channel: string;
    requestedBy: string;
    thumbnail: string;
    votes: number;
    duration: string;
}

interface QueuePanelProps {
    items: QueueItem[];
    onVote: (id: string, direction: "up" | "down") => void;
}

export function QueuePanel({ items, onVote }: QueuePanelProps) {
    const [currentPlaying] = useState<QueueItem | null>(items.length > 0 ? items[0] : null);
    const queueItems = items.slice(1);

    return (
        <div className="space-y-8">
            {/* Now Playing - Enhanced */}
            {currentPlaying && (
                <div className="space-y-4">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                        Now Playing
                    </h2>
                    <div className="group bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl overflow-hidden shadow-lg hover:shadow-xl transition-all hover:border-accent/30">
                        <div className="relative">
                            <img
                                src={currentPlaying.thumbnail || "/placeholder.svg"}
                                alt={currentPlaying.title}
                                className="w-full aspect-video object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                            <div className="absolute top-4 right-4 bg-accent px-3 py-1 rounded-full">
                                <span className="text-xs font-semibold text-accent-foreground">
                                    {currentPlaying.duration}
                                </span>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <p className="font-bold text-lg text-foreground text-balance leading-snug mb-2">
                                    {currentPlaying.title}
                                </p>
                                <p className="text-sm text-muted-foreground font-medium">{currentPlaying.channel}</p>
                            </div>

                            <div className="flex items-center justify-between pt-2">
                                <span className="text-xs text-muted-foreground">
                                    Requested by{" "}
                                    <span className="font-semibold text-foreground">{currentPlaying.requestedBy}</span>
                                </span>
                            </div>

                            <div className="w-full space-y-2">
                                <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                                    <div className="bg-gradient-to-r from-accent to-accent/60 h-1.5 rounded-full w-1/3 transition-all duration-300"></div>
                                </div>
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>1:15</span>
                                    <span>{currentPlaying.duration}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Queue List - Enhanced */}
            <div className="space-y-4">
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Queue ({queueItems.length} songs)
                </h2>

                {queueItems.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                            <div className="w-8 h-8 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full animate-spin"></div>
                        </div>
                        <p className="text-muted-foreground font-medium">Queue is empty</p>
                        <p className="text-sm text-muted-foreground mt-1">Search and add songs to get started</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                        {queueItems.map((item, index) => (
                            <div
                                key={item.id}
                                className="flex items-center gap-4 p-4 bg-card border border-border rounded-xl hover:border-accent/30 hover:shadow-md transition-all group"
                            >
                                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center">
                                    <span className="text-xs font-bold text-foreground">{index + 2}</span>
                                </div>

                                {/* Thumbnail */}
                                <img
                                    src={item.thumbnail || "/placeholder.svg"}
                                    alt={item.title}
                                    className="w-12 h-12 rounded-lg object-cover"
                                />

                                {/* Song Info */}
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-foreground text-sm truncate group-hover:text-accent transition-colors">
                                        {item.title}
                                    </p>
                                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="truncate">{item.channel}</span>
                                        <span>•</span>
                                        <span>{item.duration}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">by {item.requestedBy}</p>
                                </div>

                                <div className="flex items-center gap-1 flex-shrink-0 bg-muted/50 rounded-lg p-1">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onVote(item.id, "up")}
                                        className="h-7 w-7 text-muted-foreground hover:text-accent hover:bg-accent/10 transition-colors"
                                        title="Upvote"
                                    >
                                        <ChevronUp className="h-4 w-4" />
                                    </Button>
                                    <span className="text-xs font-bold text-foreground w-6 text-center">
                                        {item.votes}
                                    </span>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => onVote(item.id, "down")}
                                        className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                                        title="Downvote"
                                    >
                                        <ChevronDown className="h-4 w-4" />
                                    </Button>
                                </div>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Remove from queue"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
