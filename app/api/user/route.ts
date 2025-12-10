import { NextResponse } from "next/server";
import { prismaClient } from "@/lib/db";
import { getCachedSession } from "@/lib/cacheSession";

export async function GET() {
    try {
        const session = await getCachedSession();
        if (!session?.user?.email) throw new Error("Unauthenticated");

        const user = await prismaClient.user.findUnique({
            where: {
                email: session.user.email,
            },
            select: {
                id: true,
                name: true,
                email: true,
                avatarUrl: true,
                createdAt: true,
            },
        });
        if (!user) throw new Error("Invalid User");

        const room = await prismaClient.room.findMany({
            where: {
                OR: [
                    { createdById: user.id },
                    {
                        roomUsers: { some: { userId: user.id } },
                    },
                ],
            },
            select: {
                roomId: true,
                roomName: true,
                accessMode: true,
                createdAt: true,
                createdBy: {
                    select: {
                        name: true,
                        avatarUrl: true,
                    },
                },
                _count: {
                    select: { roomUsers: true },
                },
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const { id, ...res } = { ...user, room };
        return NextResponse.json(res);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Authentication failed" }, { status: 400 });
    }
}
