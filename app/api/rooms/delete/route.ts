import { getCachedSession } from "@/lib/cacheSession";
import { NextRequest, NextResponse } from "next/server";
import { prismaClient } from "@/lib/db";
import { redisClient } from "@/lib/redis";

export async function POST(req: NextRequest) {
    const session = await getCachedSession();
    if (!session) {
        return NextResponse.json({
            message: "Unauthenticated",
            status: 400,
        });
    }

    const { roomCode } = await req.json();
    if (!roomCode || roomCode.length !== 5) {
        return NextResponse.json({
            message: "Invalid room ID",
            status: 404,
        });
    }

    try {
        // To make sure only the creator of the room is able to delete
        const roomToDelete = await prismaClient.room.findUnique({
            where: {
                roomId: roomCode,
                createdBy: {
                    email: session.user.email,
                },
            },
            select: {
                roomId: true,
                createdById: true,
            },
        });

        if (!roomToDelete) {
            return NextResponse.json({
                message: "Not Authorised to delete room",
                status: 403,
            });
        }

        // Also delete the redis roomQueue key value store
        await redisClient.del(roomToDelete.roomId);
        await prismaClient.roomUser.deleteMany({
            where: {
                roomId: roomToDelete.roomId,
            },
        });
        await prismaClient.room.delete({
            where: {
                roomId: roomToDelete.roomId,
            },
        });

        return NextResponse.json({
            message: "Deleted room succesfully",
            status: 200,
        });
    } catch (error) {
        console.error("Deletion of room FAILED:", error);
        return NextResponse.json({
            message: "Failed to delete room",
            status: 500,
        });
    }
}
