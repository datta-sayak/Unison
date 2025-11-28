import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import { prismaClient } from "../../../lib/db"

const handler = NextAuth({
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID ?? "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
        })
    ],
    callbacks: {
        async signIn(params){
            if(!params.user.email)  return false

            const existingUser = await prismaClient.user.findUnique({
                where: {
                    email: params.user.email
                }
            })

            if(!existingUser){
                try {
                    await prismaClient.user.create({
                        data: {
                            email: params.user.email,
                            avatarUrl: params.user.image,
                            name: params.user.name
                        }   
                    })
                return true
                }
                catch (e) {
                    console.log(e)
                    return false
                }
            }

            return true
        }
    },
    pages: {
        signIn: "/auth/signin",
    }
})

export { handler as GET, handler as POST }