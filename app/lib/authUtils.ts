import { getCachedSession } from "./cacheSession";
import { prismaClient } from "./db";

export async function getAuthenticatedUser() {
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
    return user;
}

export async function getAuthenticatedUserWithRooms() {
    const session = await getCachedSession();
    if (!session?.user?.email) throw new Error("Unauthenticated");

    const user = await prismaClient.user.findUnique({
        where: {
            email: session.user.email
        }
    })
    if (!user) throw new Error("Invalid User");

    const room = await prismaClient.room.findMany({
        where: {
            OR: [
                { createdById: user.id },
                {  
                    roomUsers: { some: { userId: user.id }}
                }
            ]
        },
        select: {
            roomId: true,
            roomName: true,
            accessMode: true,
            createdAt: true,
            createdBy: {
                select: {
                    name: true,
                    avatarUrl: true
                }
            }
        },
        orderBy: {
            createdAt: "desc"
        }
    })

    const { id, ...res } = { ...user, room };
    return res;
}


/**
 * const user = await prismaClient.user.findUnique({
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
                        },
                    },
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
                                },
                            },
                        },
                    },
                },
            },
        },
    });
 */