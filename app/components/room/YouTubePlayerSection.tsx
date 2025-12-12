"use client";

import { useEffect, useRef, useState } from "react";
import { Music, Play, Pause, SkipForward, Loader2 } from "lucide-react";
import type { Song } from "@/lib";
import { Button } from "../ui/button";
import { Socket } from "socket.io-client";

interface YouTubePlayerSectionProps {
    queue: Song[];
    onSongEnd?: (videoId: string) => void;
    socket: Socket | null;
    roomId: string;
}

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

export function YouTubePlayerSection({ queue, socket, roomId, onSongEnd }: YouTubePlayerSectionProps) {
    const playerRef = useRef<any>(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const isHostControlRef = useRef(false);

    const currentSong = queue[currentIndex] || null;

    // Load YouTube IFrame API
    useEffect(() => {
        if (window.YT) {
            setIsReady(true);
            setIsLoading(false);
            return;
        }

        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

        window.onYouTubeIframeAPIReady = () => {
            setIsReady(true);
            setIsLoading(false);
        };
    }, []);

    useEffect(() => {
        if (!socket) return;

        const handlePlayBackState = (data: { isPlaying: boolean; timestamp: number }) => {
            if (!playerRef.current || isHostControlRef.current) {
                isHostControlRef.current = false;
                return;
            }

            if (data.isPlaying) {
                playerRef.current.playVideo();
                playerRef.current.seekTo(data.timestamp, true);
            } else {
                playerRef.current.pauseVideo();
            }
        };

        const handleSongChange = (data: { currentSongIndex: number }) => {
            if (isHostControlRef.current) {
                isHostControlRef.current = false;
                return;
            }
            setCurrentIndex(data.currentSongIndex);
        };

        socket.on("playback_controls", handlePlayBackState);
        socket.on("change_song", handleSongChange);

        return () => {
            socket.off("playback_controls", handlePlayBackState);
            socket.off("change_song", handleSongChange);
        };
    }, [socket]);

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
                    if (event.data === 100 || event.data === 101 || event.data === 150) {
                        // Video embedding disabled, skip to next
                        console.log("Video playback error, skipping...");
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

        const nextIndex = currentIndex < queue.length - 1 ? currentIndex + 1 : 0;
        setCurrentIndex(nextIndex);

        if (socket) {
            isHostControlRef.current = true;
            socket.emit("change_song", {
                roomId,
                currentSongIndex: nextIndex,
            });
        }
    };

    const handlePlayPause = () => {
        if (!playerRef.current) return;

        if (isPlaying) {
            playerRef.current.pauseVideo();
        } else {
            playerRef.current.playVideo();
        }
        const newPlayingState = !isPlaying;
        if (socket) {
            socket.emit("playback_controls", {
                roomId,
                isPlaying: newPlayingState,
                timestamp: playerRef.current.getCurrentTime(),
            });
        }
    };

    const handleSkip = () => {
        handleSongEnd();
    };

    if (isLoading) {
        return (
            <div className="bg-card">
                <div className="aspect-video w-full max-w-4xl mx-auto bg-accent/20 flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="w-12 h-12 mx-auto mb-4 text-accent animate-spin" />
                        <p className="text-lg font-semibold text-foreground">Loading Player</p>
                    </div>
                </div>
            </div>
        );
    }

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
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-background/90 via-background/70 to-transparent p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                            <p className="text-foreground font-bold text-xl truncate">{currentSong.title}</p>
                            <p className="text-muted-foreground text-base truncate mt-1">{currentSong.channelName}</p>
                        </div>
                        <div className="flex gap-3 ml-8">
                            <Button
                                onClick={handlePlayPause}
                                className="w-16 h-16 rounded-full bg-card/60 hover:bg-card/90 border border-border flex items-center justify-center transition-all"
                            >
                                {isPlaying ? (
                                    <Pause className="w-8 h-8 text-accent" />
                                ) : (
                                    <Play className="w-8 h-8 text-accent" />
                                )}
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
