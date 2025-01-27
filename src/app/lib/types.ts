// types.ts
export interface Track {
  id: string;
  url?: string;
  title: string;
  artists: string[];
  tags: string[];
  fileSize: number | null;
  thumbnailUrl?: string;
}

export interface TracksResponse {
  tracks: Track[];
  totalPages: number;
  currentPage: number;
}