"use client";

import Image from "next/image";
import type { Participant } from "@/lib";

interface MemberWithStatus extends Participant {
    isOnline: boolean;
}

interface MembersSectionProps {
    allUsers: MemberWithStatus[];
}

export function MembersSection({ allUsers }: MembersSectionProps) {
    return (
        <div className="p-4 space-y-4 max-w-4xl mx-auto">
            <h3 className="text-sm font-semibold text-muted-foreground">Members ({allUsers.length})</h3>
            <div className="space-y-2">
                {allUsers.map(member => {
                    const isOnline = member.isOnline ?? false;

                    return (
                        <div
                            key={member.id}
                            className={`rounded-xl p-3 flex items-center gap-3 ${!isOnline && "opacity-60"}`}
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
                                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold bg-accent/20 text-accent">
                                        {member.name.substring(0, 2).toUpperCase()}
                                    </div>
                                )}
                                {isOnline && (
                                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-card" />
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold truncate">{member.name}</p>
                                </div>
                                {isOnline && <p className="text-xs text-green-500">Online</p>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
