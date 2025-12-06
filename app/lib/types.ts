export interface Song {
    id: string;
    title: string;
    channel: string;
    requestedBy: string;
    thumbnail: string;
    votes: number;
    duration: string;
}

export interface Participant {
    id: string;
    name: string;
    avatar: string;
    isHost: boolean;
    isActive: boolean;
}

export interface SongInput {
    id: string;
    title: string;
    channel: string;
    thumbnail: string;
    duration: string;
    videoId: string;
}

export interface ChatMessage {
    id: string;
    user: string;
    avatar: string;
    message: string;
    timestamp: string;
}

export interface RoomUserFromAPI {
    id: string;
    roomId: string;
    userId: string;
    lastSeen: string;
    muted: boolean;
    user: {
        id: string;
        name: string | null;
        email: string;
        avatarUrl: string | null;
    };
}

export interface YouTubeSearchItem {
    id: {
        videoId: string;
    };
    snippet: {
        title: string;
        channelTitle: string;
        thumbnails: {
            medium?: {
                url: string;
            };
        };
    };
}

export interface YouTubeVideoDetailsItem {
    id: string;
    contentDetails: {
        duration: string;
    };
}

export interface YouTubeSearchResponse {
    items: YouTubeSearchItem[];
}
