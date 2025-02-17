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
import { Play, AudioWaveformIcon, Disc3Icon } from "lucide-react";
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
			<div
				className="min-h-screen flex items-center justify-center 
		  bg-gradient-to-br from-base-300 via-primary/5 to-base-100"
			>
				<div className="relative">
					<span className="loading loading-spinner loading-lg text-primary" />
					<div className="absolute inset-0 animate-pulse-ring" />
				</div>
			</div>
		);

	if (isError)
		return (
			<div
				className="min-h-screen flex items-center justify-center 
		  bg-gradient-to-br from-base-300 via-primary/5 to-base-100"
			>
				<div
					className="alert alert-error bg-red-500/20 backdrop-blur-md 
			border border-red-500/30"
				>
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
		<main className="min-h-screen pb-24 relative overflow-hidden">
			{/* Animated background */}
			<div
				className="fixed inset-0 bg-gradient-to-br from-base-300 via-primary/5 
		  to-base-100 -z-10"
			/>
			<div className="fixed inset-0 -z-5">
				<div
					className="absolute top-0 left-0 w-96 h-96 bg-primary/10 
			rounded-full filter blur-3xl animate-pulse"
				/>
				<div
					className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/10 
			rounded-full filter blur-3xl animate-pulse delay-1000"
				/>
			</div>

			<header
				className="sticky top-0 z-10 backdrop-blur-xl 
		  bg-gradient-to-r from-base-300/80 via-primary/5 to-base-300/80 
		  border-b border-white/10 shadow-lg shadow-primary/5"
			>
				<div className="container mx-auto px-4 py-4">
					<SearchBar
						tracks={allTracks}
						onSearchResults={(results) => setFilteredTracks(results)}
					/>
				</div>
			</header>

			<div className="container mx-auto px-4 mt-8">
				<section className="max-w-4xl mx-auto">
					<header className="flex items-center gap-3 mb-8">
						<div
							className="w-12 h-12 rounded-xl bg-primary/20 flex items-center 
				justify-center animate-pulse"
						>
							<Disc3Icon className="w-6 h-6 text-primary" />
						</div>
						<div>
							<h1
								className="text-2xl font-bold bg-gradient-to-r from-primary 
				  to-secondary bg-clip-text text-transparent"
							>
								Featured Tracks
							</h1>
							<p className="text-sm text-white/60">Discover your rhythm</p>
						</div>
					</header>

					<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
						{displayTracks.map((track) => (
							<article
								key={track.id}
								className="group relative overflow-hidden rounded-xl 
					backdrop-blur-md bg-white/5 hover:bg-white/10 
					transition-all duration-300 border border-white/10 
					hover:border-primary/20 hover:shadow-lg hover:shadow-primary/5"
							>
								<div
									// biome-ignore lint/a11y/useSemanticElements: <explanation>
									role="button"
									className="p-4 flex items-center gap-4 cursor-pointer 
					  relative z-10"
									onClick={() => playTrack(track, displayTracks)}
									tabIndex={0}
									onKeyUp={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											playTrack(track, displayTracks);
										}
									}}
								>
									<div className="relative shrink-0 group/image">
										<img
											className="w-16 h-16 rounded-lg object-cover 
						  transition-transform duration-300 
						  group-hover/image:scale-105"
											src={track.thumbnailUrl ?? Placeholder.src}
											alt={track.title}
										/>
										<div
											className="absolute inset-0 bg-black/40 opacity-0 
						group-hover:opacity-100 transition-opacity duration-300 
						rounded-lg flex items-center justify-center"
										>
											<Play
												className="w-8 h-8 text-white transform scale-0 
						  group-hover:scale-100 transition-transform duration-300"
											/>
										</div>
									</div>

									<div className="flex-grow">
										<Link
											href={`/tracks/${track.id}`}
											className="text-lg font-medium hover:text-primary truncate
						  transition-colors relative group/title"
											onClick={(e) => e.stopPropagation()}
										>
											{track.title}
											<span
												className="absolute -bottom-1 left-0 w-full h-[2px] 
						  bg-primary transform scale-x-0 group-hover/title:scale-x-100 
						  transition-transform duration-300"
											/>
										</Link>
										<p className="text-sm text-white/60 flex items-center gap-2">
											<AudioWaveformIcon className="w-3 h-3" />
											{Array.isArray(track.artists)
												? track.artists.join(", ")
												: track.artists}
										</p>
									</div>

									<div
										className="absolute top-2 right-2 z-20 md:opacity-0 
					  md:group-hover:opacity-100 transition-opacity"
									>
										<TrackDropdown
											track={track}
											onDelete={() => handleDelete(track.id)}
										/>
									</div>
								</div>

								{/* Gradient overlay */}
								<div
									className="absolute inset-0 bg-gradient-to-r 
					from-primary/5 to-secondary/5 opacity-0 
					group-hover:opacity-100 transition-opacity duration-300"
								/>
							</article>
						))}
					</div>

					{hasNextPage && !filteredTracks.length && (
						<div ref={ref} className="w-full flex justify-center p-8">
							{isFetchingNextPage ? (
								<div className="relative">
									<span
										className="loading loading-spinner loading-md 
					  text-primary"
									/>
									<div className="absolute inset-0 animate-pulse-ring" />
								</div>
							) : (
								<button
									type="button"
									onClick={() => fetchNextPage()}
									className="btn btn-ghost group relative overflow-hidden"
								>
									<span className="relative z-10">Load More</span>
									<div
										className="absolute inset-0 bg-gradient-to-r 
					  from-primary/20 to-secondary/20 opacity-0 
					  group-hover:opacity-100 transition-opacity duration-300"
									/>
								</button>
							)}
						</div>
					)}
				</section>
			</div>

			<div className="fixed bottom-20 right-4 z-20">
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
