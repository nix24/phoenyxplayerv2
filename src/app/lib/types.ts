// types.ts
export interface Track {
    id: string;
    url: string | null;
    title: string;
    artists: string | string[];
    tags: string | string[];
    fileSize?: number | null;
}