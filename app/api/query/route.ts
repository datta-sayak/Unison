import { SongMetaData } from "@/lib";
import { prismaClient } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

const formatDuration = (duration: string) => {
    // youtube duration format ISO8601
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return "0:00";
    const hours = parseInt(match[1] || "0");
    const minutes = parseInt(match[2] || "0");
    const seconds = parseInt(match[3] || "0");
    if (hours > 0) {
        return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

const searchYouTube = async (searchQuery: string) => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) throw new Error("YouTube API key not configured");
    searchQuery = searchQuery + " songs";

    const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=10&key=${apiKey}`,
    );

    if (!response.ok) throw new Error(`YouTube API error: ${response.status}`);

    const data = await response.json();
    const videoIds = data.items.map((item: any) => item.id.videoId).join(",");

    const detailsResponse = await fetch(
        `https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${videoIds}&key=${apiKey}`,
    );
    if (!detailsResponse.ok) throw new Error(`YouTube API error: ${detailsResponse.status}`);

    const detailsData = await detailsResponse.json();
    const durationMap = new Map();
    detailsData.items.forEach((item: any) => {
        durationMap.set(item.id, item.contentDetails.duration);
    });

    return data.items.map((item: any) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        channelName: item.snippet.channelTitle,
        duration: formatDuration(durationMap.get(item.id.videoId) || "PT0S"),
        thumbnail: item.snippet.thumbnails.medium?.url,
    }));
};

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const query = searchParams.get("q");

        if (!query) {
            return NextResponse.json({ message: "Invalid Query" }, { status: 400 });
        }

        const dbSongs = await prismaClient.song.findMany({
            where: {
                OR: [
                    {
                        title: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                    {
                        channelName: {
                            contains: query,
                            mode: "insensitive",
                        },
                    },
                ],
            },
            take: 20,
            orderBy: {
                id: "desc",
            },
        });

        const dbResults = dbSongs.map(song => ({
            videoId: song.youtubeId,
            title: song.title,
            channelName: song.channelName,
            duration: song.duration,
            thumbnail: song.image,
        }));

        if (dbResults.length >= 10) {
            return NextResponse.json({ songs: dbResults, source: "database" }, { status: 200 });
        }

        const youtubeResults = await searchYouTube(query);

        const existingVideoIds = new Set(dbResults.map(s => s.videoId));
        const uniqueYoutubeResults = youtubeResults.filter(s => !existingVideoIds.has(s.videoId));
        const combinedResults = [...dbResults, ...uniqueYoutubeResults];

        return NextResponse.json(
            { songs: combinedResults, source: dbResults.length > 0 ? "both" : "youtube" },
            { status: 200 },
        );
    } catch (error) {
        console.error("Failed to search song: ", error);
        const errMessage = error instanceof Error ? error.message : "Error while searching";
        return NextResponse.json({
            message: errMessage,
            songs: [],
            status: 500,
        });
    }
}
