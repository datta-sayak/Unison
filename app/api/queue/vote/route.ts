import { getCachedSession } from "@/lib/cacheSession";
import { redisClient } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";
import z from "zod";
import { Song } from "@/lib";

const VoteSchema = z.object({
    roomCode: z.string().length(5),
    videoId: z.string(),
    voteState: z.enum(["upvote", "downvote"]),
});

export async function POST(req: NextRequest) {
    const session = await getCachedSession();
    if (!session?.user?.email) {
        return NextResponse.json({
            message: "Unauthenticated",
            status: 401,
        });
    }

    try {
        const { voteState, roomCode, videoId } = VoteSchema.parse(await req.json());
        const queue = await redisClient.hGetAll(`roomId:${roomCode}`);
        const parsedQueue: Song[] = Object.values(queue)
            .map(song => {
                try {
                    return JSON.parse(song);
                } catch {
                    return null;
                }
            })
            .filter(Boolean);
        const currentSong: Song = parsedQueue.find((u: Song) => u.videoId === videoId);

        // Determining and adding newVote to the Song object
        const newVote = voteState === "upvote" ? currentSong.votes + 1 : currentSong.votes - 1;
        currentSong.votes = newVote;

        const hashKey = `roomId:${roomCode}`;

        // To persist the newVote data to the hash set
        await redisClient.hSet(hashKey, { [currentSong.videoId]: JSON.stringify(currentSong) });
        await redisClient.publish("updated_queue", roomCode);

        return NextResponse.json({
            message: "Vote recorded",
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
            message: "Failed to vote",
            status: 500,
        });
    }
}
