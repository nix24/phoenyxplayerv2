import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import type { PlaylistTrack, Track } from '@prisma/client';

interface TransformedTrack extends Omit<Track, 'data' | 'thumbnail'> {
    url: string;
    thumbnailUrl: string;
}

interface TransformedPlaylistTrack extends Omit<PlaylistTrack, 'track'> {
    track: TransformedTrack;
}

export async function GET(
    request: NextRequest,
    context: { params: { playlistId: string } }
) {
    const { playlistId } = context.params;

    try {
        const playlist = await prisma.playlist.findUnique({
            where: {
                id: playlistId,
            },
            include: {
                tracks: {
                    include: {
                        track: true,
                    },
                    orderBy: {
                        order: 'asc',
                    },
                },
            },
        });

        if (!playlist) {
            return NextResponse.json(
                { error: 'Playlist not found' },
                { status: 404 }
            );
        }

        // Transform the data to match our types
        const transformedPlaylist = {
            ...playlist,
            tracks: playlist.tracks.map((pt) => ({
                ...pt,
                track: {
                    ...pt.track,
                    url: `/api/tracks/${pt.track.id}/audio`,
                    thumbnailUrl: `/api/tracks/${pt.track.id}/thumbnail`,
                    artists: Array.isArray(pt.track.artists)
                        ? pt.track.artists
                        : JSON.parse(pt.track.artists),
                    tags: Array.isArray(pt.track.tags)
                        ? pt.track.tags
                        : JSON.parse(pt.track.tags),
                    // Remove binary data
                    data: undefined,
                    thumbnail: undefined,
                },
            })),
        };

        return NextResponse.json(transformedPlaylist);
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch playlist' },
            { status: 500 }
        );
    }
}
