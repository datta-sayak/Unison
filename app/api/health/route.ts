import { NextResponse } from "next/server";

export async function GET() {
    try {
        const serverUrl = process.env.NEXT_PUBLIC_WEBSOCKET_SERVER_URL || "http://localhost:4000";

        const response = await fetch(serverUrl, { cache: "no-store" });
        const data = await response.json();

        return NextResponse.json(data);
    } catch (error) {
        console.error("Health check failed:", error);
        return NextResponse.json({
            message: "Failed to reach server",
            status: "offline",
        });
    }
}
