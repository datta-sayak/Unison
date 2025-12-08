import { NextResponse, NextRequest } from "next/server";
import { prismaClient } from "../../../lib/db";
import { getAuthenticatedUser } from "../../../lib/authUtils";
import { z } from "zod";

const createRoomSchema = z.object({
    email: z.string(),
    isPrivate: z.boolean().default(false),
    password: z.string().optional(),
    roomName: z.string().optional(),
    themeId: z.string().optional(),
});

export async function POST(req: NextRequest) {
    try {
        const data = createRoomSchema.parse(await req.json());
        const user = await getAuthenticatedUser();

        if (data.isPrivate && (!data.password || data.password.trim() === "")) {
            return NextResponse.json({ message: "Private rooms need a password" }, { status: 400 });
        }

        // ROOM CREATION
        let newRoomId: string;
        let roomExists = true;

        do {
            newRoomId = Math.random().toString(36).substring(2, 7).toUpperCase();
            const existingRoom = await prismaClient.room.findUnique({
                where: {
                    roomId: newRoomId,
                },
            });
            if (!existingRoom) roomExists = false;
        } while (roomExists);

        let roomName = data.roomName;
        if (!roomName) roomName = `Room ${newRoomId}`;

        const room = await prismaClient.room.create({
            data: {
                roomId: newRoomId,
                roomName: data.roomName || roomName,
                createdById: user.id,
                accessMode: data.isPrivate ? "Private" : "Public",
                passwordHash: data.isPrivate ? data.password : null,
                themeId: data.themeId || null,
            },
        });

        await prismaClient.roomUser.create({
            data: {
                roomId: newRoomId,
                userId: user.id,
            },
        });

        return NextResponse.json({
            room,
            message: "Room created successfully",
        });
    } catch (error) {
        console.error("Create room error:", error);

        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: "Invalid request data" }, { status: 400 });
        }
        return NextResponse.json({ message: "Failed to create room" }, { status: 500 });
    }
}
