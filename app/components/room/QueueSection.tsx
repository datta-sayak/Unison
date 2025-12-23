"use client";

import Image from "next/image";
import { ChevronUp, ChevronDown, X } from "lucide-react";
import type { Song, SongMetaData } from "@/lib";

interface QueueSectionProps {
    queue: Song[];
    handleVote: (id: string, direction: "up" | "down") => void;
    handleRemoveSong: (song: SongMetaData) => void;
    loading?: boolean;
    userVotes?: Record<string, "upvote" | "downvote" | null>;
}

export function QueueSection({
    queue,
    handleVote,
    handleRemoveSong,
    loading = false,
    userVotes = {},
}: QueueSectionProps) {
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
                        {queue.map((song, idx) => {
                            const userVote = userVotes[song.videoId];
                            return (
                                <div
                                    key={idx}
                                    className="bg-card/50 rounded-lg p-2.5 sm:p-3 flex gap-2 sm:gap-3 items-center hover:bg-card/80 transition-colors border border-border/50"
                                >
                                    <span className="text-xs text-muted-foreground font-medium flex-shrink-0 w-4 sm:w-5 text-center">
                                        {idx + 1}
                                    </span>
                                    <Image
                                        src={song.thumbnail}
                                        alt={song.title}
                                        width={80}
                                        height={45}
                                        style={{ height: "auto", width: "auto" }}
                                        className="rounded object-cover flex-shrink-0 w-16 h-9 sm:w-20 sm:h-11"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm font-medium text-foreground truncate">
                                            {song.title}
                                        </p>
                                        <p className="text-[10px] sm:text-xs text-muted-foreground truncate">
                                            {song.channelName}
                                        </p>
                                        <p className="text-[10px] sm:text-xs text-muted-foreground/70 mt-0.5 hidden sm:block">
                                            {song.requestedBy}
                                        </p>
                                    </div>

                                    {/* Vote Controls */}
                                    <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 min-w-[80px] sm:min-w-[90px] justify-center">
                                        {userVote !== "upvote" && (
                                            <button
                                                onClick={() => handleVote(song.videoId, "up")}
                                                className="p-1 sm:p-1.5 rounded hover:bg-green-500/10 active:bg-green-500/20 transition-all touch-manipulation"
                                                title="Vote up"
                                            >
                                                <ChevronUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-green-600" />
                                            </button>
                                        )}

                                        <span
                                            className={`min-w-[24px] sm:min-w-[28px] text-center text-xs sm:text-sm font-semibold ${
                                                song.votes > 0
                                                    ? "text-green-600"
                                                    : song.votes < 0
                                                      ? "text-red-600"
                                                      : "text-muted-foreground"
                                            }`}
                                        >
                                            {song.votes}
                                        </span>

                                        {userVote !== "downvote" && (
                                            <button
                                                onClick={() => handleVote(song.videoId, "down")}
                                                className="p-1 sm:p-1.5 rounded hover:bg-red-500/10 active:bg-red-500/20 transition-all touch-manipulation"
                                                title="Vote down"
                                            >
                                                <ChevronDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-600" />
                                            </button>
                                        )}
                                    </div>

                                    {/* Remove Button */}
                                    <button
                                        onClick={() => handleRemoveSong(song)}
                                        className="p-1.5 sm:p-2 rounded hover:bg-destructive/10 active:bg-destructive/20 transition-colors touch-manipulation"
                                        title="Remove from queue"
                                        aria-label="Remove song"
                                    >
                                        <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground hover:text-destructive transition-colors" />
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
