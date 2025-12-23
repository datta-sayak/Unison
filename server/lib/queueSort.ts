export interface SongMetaData {
    videoId: string;
    title: string;
    channelName: string;
    thumbnail: string;
    duration: string;
}

export interface Song extends SongMetaData {
    requestedBy: string;
    userAvatar: string;
    votes: number;
    addedAt: number;
    sequence?: number;
}

export function QueueSort(data: Song[]) {
    const sorted = data.sort((a: Song, b: Song) => {
        if (a.votes != b.votes) {
            return b.votes - a.votes;
        } else {
            return a.addedAt - b.addedAt;
        }
    });

    return sorted.map((song: Song, i) => ({
        sequence: i,
        ...song,
    }));
}
