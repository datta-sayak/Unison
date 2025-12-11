import { SongMetaData } from "@/lib";
import { addSongMetadataToDb } from "@/lib/addSongMetadataToDb";
import { prismaClient } from "@/lib/db";
import { searchYouTube } from "@/lib/fetchYouTubeV3";
import { NextRequest, NextResponse } from "next/server";

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

        const existingVideoIds = new Set(dbResults.map((s: SongMetaData) => s.videoId));

        const youtubeResults = await searchYouTube(query);
        const uniqueYoutubeResults = youtubeResults.filter((s: SongMetaData) => !existingVideoIds.has(s.videoId));

        addSongMetadataToDb(uniqueYoutubeResults);
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
