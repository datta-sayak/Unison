import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "sonner";
import type { RoomUserFromAPI } from "@/lib";
import { Session } from "next-auth";

interface UseRoomMembershipProps {
    roomId: string;
    session: Session | null;
    status: string;
}

export function useRoomMembership({ roomId, session, status }: UseRoomMembershipProps) {
    const router = useRouter();
    const isMemberRef = useRef(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        if (!roomId || !session?.user || status === "loading" || isMemberRef.current) return;

        const checkUserPresentInRoom = async () => {
            try {
                setIsChecking(true);
                const { data } = await axios.get(`/api/roomusers?roomCode=${roomId}`);
                const isMember = data.some((roomUsers: RoomUserFromAPI) => roomUsers.user.email === session.user.email);

                if (!isMember) {
                    toast.info("You need to join this room");
                    router.push(`/join?roomId=${roomId}`);
                    return;
                } else {
                    isMemberRef.current = true;
                }
                setIsChecking(false);
            } catch (error) {
                console.error("Failed to check room membership:", error);
                toast.error("Failed to join room");
                router.push("/dashboard");
            }
        };

        checkUserPresentInRoom();
    }, [roomId, session?.user, status, router, isMemberRef]);

    return { isChecking };
}
