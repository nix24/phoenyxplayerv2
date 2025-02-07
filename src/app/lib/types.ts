import type { Track as PrismaTrack, Playlist as PrismaPlaylist, PlaylistTrack as PrismaPlaylistTrack } from '@prisma/client'

// Base track type with parsed fields and required URLs
export interface Track extends Omit<PrismaTrack, 'artists' | 'tags' | 'data' | 'thumbnail' | 'thumbnailType'> {
    artists: string[]
    tags: string[]
    url: string
    thumbnailUrl?: string
    bpm?: number
}

// Playlist track with properly typed track
export interface PlaylistTrack extends Omit<PrismaPlaylistTrack, 'track'> {
    track: Track
}

// Full playlist with typed tracks
export interface Playlist extends Omit<PrismaPlaylist, 'tracks'> {
    tracks: PlaylistTrack[]
}