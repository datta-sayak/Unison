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
    requestedBy: string;
    userAvatar: string;
    votes: number;
    addedAt: number;
    sequence?: number;
}

export interface SongQueue {
    videoId: string;
    timestamp: number;
    votes: number;
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
    user: {
        id: string;
        name: string | null;
        email: string;
        avatarUrl: string | null;
    };
}
