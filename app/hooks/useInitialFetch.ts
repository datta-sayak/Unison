import { Participant, RoomUserFromAPI } from "@/lib";
import axios from "axios";
import { Session } from "next-auth";
import { useEffect, useState } from "react";

interface UseInitialFetchProps {
    roomId: string;
    session: Session | null;
    isChecking: boolean;
}

export function useInitialFetch({ isChecking, roomId, session }: UseInitialFetchProps) {
    const [allUsers, setAllUsers] = useState<Participant[]>([]);

    useEffect(() => {
        if (!roomId || !session?.user || isChecking) return;

        const fetchRoomUsers = async () => {
            try {
                const response = await axios.get(`/api/roomusers?roomCode=${roomId}`);
                const roomUsers = response.data;

                const users: Participant[] = roomUsers.map((roomUser: RoomUserFromAPI) => ({
                    id: roomUser.userId,
                    name: roomUser.user.name || roomUser.user.email,
                    avatar: roomUser.user.avatarUrl || roomUser.user.name?.substring(0, 2).toUpperCase(),
                }));

                setAllUsers(users);
            } catch (error) {
                console.error("Failed to fetch room users:", error);
            }
        };

        fetchRoomUsers();
    }, [roomId, session?.user, isChecking]);

    return { allUsers };
}
