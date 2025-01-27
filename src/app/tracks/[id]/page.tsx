import { TrackView } from "@/app/components/TrackView";
import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";

export default async function TrackPage({
	params,
}: { params: { id: string } }) {
	// Fetch the current track
	const track = await prisma.track.findUnique({
		where: { id: (await params).id },
		select: {
			id: true,
			title: true,
			artists: true,
			tags: true,
			fileSize: true,
			url: true,
		},
	});

	if (!track) {
		notFound();
	}

	// Fetch all tracks for the queue
	const allTracks = await prisma.track.findMany({
		select: {
			id: true,
			title: true,
			artists: true,
			tags: true,
			fileSize: true,
			url: true,
		},
	});

	// Format all tracks
	const formattedTracks = allTracks.map(t => ({
		...t,
		url: `/api/tracks/${t.id}/audio`,
		thumbnailUrl: `/api/tracks/${t.id}/thumbnail`,
		artists: JSON.parse(t.artists),
		tags: JSON.parse(t.tags),
	}));

	// Format the current track
	const formattedTrack = {
		...track,
		url: `/api/tracks/${track.id}/audio`,
		thumbnailUrl: `/api/tracks/${track.id}/thumbnail`,
		artists: JSON.parse(track.artists),
		tags: JSON.parse(track.tags),
	};

	return <TrackView track={formattedTrack} tracks={formattedTracks} />;
}
