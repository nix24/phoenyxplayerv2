"use client";

import { usePlayerStore } from "@/app/lib/stores/usePlayerStore";
import { NowPlayingBar } from "@/app/components/NowPlayingBar";
import { useEffect, useState, useCallback } from "react";
import { AudioUploader } from "./components/AudioUploader";
import { TrackDropdown } from "./components/TrackDropdown";
import Link from "next/link";
import Image from "next/image";
import type { Track } from "@/app/lib/types";

export default function Home() {
	const { playTrack, setQueue, queue } = usePlayerStore();
	const [tracks, setTracks] = useState<Track[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const refreshTracks = useCallback(async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/tracks");
			if (!response.ok) throw new Error("Failed to fetch tracks");
			const data = await response.json();

			const formattedTracks = data.map((track: Track) => ({
				id: track.id,
				url: `/api/tracks/${track.id}/audio`,
				// URL to stream the audio
				thumbnailUrl: `/api/tracks/${track.id}/thumbnail`,
				title: track.title,
				artists: Array.isArray(track.artists)
					? track.artists
					: JSON.parse(track.artists), // Parse only if needed
				tags: Array.isArray(track.tags) ? track.tags : JSON.parse(track.tags),
				fileSize: track.fileSize === null ? undefined : track.fileSize,
			}));

			setTracks(formattedTracks);
			setQueue(formattedTracks);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load tracks");
		} finally {
			setLoading(false);
		}
	}, [setQueue]);

	useEffect(() => {
		refreshTracks();
	}, [refreshTracks]);

	const handleDelete = async (trackId: string) => {
		try {
			const response = await fetch(`/api/tracks/${trackId}`, {
				method: "DELETE",
			});
			if (!response.ok) throw new Error("Failed to delete track");
			refreshTracks();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to delete track");
		}
	};

	if (loading)
		return (
			<div className="min-h-screen flex items-center justify-center">
				<span className="loading loading-spinner loading-lg text-primary" />
			</div>
		);

	if (error)
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

	return (
		<main className="min-h-screen pb-24 bg-base-100">
			<div className="container mx-auto px-4">
				<div className="form-control w-full max-w-2xl mx-auto my-6">
					<div className="input-group flex flex-row">
						<input
							type="search"
							id="search"
							className="input input-bordered w-full"
							placeholder="Search the library..."
						/>
						<button className="btn btn-square" type="submit">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								className="h-6 w-6"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
							>
								<title>Search</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth="2"
									d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
								/>
							</svg>
						</button>
					</div>
				</div>

				<div className="divider" />

				<section className="max-w-4xl mx-auto">
					<ul className="list bg-base-100 rounded-box shadow-md">
						<li className="p-4 pb-2 text-xs opacity-60 tracking-wide">
							Most played songs this week
						</li>
						{tracks.map((track) => (
							<li
								key={track.id}
								className="list-row cursor-pointer hover:bg-base-300 transition-all"
								onClick={() => playTrack(track)}
								onKeyUp={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										playTrack(track);
									}
								}}
							>
								<div>
									<img
										className="w-16 h-16 rounded-lg object-cover"
										src={track.thumbnailUrl || "/default-thumbnail.png"}
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
				</section>
			</div>

			<AudioUploader onUploadComplete={refreshTracks} />
			<NowPlayingBar />
		</main>
	);
}
