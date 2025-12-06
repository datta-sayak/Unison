import { getServerSession } from 'next-auth';
import { prismaClient } from './db';

export async function getAuthenticatedUser() {
    const session = await getServerSession();
    if (!session?.user?.email) throw new Error('Unauthenticated');

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

    if (!user) throw new Error('Invalid User');
    return user;
}

export async function getAuthenticatedUserWithRooms() {
    const session = await getServerSession();
    if (!session?.user?.email) throw new Error('Unauthenticated');

    const user = await prismaClient.user.findUnique({
        where: {
            email: session.user.email,
        },
        select: {
            name: true,
            email: true,
            avatarUrl: true,
            createdAt: true,
            createdRooms: {
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
                        select: {
                            roomUsers: true,
                            queueEntries: true,
                        },
                    },
                    playbackState: {
                        select: {
                            currentEntry: {
                                select: {
                                    song: {
                                        select: {
                                            title: true,
                                            smallImage: true,
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
                orderBy: {
                    createdAt: 'desc',
                },
            },
            roomUsers: {
                select: {
                    room: {
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
                                select: {
                                    roomUsers: true,
                                    queueEntries: true,
                                },
                            },
                            playbackState: {
                                select: {
                                    currentEntry: {
                                        select: {
                                            song: {
                                                select: {
                                                    title: true,
                                                    smallImage: true,
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    });

    if (!user) throw new Error('Invalid User');
    return user;
}
