import { prismaClient } from "./db";
import { SongMetaData } from "./types";

export async function addSongMetadataToDb(receivedDatas: SongMetaData[]) {
    try {
        const songMetaData = await prismaClient.song.createMany({
            data: receivedDatas.map( ( song: SongMetaData) => ({
                youtubeId: song.videoId,
                duration: song.duration,
                image: song.thumbnail,
                channelName: song.channelName,
                title: song.title,
            })),
            skipDuplicates: true
        });
        
        return songMetaData
    } catch (error) {
        throw new Error("Failed to upload song MetaData: ", error);
    }
}
