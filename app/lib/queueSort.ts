import type { Song } from "./types";

export function QueueSort(data: Song[]) {
    const sorted = data.sort((a, b) => {
        if (a.votes != b.votes) {
            return b.votes - a.votes;
        } else {
            return a.addedAt - b.addedAt;
        }
    });

    return sorted.map((song, i) => ({
        sequence: i,
        ...song,
    }));
}
