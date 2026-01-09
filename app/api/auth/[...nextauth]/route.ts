import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import { prismaClient } from "../../../lib/db";

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        }),
        CredentialsProvider({
            name: "Guest",
            credentials: {
                name: { label: "Name", type: "text", placeholder: "Enter your name" },
            },
            async authorize(credentials) {
                if (!credentials?.name) return null;

                const guestEmail = `${credentials.name}.${Math.floor(Math.random() * 100000)}@unison.guest`;
                const avatarUrl = `https://api.dicebear.com/7.x/avataaars/png?seed=${guestEmail}`;
                const guestUser = await prismaClient.user.create({
                    data: {
                        email: guestEmail,
                        name: credentials.name,
                        avatarUrl: avatarUrl,
                    },
                });

                return {
                    id: guestUser.id,
                    email: guestUser.email,
                    name: guestUser.name,
                    image: avatarUrl,
                };
            },
        }),
    ],
    callbacks: {
        async signIn(params) {
            if (!params.user.email) return false;

            const existingUser = await prismaClient.user.findUnique({
                where: {
                    email: params.user.email,
                },
            });

            if (!existingUser) {
                try {
                    await prismaClient.user.create({
                        data: {
                            email: params.user.email,
                            avatarUrl: params.user.image,
                            name: params.user.name,
                        },
                    });
                    return true;
                } catch (e) {
                    console.error(e);
                    return false;
                }
            }

            return true;
        },
    },
    pages: {
        signIn: "/auth/signin",
    },
});

export { handler as GET, handler as POST };
