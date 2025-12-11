"use client";

import { useEffect, useRef, useState } from "react";
import { Music, Play, Pause, SkipForward } from "lucide-react";
import type { Song } from "@/lib";
import { Button } from "../ui/button";

interface YouTubePlayerSectionProps {
    queue: Song[];
    onSongEnd?: (videoId: string) => void;
}

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

export function YouTubePlayerSection({ queue, onSongEnd }: YouTubePlayerSectionProps) {
    const playerRef = useRef<any>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isReady, setIsReady] = useState(false);

    const currentSong = queue[currentIndex] || null;

    // Load YouTube IFrame API
    useEffect(() => {
        if (window.YT) {
            setIsReady(true);
            return;
        }

        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
            setIsReady(true);
        };
    }, []);

    // Initialize player when ready and song available
    useEffect(() => {
        if (!isReady || !currentSong) return;

        if (playerRef.current) {
            playerRef.current.loadVideoById(currentSong.videoId);
            return;
        }

        playerRef.current = new window.YT.Player("youtube-player", {
            height: "100%",
            width: "100%",
            videoId: currentSong.videoId,
            playerVars: {
                autoplay: 1,
                controls: 0, // Disable all YouTube controls
                rel: 0, // Don't show related videos
                modestbranding: 1, // Hide YouTube logo
                enablejsapi: 1,
                origin: window.location.origin,
                disablekb: 1, // Disable keyboard controls
                fs: 0, // Disable fullscreen button
                iv_load_policy: 3, // Hide video annotations
                cc_load_policy: 0, // Hide closed captions
                playsinline: 1, // Play inline on mobile
            },
            events: {
                onReady: (event: any) => {
                    event.target.playVideo();
                    setIsPlaying(true);
                },
                onStateChange: (event: any) => {
                    // 0 = ended, 1 = playing, 2 = paused
                    if (event.data === 0) {
                        handleSongEnd();
                    } else if (event.data === 1) {
                        setIsPlaying(true);
                    } else if (event.data === 2) {
                        setIsPlaying(false);
                    }
                },
                onError: (event: any) => {
                    console.error("YouTube player error:", event.data);
                    // Error codes: 2 = invalid parameter, 5 = HTML5 error,
                    // 100 = video not found, 101/150 = embedding disabled
                    if (event.data === 101 || event.data === 150) {
                        // Video embedding disabled, skip to next
                        console.log("Video embedding disabled, skipping...");
                        setTimeout(() => handleSongEnd(), 1000);
                    } else if (event.data === 100) {
                        // Video not found
                        console.log("Video not found, skipping...");
                        setTimeout(() => handleSongEnd(), 1000);
                    }
                },
            },
        });
    }, [isReady, currentSong]);

    const handleSongEnd = () => {
        if (currentSong && onSongEnd) {
            onSongEnd(currentSong.videoId);
        }

        // Move to next song if available
        if (currentIndex < queue.length - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            setCurrentIndex(0); // Loop back to start
        }
    };

    const handlePlayPause = () => {
        if (!playerRef.current) return;

        if (isPlaying) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
    };

    const handleSkip = () => {
        handleSongEnd();
    };

    if (!currentSong) {
        return (
            <div className="bg-card">
                <div className="aspect-video w-full max-w-4xl mx-auto bg-black flex items-center justify-center">
                    <div className="text-white text-center">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-white/10 flex items-center justify-center">
                            <Music className="w-8 h-8" />
                        </div>
                        <p className="text-lg font-semibold">No song playing</p>
                        <p className="text-sm text-white/70">Add songs to the queue to start listening</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-card">
            <div className="aspect-video w-full max-w-4xl mx-auto bg-black relative">
                        <div id="youtube-player" className="w-full h-full pointer-events-none" />
            
                {/* Song Info Overlay */}
                <div className="absolute bottom-0 left-0 right-0 top-80 bg-gradient-to-t from-background/90 via-background/50 to-transparent p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0 mt-12">
                            <p className="text-foreground font-bold text-xl truncate">{currentSong.title}</p>
                            <p className="text-muted-foreground text-base truncate mt-1">{currentSong.channelName}</p>
                        </div>
                        <div className="flex gap-3 ml-8 mt-12">
                            <Button
                                onClick={handlePlayPause}
                                className="w-16 h-16 rounded-full bg-card/60 hover:bg-card/90 border border-border flex items-center justify-center transition-all"
                            >
                                {isPlaying ? <Pause className="w-8 h-8 text-accent"/> : <Play className="w-8 h-8 text-accent" />}
                            </Button>
                            <Button
                                onClick={handleSkip}
                                className="w-16 h-16 rounded-full bg-card/60 hover:bg-card/90 border border-border flex items-center justify-center transition-all"
                                disabled={queue.length <= 1}
                            >
                                <SkipForward className="w-8 h-8 text-accent" strokeWidth={2.5} />
                            </Button>
                        </div>
                    </div>
                    <div className="mt-3 text-accent text-base font-medium">
                        Playing {currentIndex + 1} of {queue.length}
                    </div>
                </div>
            </div>
        </div>
    );
}
