import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prismaClient } from '@/lib/db';
import { redisClient } from '@/lib/redis';

export async function POST(req: NextRequest) {
    const session = await getServerSession();
    if (!session?.user?.email) throw new Error('Unauthenticated');
    const roomId = req.nextUrl.searchParams.get('roomId');

    if (!roomId || roomId.length !== 5) {
        return NextResponse.json({ message: 'Invalid room ID' }, { status: 400 });
    }

    return NextResponse.json({ roomId, sessionUserEmail: session.user.email });
}
