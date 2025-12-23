import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { redisClient } from "@/lib/redis";
import { QueueSort } from "@/lib/queueSort";
import { Song } from "@/lib";

export async function GET(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.user?.email) {
        return NextResponse.json({
            message: "Unauthenticated",
            status: 401,
        });
    }

    try {
        const { searchParams } = new URL(req.url);
        const roomCode = searchParams.get("roomCode");

        if (!roomCode || roomCode.length !== 5) {
            return NextResponse.json({ message: "Room code is required" }, { status: 400 });
        }

        const hashKey = `roomId:${roomCode}`;
        const queue = await redisClient.hGetAll(hashKey);
        const parsedQueue: Song[] = Object.values(queue)
            .map(song => {
                try {
                    return JSON.parse(song);
                } catch {
                    return null;
                }
            })
            .filter(Boolean);

        // Sort Queue using custom logic
        const sortedQueue: Song[] = QueueSort(parsedQueue);

        return NextResponse.json({
            message: "Queue fetched successfully",
            status: 200,
            data: {
                queue: sortedQueue,
            },
        });
    } catch (error) {
        console.error("Failed to fetch queue: ", error);
        return NextResponse.json({
            message: "Failed to fetch queue",
            status: 500,
        });
    }
}
