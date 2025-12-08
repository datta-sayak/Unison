import { NextResponse } from "next/server";
import { getAuthenticatedUserWithRooms } from "../../lib/authUtils";

export async function GET() {
    try {
        const user = await getAuthenticatedUserWithRooms();
        return NextResponse.json(user);
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: "Authentication failed" }, { status: 400 });
    }
}
