import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { redisClient } from "@/lib/redis";

export async function GET(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.user?.email) {
        return NextResponse.json({
            message: "Unauthenticated",
            status: 401,
        });
    }

    const { searchParams } = new URL(req.url);
    const roomCode = searchParams.get("roomCode");

    if (!roomCode || roomCode.length !== 5) {
        return NextResponse.json({ message: "Room code is required" }, { status: 400 });
    }

    const queueItems = await redisClient.zRange(roomCode, 0, -1);
    const parsedQueue = queueItems.map((u: string) => JSON.parse(u))
    return NextResponse.json({
        message: "Queue fetched successfully",
        status: 200,
        data: {
            queue: parsedQueue,
        },
    });
}
