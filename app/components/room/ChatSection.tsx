'use client';

import { useRef } from 'react';
import Image from 'next/image';
import { Send } from 'lucide-react';
import type { ChatMessage } from '@/lib';

interface ChatSectionProps {
    messages: ChatMessage[];
    newMessage: string;
    setNewMessage: React.Dispatch<React.SetStateAction<string>>;
    handleSendMessage: () => void;
}

export function ChatSection({
    messages,
    newMessage,
    setNewMessage,
    handleSendMessage,
}: ChatSectionProps) {
    const chatContainerRef = useRef<HTMLDivElement | null>(null);

    return (
        <div className="flex flex-col h-[calc(100vh-300px)] max-w-4xl mx-auto w-full">
            <div className="px-4 pt-4 pb-3">
                <h3 className="text-sm font-semibold text-foreground">Room Chat</h3>
            </div>
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto px-4 pb-4 space-y-3 flex flex-col-reverse"
            >
                <div className="space-y-3 flex flex-col-reverse">
                    {messages.map(msg => (
                        <div key={msg.id} className="flex gap-2">
                            {msg.avatar ? (
                                <Image
                                    src={msg.avatar}
                                    alt={msg.user}
                                    width={32}
                                    height={32}
                                    className="rounded-full flex-shrink-0 w-8 h-8 object-cover"
                                />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-accent/20 flex items-center justify-center text-xs font-bold text-accent flex-shrink-0">
                                    {msg.user.substring(0, 2).toUpperCase()}
                                </div>
                            )}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-xs font-semibold text-foreground">
                                        {msg.user}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{msg.timestamp}</p>
                                </div>
                                <p className="text-sm text-foreground bg-muted/50 rounded-xl px-3 py-2 break-words">
                                    {msg.message}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-card/50 backdrop-blur-sm">
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Send a message..."
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
                        className="flex-1 bg-muted/30 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-accent/50 transition-colors placeholder-muted-foreground"
                    />
                    <button
                        onClick={handleSendMessage}
                        className="p-2 bg-accent hover:bg-accent/90 text-accent-foreground rounded-lg transition-colors flex-shrink-0"
                        title="Send message"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}
