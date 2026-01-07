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
    getPlayerState: () => { isPlaying: boolean; timestamp: number; currentVideoId: string; sentAt: number } | null;
    applySync: (data: {
        isPlaying: boolean;
        timestamp: number;
        currentVideoId: string;
        sentAt: number;
    }) => Promise<void>;
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
        const [currentSong, setCurrentSong] = useState<Song | null>(null);
        const currentVideoIdRef = useRef<string | null>(null);
        const [needsUserInteraction, setNeedsUserInteraction] = useState(false);
        const hasUserInteractedRef = useRef(false);
        const newJoinSyncRef = useRef<{ timestamp: number; receivedAt: number } | null>(null);
        const youtubePlayerPromiseRef = useRef<{ resolve: () => void } | null>(null);

        const loadingSongRef = useRef<{
            isPlaying: boolean;
            timestamp: number;
            currentVideoId: string;
            receivedAt: number;
        } | null>(null);

        // Keeping the current song playing when the queue is reordered
        useEffect(() => {
            if (currentVideoIdRef.current && queue.length > 0) {
                const currentVideoIndex = queue.findIndex(song => song.videoId === currentVideoIdRef.current);
                if (currentVideoIndex !== -1 && currentVideoIndex !== currentIndex) {
                    // To keep on playing that song until it ends
                    setCurrentIndex(currentVideoIndex);
                    setCurrentSong(queue[currentVideoIndex]);
                }
            } else if (queue.length === 0) {
                setCurrentSong(null);
            }
        }, [queue]);

        function timeCompensation(sentAtTime: number, timestamp: number) {
            const receivedAtTime = Date.now();
            const elapsedTime = receivedAtTime - sentAtTime;
            let elapsedTimeSec = elapsedTime / 1000; // In seconds with decimal precision

            if (elapsedTimeSec < 0) {
                elapsedTimeSec = 0;
            }
            // console.log({
            //     sentAtTime: sentAtTime,
            //     receivedAtTime: receivedAtTime,
            //     timestamp: timestamp,
            //     elapsedTimeSec: elapsedTimeSec,
            //     compensatedTimestamp: timestamp + elapsedTimeSec,
            // });

            return { compensatedTimestamp: timestamp + elapsedTimeSec, receivedAtTime };
        }

        useImperativeHandle(
            ref,
            () => ({
                getPlayerState: () => {
                    if (!playerRef.current || !currentSong || !isReady) return null;

                    try {
                        const timestamp = playerRef.current.getCurrentTime() || 0;
                        return {
                            isPlaying,
                            timestamp,
                            currentVideoId: currentSong.videoId,
                            sentAt: Date.now(),
                        };
                    } catch (error) {
                        console.error(error);
                        return null;
                    }
                },
                applySync: async (data: {
                    isPlaying: boolean;
                    timestamp: number;
                    currentVideoId: string;
                    sentAt: number;
                }) => {
                    const { compensatedTimestamp, receivedAtTime } = timeCompensation(data.sentAt, data.timestamp);

                    const songIndex = queue.findIndex(song => song.videoId === data.currentVideoId);
                    if (songIndex === -1) return;

                    if (!hasUserInteractedRef.current && data.isPlaying) {
                        setNeedsUserInteraction(true);
                        newJoinSyncRef.current = {
                            receivedAt: data.sentAt,
                            timestamp: data.timestamp,
                        };
                    }

                    loadingSongRef.current = {
                        isPlaying: data.isPlaying,
                        timestamp: compensatedTimestamp,
                        currentVideoId: data.currentVideoId,
                        receivedAt: receivedAtTime,
                    };

                    setCurrentIndex(songIndex);
                    setCurrentSong(queue[songIndex]);

                    return new Promise<void>(resolve => {
                        youtubePlayerPromiseRef.current = { resolve };
                    });
                },
            }),
            [currentIndex, isPlaying, currentSong, queue],
        );

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

            const handlePlayBackState = (data: {
                isPlaying: boolean;
                timestamp: number;
                currentVideoId: string;
                senderId: string;
                sentAt: number;
            }) => {
                if (data.senderId === userEmail || !playerRef.current) return;

                // This makes sure if by chance 2 users are not on the ssame song when playing it syncs the videoId first
                if (data.currentVideoId && data.currentVideoId !== currentVideoIdRef.current) {
                    playerRef.current.loadVideoById(data.currentVideoId);
                    currentVideoIdRef.current = data.currentVideoId;
                }

                const { compensatedTimestamp } = timeCompensation(data.sentAt, data.timestamp);

                if (data.isPlaying) {
                    // The purpose of seekTo over here is to reduce the cumulative network delay over succesive play/pauses
                    // Hence improving the sync efficiency

                    playerRef.current.seekTo(compensatedTimestamp, true);
                    // The "true" is for also including and loading the non-buffered part of the video

                    playerRef.current.playVideo();
                    setIsPlaying(true);
                } else {
                    playerRef.current.pauseVideo();
                    setIsPlaying(false);
                }
            };

            const handleSongChange = (data: { videoId: string; senderId: string }) => {
                if (data.senderId === userEmail) return;

                const actualIndex = queue.findIndex(song => song.videoId === data.videoId);

                if (actualIndex !== -1) {
                    // Reset the video reference first
                    currentVideoIdRef.current = null;
                    // Setting the actual index of the song as on vote the queue changed for other users
                    setCurrentIndex(actualIndex);
                    setCurrentSong(queue[actualIndex]);

                    if (playerRef.current && typeof playerRef.current.loadVideoById === "function") {
                        playerRef.current.loadVideoById(data.videoId);
                        currentVideoIdRef.current = data.videoId;
                    }
                }
            };

            socket.on("playback_controls", handlePlayBackState);
            socket.on("change_song", handleSongChange);

            return () => {
                socket.off("playback_controls", handlePlayBackState);
                socket.off("change_song", handleSongChange);
            };
        }, [socket, userEmail]);

        // Autoplay first song if no sync received
        useEffect(() => {
            if (queue.length > 0 && !currentSong && isReady) {
                setCurrentSong(queue[0]);
                setCurrentIndex(0);
            }
        }, [queue, currentSong, isReady]);

        const handleSongEnd = () => {
            if (currentSong && onSongEnd) {
                onSongEnd(currentSong.videoId);
            }
            const nextIndex = currentIndex < queue.length - 1 ? currentIndex + 1 : 0;
            const nextSong = queue[nextIndex];
            currentVideoIdRef.current = null;
            setCurrentIndex(nextIndex);
            setCurrentSong(nextSong);

            socket?.emit("change_song", {
                roomId,
                videoId: nextSong?.videoId || "",
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
                        autoplay: 0,
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
                                // Compensate for the buffering delay
                                const { compensatedTimestamp } = timeCompensation(
                                    loadingSongRef.current.receivedAt,
                                    loadingSongRef.current.timestamp,
                                );

                                // Here 0.3 sec is the apprx constant delay to change the state of the video
                                event.target.seekTo(compensatedTimestamp + 0.3, true);

                                if (loadingSongRef.current.isPlaying) {
                                    event.target.playVideo();
                                    setIsPlaying(true);
                                } else {
                                    event.target.pauseVideo();
                                    setIsPlaying(false);
                                }

                                newJoinSyncRef.current.timestamp = loadingSongRef.current.timestamp;
                                newJoinSyncRef.current.receivedAt = loadingSongRef.current.receivedAt;
                                loadingSongRef.current = null;

                                if (youtubePlayerPromiseRef.current) {
                                    youtubePlayerPromiseRef.current.resolve();
                                    youtubePlayerPromiseRef.current = null;
                                }
                            } else {
                                event.target.playVideo();
                                setIsPlaying(true);
                            }
                        },
                        onStateChange: (event: any) => {
                            // 0 = ended, 1 = playing, 2 = paused, 5 - cued
                            if (event.data === 0) {
                                handleSongEnd();
                            } else if (event.data === 1) {
                                setIsPlaying(true);
                            } else if (event.data === 2) {
                                setIsPlaying(false);
                            } else if (event.data === 5) {
                                if (loadingSongRef.current) {
                                    const { compensatedTimestamp } = timeCompensation(
                                        loadingSongRef.current.receivedAt,
                                        loadingSongRef.current.timestamp,
                                    );
                                    event.target.seekTo(compensatedTimestamp, true);

                                    if (loadingSongRef.current.isPlaying) {
                                        event.target.playVideo();
                                        setIsPlaying(true);
                                    } else {
                                        event.target.pauseVideo();
                                        setIsPlaying(false);
                                    }

                                    loadingSongRef.current = null;

                                    if (youtubePlayerPromiseRef.current) {
                                        youtubePlayerPromiseRef.current.resolve();
                                        youtubePlayerPromiseRef.current = null;
                                    }
                                } else if (isPlaying) {
                                    event.target.playVideo();
                                }
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
                // This if condition is for when the song is changed

                if (playerRef.current && typeof playerRef.current.loadVideoById === "function") {
                    playerRef.current.loadVideoById(currentSong.videoId);
                    currentVideoIdRef.current = currentSong.videoId;
                }
            }
        }, [isReady, currentSong]);

        const handlePlayPause = () => {
            if (!playerRef.current) return;

            hasUserInteractedRef.current = true;
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
                currentVideoId: currentVideoIdRef.current,
                senderId: userEmail,
                sentAt: Date.now(),
            });
        };

        const handleSkip = () => {
            handleSongEnd();
        };

        const handleUserInteraction = () => {
            if (!playerRef.current) return;

            hasUserInteractedRef.current = true;
            setNeedsUserInteraction(false);

            if (newJoinSyncRef.current) {
                const { compensatedTimestamp } = timeCompensation(
                    newJoinSyncRef.current.receivedAt,
                    newJoinSyncRef.current.timestamp,
                );
                playerRef.current.seekTo(compensatedTimestamp, true);
                newJoinSyncRef.current = null;
            }

            playerRef.current.playVideo();
            setIsPlaying(true);
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

                    {/* Interaction Overlay - Shows on top when needed */}
                    {needsUserInteraction && (
                        <div className="absolute inset-0 bg-gradient-to-br from-black/50 to-gray-900/40 backdrop-blur-md z-10 flex flex-col items-center justify-center gap-4 p-6 text-center">
                            <h3 className="text-xl font-semibold text-white">A song is currently playing</h3>
                            <Button
                                onClick={handleUserInteraction}
                                size="lg"
                                className="bg-white text-black hover:bg-gray-100 shadow-md"
                            >
                                Play
                            </Button>
                        </div>
                    )}

                    {/* Song Info Overlay */}
                    {!needsUserInteraction && (
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
                    )}
                </div>
            </div>
        );
    },
);

YouTubePlayerSection.displayName = "YouTubePlayerSection";
