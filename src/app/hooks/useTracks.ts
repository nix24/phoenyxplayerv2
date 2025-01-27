import { useInfiniteQuery } from '@tanstack/react-query';
import type { Track } from '@/app/lib/types';

interface TracksResponse {
  tracks: Track[];
  totalPages: number;
  currentPage: number;
}

async function fetchTracks({ pageParam = 1 }): Promise<TracksResponse> {
  const response = await fetch(`/api/tracks?page=${pageParam}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  const data = await response.json();
  return {
    ...data,
    tracks: data.tracks.map((track: Track) => ({
      ...track,
      url: `/api/tracks/${track.id}/audio`,
      thumbnailUrl: `/api/tracks/${track.id}/thumbnail`,
      artists: Array.isArray(track.artists) ? track.artists : JSON.parse(track.artists),
      tags: Array.isArray(track.tags) ? track.tags : JSON.parse(track.tags),
    })),
  };
}

export function useTracks() {
  return useInfiniteQuery({
    queryKey: ['tracks'],
    queryFn: fetchTracks,
    getNextPageParam: (lastPage) => 
      lastPage.currentPage < lastPage.totalPages ? lastPage.currentPage + 1 : undefined,
    initialPageParam: 1,
  });
}
