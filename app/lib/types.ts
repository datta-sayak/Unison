export interface Participant {
    id: string;
    name: string;
    avatar: string;
    isHost: boolean;
    isActive: boolean;
}
export interface SongMetaData {
    videoId: string;
    title: string;
    channelName: string;
    thumbnail: string;
    duration: string;
}

export interface Song extends SongMetaData {
    requestedBy?: string;
    votes?: number;
}

/**
 *
 * BASE type of the song metadata
 *
 * videoId
 * title
 * channelName
 * thumbnail
 * duration
 *
 */

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