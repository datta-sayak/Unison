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
