import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { Song, Participant, ChatMessage } from "@/lib";

interface RoomData {
    queue: Song[];
    currentIndex: number;
    isPlaying: boolean;
    messages: ChatMessage[];
    onlineUsers: Participant[];
    allUsers: Participant[];
    activeSection: string;
    userVotes: Record<string, Record<string, "upvote" | "downvote" | null>>;
}

interface RoomState {
    currentRoomId: string | null;
    rooms: Record<string, RoomData>;

    getCurrentRoomData: () => RoomData;

    setCurrentRoomId: (roomId: string) => void;
    setQueue: (roomId: string, queue: Song[]) => void;
    setCurrentIndex: (roomId: string, index: number) => void;
    setIsPlaying: (roomId: string, playing: boolean) => void;
    setMessages: (roomId: string, messages: ChatMessage[]) => void;
    addMessage: (roomId: string, message: ChatMessage) => void;
    setOnlineUsers: (roomId: string, users: Participant[]) => void;
    setAllUsers: (roomId: string, users: Participant[] | ((prev: Participant[]) => Participant[])) => void;
    setActiveSection: (roomId: string, section: string) => void;
    setUserVotes: (roomId: string, votes: Record<string, Record<string, "upvote" | "downvote" | null>>) => void;
    resetRoom: (roomId: string) => void;
}

const initialState: RoomData = {
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
        (set, get) => ({
            currentRoomId: null,
            rooms: {},

            getCurrentRoomData: () => {
                const { currentRoomId, rooms } = get();
                if (!currentRoomId) return initialState;
                return rooms[currentRoomId] || initialState;
            },

            setCurrentRoomId: (roomId: string) => {
                set(state => {
                    if (!state.rooms[roomId]) {
                        return {
                            currentRoomId: roomId,
                            rooms: { ...state.rooms, [roomId]: { ...initialState } },
                        };
                    }
                    return { currentRoomId: roomId };
                });
            },

            setQueue: (roomId, queue) =>
                set(state => ({
                    rooms: { ...state.rooms, [roomId]: { ...state.rooms[roomId], queue } },
                })),

            setCurrentIndex: (roomId, index) =>
                set(state => ({
                    rooms: { ...state.rooms, [roomId]: { ...state.rooms[roomId], currentIndex: index } },
                })),

            setIsPlaying: (roomId, playing) =>
                set(state => ({
                    rooms: { ...state.rooms, [roomId]: { ...state.rooms[roomId], isPlaying: playing } },
                })),

            setMessages: (roomId, messages) =>
                set(state => ({
                    rooms: { ...state.rooms, [roomId]: { ...state.rooms[roomId], messages } },
                })),

            addMessage: (roomId, message) =>
                set(state => {
                    const room = state.rooms[roomId] || initialState;
                    return {
                        rooms: {
                            ...state.rooms,
                            [roomId]: { ...room, messages: [message, ...room.messages] },
                        },
                    };
                }),

            setOnlineUsers: (roomId, users) =>
                set(state => ({
                    rooms: { ...state.rooms, [roomId]: { ...state.rooms[roomId], onlineUsers: users } },
                })),

            setAllUsers: (roomId, users) =>
                set(state => {
                    const room = state.rooms[roomId] || initialState;
                    const allUsers = typeof users === "function" ? users(room.allUsers) : users;
                    return {
                        rooms: { ...state.rooms, [roomId]: { ...room, allUsers } },
                    };
                }),

            setActiveSection: (roomId, section) =>
                set(state => ({
                    rooms: { ...state.rooms, [roomId]: { ...state.rooms[roomId], activeSection: section } },
                })),

            setUserVotes: (roomId, votes) =>
                set(state => ({
                    rooms: { ...state.rooms, [roomId]: { ...state.rooms[roomId], userVotes: votes } },
                })),

            resetRoom: roomId =>
                set(state => {
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    const { [roomId]: _, ...remainingRooms } = state.rooms;
                    return { rooms: remainingRooms };
                }),
        }),
        {
            name: "room_storage",
            partialize: state => ({
                currentRoomId: state.currentRoomId,
                rooms: state.rooms,
            }),
        },
    ),
);
