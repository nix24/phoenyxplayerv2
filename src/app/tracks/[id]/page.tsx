import TrackView from "@/app/components/TrackView";
import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";
import type { Track } from "@/app/lib/types";

export default async function TrackPage({
    params,
}: Readonly<{ params: { id: string } }>) {
    // Fetch the current track
    const track = await prisma.track.findUnique({
        where: { id: params.id },
        select: {
            id: true,
            title: true,
            artists: true,
            tags: true,
            fileSize: true,
            createdAt: true,
            updatedAt: true,
        },
    });

    if (!track) {
        notFound();
    }
    const allTracks = await prisma.track.findMany({
        select: {
            id: true,
            title: true,
            artists: true,
            tags: true,
            fileSize: true,
            createdAt: true,
            updatedAt: true,
        },
    });


    // Format all tracks
    const formattedTracks: Track[] = allTracks.map((t) => ({
        ...t,
        url: `/api/tracks/${t.id}/audio`,
        thumbnailUrl: `/api/tracks/${t.id}/thumbnail`,
        artists: Array.isArray(t.artists) ? t.artists : JSON.parse(t.artists),
        tags: Array.isArray(t.tags) ? t.tags : JSON.parse(t.tags),
        fileSize: t.fileSize,
    }));

    // Format the current track
    const formattedTrack: Track = {
        ...track,
        url: `/api/tracks/${track.id}/audio`,
        thumbnailUrl: `/api/tracks/${track.id}/thumbnail`,
        artists: Array.isArray(track.artists)
            ? track.artists
            : JSON.parse(track.artists),
        tags: Array.isArray(track.tags) ? track.tags : JSON.parse(track.tags),
        fileSize: track.fileSize,
    };

    return (
        <main className="min-h-screen">
            <TrackView track={formattedTrack} tracks={formattedTracks} />
        </main>
    );
}
