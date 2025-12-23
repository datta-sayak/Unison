import { NextRequest, NextResponse } from "next/server";
import { redisClient } from "@/lib/redis";
import z from "zod";
import { getCachedSession } from "@/lib/cacheSession";

const RemoveFromQueueSchema = z.object({
    roomCode: z.string().length(5),
    videoId: z.string(),
});

export async function POST(req: NextRequest) {
    try {
        const session = await getCachedSession();
        if (!session?.user?.email) {
            return NextResponse.json({
                message: "Unauthenticated",
                status: 401,
            });
        }

        const { roomCode, videoId } = RemoveFromQueueSchema.parse(await req.json());

        await redisClient.hDel(`roomId:${roomCode}`, videoId);
        await redisClient.publish("updated_queue", roomCode);

        return NextResponse.json({
            message: "Removed from queue",
            status: 200,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({
                message: "Invalid input",
                status: 400,
                errors: error.issues,
            });
        }

        return NextResponse.json({
            message: "Failed to remove from queue",
            status: 500,
        });
    }
}
