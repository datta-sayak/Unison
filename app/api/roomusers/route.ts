import { NextRequest, NextResponse } from 'next/server';
import { prismaClient } from '@/lib/db';
import { getServerSession } from 'next-auth';

export async function GET(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.user?.email) throw new Error('Unauthenticated');

    const { searchParams } = new URL(req.url);
    const roomCode = searchParams.get('roomCode');

    if (!roomCode || roomCode.length !== 5)
        return NextResponse.json({ message: 'Room code is required' }, { status: 400 });

    const roomUsers = await prismaClient.roomUser.findMany({
        where: {
            roomId: roomCode,
        },
        include: {
            user: {
                select: {
                    name: true,
                    avatarUrl: true,
                },
            },
        },
    });

    return NextResponse.json(roomUsers);
}
