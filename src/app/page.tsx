"use client";

import { usePlayerStore } from "@/app/lib/stores/usePlayerStore";
import { NowPlayingBar } from "@/app/components/NowPlayingBar";
import { useState, useEffect } from "react";
import { AudioUploader } from "./components/AudioUploader";
import { TrackDropdown } from "./components/TrackDropdown";
import { SearchBar } from "./components/SearchBar";
import Link from "next/link";
import type { Track } from "@/app/lib/types";
import { useTracks } from "./hooks/useTracks";
import { useInView } from "react-intersection-observer";
import { useQueryClient } from "@tanstack/react-query";
import Placeholder from "@/app/images/placeholder.png";

export default function Home() {
	const { playTrack } = usePlayerStore();
	const [error, setError] = useState<string | null>(null);
	const { ref, inView } = useInView();
	const [filteredTracks, setFilteredTracks] = useState<Track[]>([]);
	const queryClient = useQueryClient();

	const {
		data,
		fetchNextPage,
		hasNextPage,
		isFetchingNextPage,
		isLoading,
		isError,
	} = useTracks();

	useEffect(() => {
		if (inView && hasNextPage && !isFetchingNextPage) {
			fetchNextPage();
		}
	}, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

	const handleDelete = async (trackId: string) => {
		try {
			const response = await fetch(`/api/tracks/${trackId}`, {
				method: "DELETE",
			});
			if (!response.ok) throw new Error("Failed to delete track");
			queryClient.invalidateQueries({ queryKey: ["tracks"] });
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to delete track");
		}
	};

	if (isLoading)
		return (
			<div className="min-h-screen flex items-center justify-center">
				<span className="loading loading-spinner loading-lg text-primary" />
			</div>
		);

	if (isError)
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="alert alert-error">
					<svg
						xmlns="http://www.w3.org/2000/svg"
						className="stroke-current shrink-0 h-6 w-6"
						fill="none"
						viewBox="0 0 24 24"
					>
						<title>Error</title>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
					<span>{error}</span>
				</div>
			</div>
		);

	const allTracks = data?.pages.flatMap((page) => page.tracks) ?? [];
	const displayTracks = filteredTracks.length > 0 ? filteredTracks : allTracks;

	return (
		<main className="min-h-screen pb-24 bg-base-100">
			<div className="container mx-auto px-4">
				<SearchBar
					tracks={allTracks}
					onSearchResults={(results) => setFilteredTracks(results)}
				/>
				<div className="divider" />

				<section className="max-w-4xl mx-auto">
					<ul className="list bg-base-100 rounded-box shadow-md">
						<li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
							Most played songs this week
						</li>
						{displayTracks.map((track) => (
							<li
								key={track.id}
								className="list-row cursor-pointer hover:bg-base-300 transition-all"
								onClick={() => playTrack(track, displayTracks)}
								onKeyUp={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										playTrack(track, displayTracks);
									}
								}}
							>
								<div>
									<img
										className="w-16 h-16 rounded-lg object-cover"
										src={track.thumbnailUrl || Placeholder.src}
										alt={track.title}
									/>
								</div>
								<div>
									<Link
										href={`/tracks/${track.id}`}
										className="hover:text-primary transition-colors"
										onClick={(e) => e.stopPropagation()}
									>
										{track.title}
									</Link>
									<p className="text-sm opacity-70">
										{Array.isArray(track.artists)
											? track.artists.join(", ")
											: track.artists}
									</p>
								</div>
								<div className="list-col-grow flex justify-end">
									<TrackDropdown
										track={track}
										onDelete={() => handleDelete(track.id)}
									/>
								</div>
							</li>
						))}
					</ul>

					{hasNextPage && !filteredTracks.length && (
						<div ref={ref} className="w-full flex justify-center p-4">
							{isFetchingNextPage ? (
								<span className="loading loading-spinner loading-md" />
							) : (
								<button
									type="button"
									onClick={() => fetchNextPage()}
									className="btn btn-ghost btn-sm"
								>
									Load More
								</button>
							)}
						</div>
					)}
				</section>
			</div>

			<div className="fixed bottom-20 right-0">
				<AudioUploader
					onUploadComplete={() => {
						queryClient.invalidateQueries({ queryKey: ["tracks"] });
					}}
				/>
			</div>

			<NowPlayingBar />
		</main>
	);
}
