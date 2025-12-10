"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Plus, Loader2 } from "lucide-react";
import Image from "next/image";
import type { YouTubeSearchItem, YouTubeVideoDetailsItem, SongMetaData } from "@/lib";

interface SearchPanelProps {
    handleAddSong: (song: SongMetaData) => void;
}

export function SongSection({ handleAddSong }: SearchPanelProps) {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<SongMetaData[]>([]);
    const [hasSearched, setHasSearched] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const formatDuration = (duration: string) => {
        // youtube duration format ISO8601
        const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
        if (!match) return "0:00";
        const hours = parseInt(match[1] || "0");
        const minutes = parseInt(match[2] || "0");
        const seconds = parseInt(match[3] || "0");
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, "0")}`;
    };

    const searchYouTube = async (searchQuery: string) => {
        if (!searchQuery.trim()) return;
        setIsLoading(true);
        setError(null);

        try {
            const apiKey = process.env.NEXT_PUBLIC_YOUTUBE_API_KEY;
            if (!apiKey) throw new Error("YouTube API key not configured");

            searchQuery = searchQuery + " songs";
            const response = await fetch(
                `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=10&key=${apiKey}`,
            );

            if (!response.ok) throw new Error(`YouTube API error: ${response.status}`);

            const data = await response.json();

            const videoIds = data.items.map((item: YouTubeSearchItem) => item.id.videoId).join(",");
            const detailsResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`,
            );

            if (!detailsResponse.ok) throw new Error(`YouTube API error: ${detailsResponse.status}`);

            const detailsData = await detailsResponse.json();

            const durationMap = new Map();
            detailsData.items.forEach((item: YouTubeVideoDetailsItem) => {
                durationMap.set(item.id, item.contentDetails.duration);
            });

            const searchResults: SongMetaData[] = data.items.map((item: YouTubeSearchItem) => ({
                videoId: item.id.videoId,
                title: item.snippet.title,
                channelName: item.snippet.channelTitle,
                duration: formatDuration(durationMap.get(item.id.videoId) || "PT0S"),
                thumbnail: item.snippet.thumbnails.medium?.url,
            }));

            setResults(searchResults);
            setHasSearched(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to search YouTube");
            setResults([]);
            setHasSearched(true);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        searchYouTube(query);
    };

    return (
        <div className="p-4 space-y-6 max-w-4xl mx-auto">
            <h3 className="text-sm font-semibold text-foreground mb-3">Search & Add Songs</h3>
            <div className="space-y-4">
                <div className="space-y-2">
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search songs..."
                                value={query}
                                onChange={e => setQuery(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && !isLoading && handleSearch()}
                                className="pl-9 bg-card border-border rounded-xl h-11 focus:border-accent transition-colors"
                                disabled={isLoading}
                            />
                        </div>
                        <Button
                            onClick={handleSearch}
                            disabled={isLoading || !query.trim()}
                            className="bg-accent text-accent-foreground hover:bg-accent/90 px-6 rounded-xl transition-colors font-medium disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
                        </Button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                        <p className="text-sm text-destructive font-medium">Search Error</p>
                        <p className="text-xs text-destructive/80 mt-1">{error}</p>
                    </div>
                )}

                {/* Search Results */}
                <div className="space-y-2">
                    {results.length > 0 && (
                        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                            {results.length} result{results.length !== 1 ? "s" : ""}
                        </p>
                    )}

                    {results.map((song, idx) => (
                        <div
                            key={idx}
                            className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-accent/30 hover:bg-accent/5 transition-all group"
                        >
                            <Image
                                src={song.thumbnail}
                                alt={song.title}
                                width={40}
                                height={40}
                                className="w-10 h-10 rounded object-cover"
                            />

                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-foreground text-sm truncate group-hover:text-accent transition-colors">
                                    {song.title}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">
                                    {song.channelName} • {song.duration}
                                </p>
                            </div>
                            <Button
                                onClick={() => handleAddSong(song)}
                                size="icon"
                                className="bg-accent text-accent-foreground hover:bg-accent/90 h-8 w-8 flex-shrink-0 transition-colors"
                                title="Add to queue"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}

                    {hasSearched && results.length === 0 && !isLoading && !error && (
                        <div className="text-center py-12 text-muted-foreground">
                            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                                <Search className="h-6 w-6" />
                            </div>
                            <p className="font-medium">No songs found</p>
                            <p className="text-sm">Try a different search term</p>
                        </div>
                    )}

                    {!hasSearched && results.length === 0 && (
                        <div className="text-center py-8 text-muted-foreground">
                            <div className="w-12 h-12 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-3">
                                <div className="text-lg font-bold text-accent/50">+</div>
                            </div>
                            <p className="font-medium text-sm">Start searching</p>
                            <p className="text-xs mt-1">Find your favorite songs on YouTube</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
