import { SongMetaData } from "./types";

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

export const searchYouTube = async (searchQuery: string): Promise<SongMetaData[]> => {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) throw new Error("YouTube API key not configured");

    const response = await fetch(
        `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&videoCategoryId=10&maxResults=10&key=${apiKey}`,
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

    const res = data.items.map((item: any) => ({
        videoId: item.id.videoId,
        title: item.snippet.title,
        channelName: item.snippet.channelTitle,
        duration: formatDuration(durationMap.get(item.id.videoId) || "PT0S"),
        thumbnail: item.snippet.thumbnails.medium?.url,
    }));

    return res.filter((song: any) => {
        return song.videoId && song.title && song.channelName && song.thumbnail && song.duration;
    });
};
