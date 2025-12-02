import { NextRequest, NextResponse } from "next/server"
import { z } from "zod"
import { prismaClient } from "../../../lib/db"
import { getAuthenticatedUser } from "../../../lib/authUtils"

const joinSchema = z.object({
    roomCode: z.string(),
    password: z.string().optional()
})

export async function POST(req: NextRequest) {
    try {
        const data = joinSchema.parse(await req.json())
        const user = await getAuthenticatedUser()
        
        const roomWithUserStatus = await prismaClient.room.findUnique({
            where: {
                roomId: data.roomCode
            },
            select: {
                roomId: true,
                roomName: true,
                accessMode: true,
                passwordHash: true,
                roomUsers: {
                    where: {
                        userId: user.id
                    },
                    select: {
                        id: true
                    }
                }
            }
        })

        if (!roomWithUserStatus) {
            return NextResponse.json({ message: "Room not found" }, { status: 404 })
        }
        if (roomWithUserStatus.roomUsers.length > 0) {
            return NextResponse.json({ 
                message: "Already joined",
                roomId: roomWithUserStatus.roomId,
                roomName: roomWithUserStatus.roomName
            }, { status: 200 })
        }
        if (roomWithUserStatus.accessMode === "Private" && roomWithUserStatus.passwordHash) {
            if(!data.password) {
                return NextResponse.json({ message: "This room requires an access code"}, { status: 403 })
            }
            if(roomWithUserStatus.passwordHash !== data.password) {
                return NextResponse.json({ message: "Invalid access code"}, { status: 403 })
            }
        }


        await prismaClient.roomUser.create({
            data: {
                roomId: data.roomCode,
                userId: user.id,
            }
        })

        return NextResponse.json({ 
            message: "Successfully joined room",
            roomId: roomWithUserStatus.roomId,
            roomName: roomWithUserStatus.roomName 
        }, { status: 200 })

    } catch (error) {
        console.error("Error while joining room:", error)
        if (error instanceof z.ZodError) {
            return NextResponse.json({ message: "Invalid credentials" }, { status: 400 })
        }
        const message = error instanceof Error ? error.message : "Failed to join room";
        return NextResponse.json({ message }, { status: 500 })
    }
}