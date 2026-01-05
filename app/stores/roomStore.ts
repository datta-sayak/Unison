import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Song, Participant, ChatMessage } from "@/lib";

interface RoomState {
    queue: Song[];
    currentIndex: number;
    isPlaying: boolean;
    messages: ChatMessage[];
    onlineUsers: Participant[];
    allUsers: Participant[];
    activeSection: string;
    userVotes: Record<string, Record<string, "upvote" | "downvote" | null>>;
    setQueue: (queue: Song[]) => void;
    setCurrentIndex: (index: number) => void;
    setIsPlaying: (playing: boolean) => void;
    setMessages: (messages: ChatMessage[]) => void;
    addMessage: (message: ChatMessage) => void;
    setOnlineUsers: (users: Participant[]) => void;
    setAllUsers: (users: Participant[] | ((prev: Participant[]) => Participant[])) => void;
    setActiveSection: (section: string) => void;
    setUserVotes: (votes: Record<string, Record<string, "upvote" | "downvote" | null>>) => void;
    resetRoom: () => void;
}

const initialState = {
    queue: [],
    currentIndex: 0,
    isPlaying: false,
    messages: [],
    onlineUsers: [],
    allUsers: [],
    activeSection: "queue",
    userVotes: {},
};

export const useRoomStore = create<RoomState>()(
    persist(
        set => ({
            ...initialState,
            setQueue: queue => set({ queue }),
            setCurrentIndex: index => set({ currentIndex: index }),
            setIsPlaying: playing => set({ isPlaying: playing }),
            setMessages: messages => set({ messages }),
            addMessage: message => set(state => ({ messages: [message, ...state.messages] })),
            setOnlineUsers: users => set({ onlineUsers: users }),
            setAllUsers: users =>
                set(state => ({
                    allUsers: typeof users === "function" ? users(state.allUsers) : users,
                })),
            setActiveSection: section => set({ activeSection: section }),
            setUserVotes: votes => set({ userVotes: votes }),
            resetRoom: () => set(initialState),
        }),
        {
            name: "room_storage",
            partialize: state => ({
                queue: state.queue,
                currentIndex: state.currentIndex,
                isPlaying: state.isPlaying,
                messages: state.messages,
                activeSection: state.activeSection,
                userVotes: state.userVotes,
            }),
        },
    ),
);
