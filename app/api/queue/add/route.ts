import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { redisClient } from "@/lib/redis";
import z from "zod";
import type { Song } from "@/lib";

const AddToQueueSchema = z.object({
    roomCode: z.string().length(5),
    videoId: z.string(),
    title: z.string(),
    channelName: z.string(),
    thumbnail: z.string(),
    duration: z.string(),
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

        const parsedReq = AddToQueueSchema.parse(await req.json());
        const timestamp = Date.now();
        const songQueueValue: Song = {
            videoId: parsedReq.videoId,
            title: parsedReq.title,
            channelName: parsedReq.channelName,
            thumbnail: parsedReq.thumbnail,
            duration: parsedReq.duration,
            requestedBy: session.user.name,
        };
        await redisClient.zAdd(parsedReq.roomCode, { score: timestamp, value: JSON.stringify(songQueueValue) });
        await redisClient.publish("updated_queue", parsedReq.roomCode);

        return NextResponse.json({
            message: "Added to queue",
            status: 200,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({
                message: "Invalid input",
                errors: error.issues,
                status: 400,
            });
        }

        return NextResponse.json({
            message: "Failed to add to queue",
            status: 500,
        });
    }
}
