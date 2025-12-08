import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { redisClient } from "@/lib/redis";
import z from "zod";

const RemoveFromQueueSchema = z.object({
    roomCode: z.string().length(5),
    songCode: z.string(),
});

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession();
        if (!session?.user?.email) {
            return NextResponse.json({
                message: "Unauthenticated",
                status: 401,
            });
        }

        const { songCode, roomCode } = RemoveFromQueueSchema.parse(await req.json());
        await redisClient.zRem(roomCode, songCode);

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
