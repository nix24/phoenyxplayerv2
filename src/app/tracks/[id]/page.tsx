import { TrackView } from "@/app/components/TrackView";
import { prisma } from "@/app/lib/prisma";
import { notFound } from "next/navigation";

export default async function TrackPage({
	params,
}: { params: { id: string } }) {
	const track = await prisma.track.findUnique({
		where: { id: params.id },
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

	//format the track data
	const formattedTrack = {
		...track,
		url: `/api/tracks/${track.id}/audio`,
		thumbnailUrl: `/api/tracks/${track.id}/thumbnail`,

		artists: JSON.parse(track.artists),
		tags: JSON.parse(track.tags),
	};

	return <TrackView track={formattedTrack} />;
}
