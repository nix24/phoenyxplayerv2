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

	if (loading) return <div className="p-6">Loading tracks...</div>;
	if (error) return <div className="p-6 text-red-500">Error: {error}</div>;

	return (
		<main className="min-h-screen pb-24">
			<pre>{JSON.stringify(queue, null, 2)}</pre>
			<header className="p-6">
				<p className="text-sm text-neutral-400 mb-4">
					Disclaimer: This app is still in early stages of development. Feel
					free to check out the code on{" "}
					<a
						href="https://github.com/nix24/phoenixPlayer"
						className="underline hover:text-white"
					>
						github!
					</a>
				</p>

				<h1 className="text-2xl font-bold">Songs</h1>
			</header>

			<div className="px-6">
				<section aria-live="polite" className="mb-6">
					<div>
						<form>
							<label htmlFor="search" className="sr-only">
								Search the library
							</label>
							<input
								type="search"
								id="search"
								className="w-full px-4 py-2 bg-neutral-800 rounded-lg"
								placeholder="Search the library..."
							/>
						</form>
					</div>
				</section>

				<hr className="border-neutral-800 my-6" />

				<section>
					<ul className="space-y-2">
						{tracks.map((track) => (
							<li
								key={track.id}
								className="p-4 rounded-lg hover:bg-neutral-800 transition cursor-pointer"
								onClick={() => playTrack(track)}
								onKeyUp={(e) => {
									if (e.key === "Enter" || e.key === " ") {
										playTrack(track);
									}
								}}
							>
								<div className="flex items-center justify-between">
									<div className="flex items-center gap-4">
										<Image
											src={track.thumbnailUrl || "/default-thumbnail.png"}
											alt={track.title}
											width={48}
											height={48}
											sizes="100vw"
											className="rounded-sm object-cover"
										/>
										<div>
											<Link
												href={`/tracks/${track.id}`}
												className="font-medium hover:underline transition"
											>
												{track.title}
											</Link>
											<p className="text-sm text-neutral-400">
												{Array.isArray(track.artists)
													? track.artists.join(", ")
													: track.artists}
											</p>
										</div>
									</div>
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

			<aside className="px-6 mt-8">
				<div className="space-y-4">
					<div>
						<label
							htmlFor="directory-upload"
							className="block p-4 bg-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-700 transition"
						>
							Upload from Directory
							<input
								type="file"
								id="directory-upload"
								accept="audio/*"
								multiple
								className="hidden"
							/>
						</label>
					</div>

					<div>
						<label
							htmlFor="file-upload"
							className="block p-4 bg-neutral-800 rounded-lg cursor-pointer transition"
						>
							Upload individual Files
							<AudioUploader onUploadComplete={refreshTracks} />
						</label>
					</div>
				</div>
			</aside>

			<NowPlayingBar />
		</main>
	);
}
