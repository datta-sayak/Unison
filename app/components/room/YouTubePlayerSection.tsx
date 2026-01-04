"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from "react";
import { Music, Play, Pause, SkipForward, Loader2 } from "lucide-react";
import type { Song } from "@/lib";
import { Button } from "../ui/button";
import { Socket } from "socket.io-client";

interface YouTubePlayerSectionProps {
    queue: Song[];
    onSongEnd?: (videoId: string) => void;
    socket: Socket | null;
    roomId: string;
    userEmail: string;
}

export interface YouTubePlayerHandle {
    getPlayerState: () => { isPlaying: boolean; timestamp: number; currentSongIndex: number } | null;
    applySync: (data: { isPlaying: boolean; timestamp: number; currentSongIndex: number }) => void;
}

declare global {
    interface Window {
        YT: any;
        onYouTubeIframeAPIReady: () => void;
    }
}

export const YouTubePlayerSection = forwardRef<YouTubePlayerHandle, YouTubePlayerSectionProps>(
    ({ queue, socket, roomId, onSongEnd, userEmail }, ref) => {
        const playerRef = useRef<any>(null);
        const [currentIndex, setCurrentIndex] = useState(0);
        const [isPlaying, setIsPlaying] = useState(false);
        const [isReady, setIsReady] = useState(false);
        const [isLoading, setIsLoading] = useState(true);
        const currentVideoIdRef = useRef<string | null>(null);

        const currentSong = queue[currentIndex] || null;
        const loadingSongRef = useRef<{ isPlaying: boolean; timestamp: number } | null>(null);

        useImperativeHandle(ref, () => ({
            getPlayerState: () => {
                if (!playerRef.current || !currentSong) return null;

                try {
                    const timestamp = playerRef.current.getCurrentTime() || 0;
                    return { isPlaying, timestamp, currentSongIndex: currentIndex };
                } catch (error) {
                    console.error(error);
                    return null;
                }
            },
            applySync: (data: { isPlaying: boolean; timestamp: number; currentSongIndex: number }) => {
                loadingSongRef.current = {
                    isPlaying: data.isPlaying,
                    timestamp: data.timestamp,
                };
                setCurrentIndex(data.currentSongIndex);
            },
        }));

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

            const handlePlayBackState = (data: { isPlaying: boolean; timestamp: number; senderId: string }) => {
                if (data.senderId === userEmail || !playerRef.current) return;

                if (data.isPlaying) {
                    // The main initial seek 2 sync is done with the help of "loadingSongRef"
                    // The purpose of seekTo over here is to reduce the cumulative network delay over succesive play/pauses
                    // Hence improving the sync efficiency
                    playerRef.current.seekTo(data.timestamp, true);

                    playerRef.current.playVideo();
                    setIsPlaying(true);
                } else {
                    playerRef.current.pauseVideo();
                    setIsPlaying(false);
                }
            };

            const handleSongChange = (data: { currentSongIndex: number; senderId: string }) => {
                if (data.senderId === userEmail) return;
                setCurrentIndex(data.currentSongIndex);
            };

            socket.on("playback_controls", handlePlayBackState);
            socket.on("change_song", handleSongChange);

            return () => {
                socket.off("playback_controls", handlePlayBackState);
                socket.off("change_song", handleSongChange);
            };
        }, [socket, userEmail]);

        const handleSongEnd = () => {
            if (currentSong && onSongEnd) {
                onSongEnd(currentSong.videoId);
            }

            const nextIndex = currentIndex < queue.length - 1 ? currentIndex + 1 : 0;
            setCurrentIndex(nextIndex);

            socket?.emit("change_song", {
                roomId,
                currentSongIndex: nextIndex,
                senderId: userEmail,
            });
        };

        useEffect(() => {
            if (!isReady) return;

            // Clear the player when queue is empty
            if (!currentSong) {
                if (playerRef.current && typeof playerRef.current.destroy === "function") {
                    playerRef.current.destroy();
                    playerRef.current = null;
                    currentVideoIdRef.current = null;
                }
                return;
            }

            // Initialize player if dosnt exist
            if (!playerRef.current) {
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
                            if (loadingSongRef.current) {
                                event.target.seekTo(loadingSongRef.current.timestamp, true);
                                if (loadingSongRef.current.isPlaying) {
                                    event.target.playVideo();
                                    setIsPlaying(true);
                                } else {
                                    event.target.pauseVideo();
                                    setIsPlaying(false);
                                }
                                loadingSongRef.current = null;
                            } else {
                                event.target.playVideo();
                                setIsPlaying(true);
                            }
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
                            if (event.data === 100 || event.data === 101 || event.data === 150) {
                                setTimeout(() => handleSongEnd(), 1000);
                            }
                        },
                    },
                });
                currentVideoIdRef.current = currentSong.videoId;
                return;
            }

            if (currentSong.videoId !== currentVideoIdRef.current) {
                if (playerRef.current && typeof playerRef.current.loadVideoById === "function") {
                    playerRef.current.loadVideoById(currentSong.videoId);
                    currentVideoIdRef.current = currentSong.videoId;
                }
            }
        }, [isReady, currentSong]);

        const handlePlayPause = () => {
            if (!playerRef.current) return;

            const newPlayingState = !isPlaying;

            if (newPlayingState) {
                playerRef.current.playVideo();
            } else {
                playerRef.current.pauseVideo();
            }

            setIsPlaying(newPlayingState);

            socket?.emit("playback_controls", {
                roomId,
                isPlaying: newPlayingState,
                timestamp: playerRef.current.getCurrentTime(),
                senderId: userEmail,
            });
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
                                <p className="text-muted-foreground text-base truncate mt-1">
                                    {currentSong.channelName}
                                </p>
                            </div>
                            <div className="flex gap-3 ml-8">
                                <Button
                                    onClick={handlePlayPause}
                                    className="w-16 h-16 rounded-full bg-card/60 hover:bg-card/90 border border-border flex items-center justify-center transition-all"
                                >
                                    {isPlaying ? (
                                        <Pause className="w-8 h-8 text-primary" />
                                    ) : (
                                        <Play className="w-8 h-8 text-primary" />
                                    )}
                                </Button>
                                <Button
                                    onClick={handleSkip}
                                    className="w-16 h-16 rounded-full bg-card/60 hover:bg-card/90 border border-border flex items-center justify-center transition-all"
                                    disabled={queue.length <= 1}
                                >
                                    <SkipForward className="w-8 h-8 text-primary" strokeWidth={2.5} />
                                </Button>
                            </div>
                        </div>
                        <div className="mt-3 text-primary text-base font-medium">
                            Playing {currentIndex + 1} of {queue.length}
                        </div>
                    </div>
                </div>
            </div>
        );
    },
);

YouTubePlayerSection.displayName = "YouTubePlayerSection";
