"use client";

import Image from "next/image";
import { ChevronUp, ChevronDown } from "lucide-react";
import type { Song } from "@/lib";

interface QueueSectionProps {
    queue: Song[];
    handleVote: (id: string, direction: "up" | "down") => void;
    loading?: boolean;
}

export function QueueSection({ queue, handleVote, loading = false }: QueueSectionProps) {
    return (
        <div className="p-4 space-y-6 max-w-4xl mx-auto">
            {/* Queue List */}
            <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Up Next</h3>
                {loading ? (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground text-sm">Loading queue...</p>
                    </div>
                ) : queue.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-muted-foreground text-sm">Queue is empty</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {queue.map((song, idx) => (
                            <div
                                key={idx}
                                className="bg-muted/30 rounded-xl p-3 flex gap-3 hover:bg-muted/50 transition-all"
                            >
                                <span className="text-xs text-muted-foreground font-semibold pt-0.5 flex-shrink-0 w-4 text-center">
                                    {idx + 1}
                                </span>
                                <Image
                                    src={song.thumbnail}
                                    alt={song.title}
                                    width={70}
                                    height={30}
                                    style={{ height: "auto", width: "auto" }}
                                    className="rounded-lg object-cover flex-shrink-0"
                                />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-foreground truncate">{song.title}</p>
                                    <p className="text-xs text-muted-foreground truncate">{song.channelName}</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Added by {song.requestedBy}</p>
                                </div>
                                <div className="flex flex-col items-center gap-1 flex-shrink-0">
                                    <button
                                        onClick={() => handleVote(song.videoId, "up")}
                                        className="p-1 hover:bg-muted rounded transition-colors"
                                        title="Vote up"
                                    >
                                        <ChevronUp className="w-4 h-4 text-accent" />
                                    </button>
                                    <span className="text-xs font-bold text-accent">{song.votes}</span>
                                    <button
                                        onClick={() => handleVote(song.videoId, "down")}
                                        className="p-1 hover:bg-muted rounded transition-colors"
                                        title="Vote down"
                                    >
                                        <ChevronDown className="w-4 h-4 text-muted-foreground" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
