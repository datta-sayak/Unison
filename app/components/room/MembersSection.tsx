'use client';

import Image from 'next/image';
import { Shield } from 'lucide-react';
import type { Participant } from '@/lib';

interface MembersSectionProps {
    allUsers: Participant[];
    onlineUsers: Participant[];
}

export function MembersSection({ allUsers, onlineUsers }: MembersSectionProps) {
    return (
        <div className="p-4 space-y-4 max-w-4xl mx-auto">
            <h3 className="text-sm font-semibold text-muted-foreground">
                All Members ({allUsers.length})
            </h3>
            <div className="space-y-2">
                {allUsers.map(member => (
                    <div
                        key={member.id}
                        className="bg-muted/20 rounded-xl p-3 flex items-center gap-3 hover:bg-muted/30 transition-all opacity-60"
                    >
                        <div className="relative flex-shrink-0">
                            {member.avatar ? (
                                <Image
                                    src={member.avatar}
                                    alt={member.name}
                                    width={40}
                                    height={40}
                                    className="rounded-full opacity-70"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-sm font-bold text-accent/70">
                                    {member.name.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-muted-foreground truncate">
                                    {member.name}
                                </p>
                                {member.isHost && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/10 border border-accent/30 text-xs font-semibold text-accent/70">
                                        <Shield className="h-3 w-3" />
                                        Host
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <h3 className="text-sm font-semibold text-foreground mt-6">
                Online Now ({onlineUsers.length})
            </h3>
            <div className="space-y-2">
                {onlineUsers.map(member => (
                    <div
                        key={member.id}
                        className="bg-muted/30 rounded-xl p-3 flex items-center gap-3 hover:bg-muted/50 transition-all"
                    >
                        <div className="relative flex-shrink-0">
                            {member.avatar ? (
                                <Image
                                    src={member.avatar}
                                    alt={member.name}
                                    width={40}
                                    height={40}
                                    className="rounded-full"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-sm font-bold text-accent">
                                    {member.name.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold text-foreground truncate">
                                    {member.name}
                                </p>
                                {member.isHost && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent/20 border border-accent/40 text-xs font-semibold text-accent">
                                        <Shield className="h-3 w-3" />
                                        Host
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-green-500">Online</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
