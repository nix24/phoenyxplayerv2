import { useQuery } from '@tanstack/react-query';
import type { Playlist, PlaylistTrack, Track } from '../lib/types';

interface PlaylistWithTracks extends Playlist {
  tracks: (PlaylistTrack & { track: Track })[];
}

async function fetchPlaylist(playlistId: string): Promise<PlaylistWithTracks> {
  const response = await fetch(`/api/playlists/${playlistId}`);
  if (!response.ok) {
    throw new Error('Failed to fetch playlist');
  }
  return response.json();
}

export function usePlaylist(playlistId: string) {
  return useQuery({
    queryKey: ['playlist', playlistId],
    queryFn: () => fetchPlaylist(playlistId),
  });
}
