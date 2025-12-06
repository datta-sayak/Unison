'use client';

import { Copy, LogOut } from 'lucide-react';
import type { Song, Participant } from '@/lib';

interface InfoSectionProps {
    roomId: string | null;
    allUsers: Participant[];
    queue: Song[];
    handleCopyLink: () => void;
    handleLeaveRoom: () => void;
}

export function InfoSection({
    roomId,
    allUsers,
    queue,
    handleCopyLink,
    handleLeaveRoom,
}: InfoSectionProps) {
    return (
        <div className="p-4 space-y-6 max-w-4xl mx-auto">
            {/* Room Details */}
            <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Room Details</h3>
                <div className="space-y-3">
                    <div className="bg-muted/30 rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Room ID</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-mono font-semibold text-foreground">
                                    {roomId}
                                </span>
                                <button
                                    onClick={handleCopyLink}
                                    className="p-1 hover:bg-muted/50 rounded transition-colors"
                                    title="Copy room link"
                                >
                                    <Copy className="w-3.5 h-3.5 text-accent" />
                                </button>
                            </div>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Members</span>
                            <span className="text-sm font-semibold text-foreground">
                                {allUsers.length}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Queue Length</span>
                            <span className="text-sm font-semibold text-foreground">
                                {queue.length}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-sm font-semibold text-foreground mb-3">Quick Actions</h3>
                <div className="space-y-2">
                    <button
                        onClick={handleCopyLink}
                        className="w-full bg-muted/30 hover:bg-muted/50 rounded-xl p-3 flex items-center gap-3 transition-all text-left"
                    >
                        <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center flex-shrink-0">
                            <Copy className="w-4 h-4 text-accent" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground">Share Room</p>
                            <p className="text-xs text-muted-foreground">Copy invite link</p>
                        </div>
                    </button>

                    <button
                        onClick={handleLeaveRoom}
                        className="w-full bg-destructive/10 hover:bg-destructive/20 rounded-xl p-3 flex items-center gap-3 transition-all text-left"
                    >
                        <div className="w-10 h-10 rounded-lg bg-destructive/20 flex items-center justify-center flex-shrink-0">
                            <LogOut className="w-4 h-4 text-destructive" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-destructive">Leave Room</p>
                            <p className="text-xs text-muted-foreground">
                                Disconnect and return to dashboard
                            </p>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
