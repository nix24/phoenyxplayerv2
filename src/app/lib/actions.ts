import { prisma } from './prisma';
import type { Track } from './types';

export async function getTracks(page = 1, limit = 20) {
  try {
    const skip = (page - 1) * limit;
    const [tracks, total] = await Promise.all([
      prisma.track.findMany({
        take: limit,
        skip,
        orderBy: {
          id: 'desc'
        },
        select: {
          id: true,
          title: true,
          artists: true,
          tags: true,
          fileSize: true,
        },
      }),
      prisma.track.count(),
    ]);

    return {
      tracks: tracks.map((track) => ({
        ...track,
        url: `/api/tracks/${track.id}/audio`,
        thumbnailUrl: `/api/tracks/${track.id}/thumbnail`,
        artists: Array.isArray(track.artists) ? track.artists : JSON.parse(track.artists),
        tags: Array.isArray(track.tags) ? track.tags : JSON.parse(track.tags),
      })),
      totalPages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error('Database error:', error);
    throw new Error('Failed to fetch tracks');
  }
}
