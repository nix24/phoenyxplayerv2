"use client";
import { usePlayerStore } from "@/app/lib/stores/usePlayerStore";
import { formatTime } from "@/app/lib/util";
import type { Track } from "@/app/lib/types";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Pause, Play, StepBack, StepForward } from "lucide-react";
import { useRouter } from "next/navigation";
import { Vibrant } from "node-vibrant/browser";
import placeholder from "@/app/images/placeholder.png";
import AddToPlaylistButton from "./AddToPlaylistButton";

export default function TrackView({
	track,
	tracks = [],
}: { track: Track; tracks?: Track[] }) {
	const router = useRouter();
	const {
		currentTrack,
		isPlaying,
		progress,
		duration,
		play,
		pause,
		playTrack,
		playNext,
		playPrevious,
		setQueue,
		setProgress,
		pulseTimestamp,
	} = usePlayerStore();

	// Set up the queue when the component mounts
	useEffect(() => {
		// If tracks are provided, use them for the queue
		// Otherwise, fallback to just the current track
		const queueTracks = tracks.length > 0 ? tracks : [track];
		setQueue(queueTracks);
	}, [track, tracks, setQueue]);

	// Update URL when current track changes
	useEffect(() => {
		if (currentTrack && currentTrack.id !== track.id) {
			router.push(`/tracks/${currentTrack.id}`);
		}
	}, [currentTrack, track.id, router]);

	const isCurrentTrack = currentTrack?.id === track.id;

	// Handle play/pause
	const handlePlayPause = () => {
		if (isCurrentTrack) {
			isPlaying ? pause() : play();
		} else {
			playTrack(track);
		}
	};

	const [bgColor, setBgColor] = useState<string>("#121212");
	const [colorLoading, setColorLoading] = useState<boolean>(false);
	const [colorError, setColorError] = useState<string | null>(null);

	const hexToRGBA = useCallback((hex: string, alpha: number) => {
		const r = Number.parseInt(hex.slice(1, 3), 16);
		const g = Number.parseInt(hex.slice(3, 5), 16);
		const b = Number.parseInt(hex.slice(5, 7), 16);
		return `rgba(${r}, ${g}, ${b}, ${alpha})`;
	}, []);
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		const fetchColor = async () => {
			if (!track?.thumbnailUrl) return;
			setColorLoading(true);
			try {
				const palette = await Vibrant.from(track.thumbnailUrl).getPalette();
				const vibrantColor = palette.Vibrant?.hex ?? "#000000";
				const dimmedColor = hexToRGBA(vibrantColor, 0.6);
				setBgColor(dimmedColor);
				setColorError(null);
			} catch (error) {
				console.error("Error extracting color palette", error);
				setColorError("Failed to load color palette");
			} finally {
				setColorLoading(false);
			}
		};
		fetchColor();
	}, [track?.thumbnailUrl]);

	const [pulse, setPulse] = useState(false);

	// Trigger pulse animation on pulseTimestamp update
	useEffect(() => {
		if (pulseTimestamp) {
			setPulse(true);
			const timer = setTimeout(() => setPulse(false), 150);
			return () => clearTimeout(timer);
		}
	}, [pulseTimestamp]);

	return (
		<div className="relative ">
			<div
				style={{
					backgroundColor: bgColor,
				}}
				className="min-h-screen w-full glass rounded-b-box bg"
			>
				{colorLoading && <p>Loading background...</p>}
				{colorError && <p>{colorError}</p>}
				<div className="max-w-4xl mx-auto p-6 space-y-8">
					{/* Main Layout */}
					<div className="flex flex-col items-center text-center space-y-6">
						{/* Thumbnail */}
						<div
							className={`relative w-56 h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 lg:w-96 lg:h-96 rounded-lg overflow-hidden shadow-lg ${pulse ? "ring-4 ring-white transition-all duration-300 ease-in-out" : "ring-0 transition-all duration-300 ease-in-out"}`}
						>
							<img
								src={track.thumbnailUrl || placeholder.src}
								alt={track.title}
								className="object-contain "
							/>
						</div>

						{/* Track Info */}
						<div className="space-y-4">
							<h1 className="text-4xl font-bold tracking-tight">
								{track.title}
							</h1>
							<p className="text-lg text-base-content">
								{Array.isArray(track.artists)
									? track.artists.join(", ")
									: track.artists}
							</p>

							{/* Add to Playlist Button */}
							<AddToPlaylistButton track={track} />

							{/* Play/Pause Button */}
							<button
								type="button"
								onClick={playPrevious}
								className="p-2 rounded-full bg-base-100 text-base-content hover:bg-base-200 transition-colors"
							>
								<StepBack />
							</button>
							<button
								type="button"
								onClick={handlePlayPause}
								className="p-4 rounded-full bg-base-100 text-base-content hover:bg-base-200 hover:scale-105 transition-transform"
							>
								{isCurrentTrack && isPlaying ? <Pause /> : <Play />}
							</button>
							<button
								type="button"
								onClick={playNext}
								className="p-2 rounded-full bg-base-100 text-base-content hover:bg-base-200 transition-colors"
							>
								<StepForward />
							</button>
						</div>

						{/* Progress Bar */}
						{isCurrentTrack && (
							<div className="flex items-center gap-4 w-full max-w-md">
								<span className="text-sm text-base-content">
									{formatTime(progress)}
								</span>
								<div className="relative flex-1 h-1 group">
									<input
										type="range"
										min={0}
										max={duration}
										value={progress}
										onChange={(e) => setProgress(Number(e.target.value))}
										className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
									/>
									<div className="absolute inset-0 h-1 bg-base-300 rounded-full">
										<div
											className="h-full bg-base-content rounded-full transition-all"
											style={{ width: `${(progress / duration) * 100}%` }}
										/>
									</div>
								</div>
								<span className="text-sm text-base-content">
									{formatTime(duration)}
								</span>
							</div>
						)}
					</div>

					{/* Additional Details */}
					<div className="space-y-4 text-left">
						<h2 className="text-lg font-semibold">About this track</h2>
						<div className="flex items-center gap-4 justify-between">
							<div>
								<h3 className="text-sm text-base-content">Tags</h3>
								<p className="mt-1 badge badge-ghost border border-accent/25">
									{Array.isArray(track.tags)
										? track.tags.join(", ")
										: track.tags || "No tags"}
								</p>
							</div>
							{track.fileSize && (
								<div>
									<h3 className="text-sm text-base-content">File Size</h3>
									<p className="mt-1">
										{(track.fileSize / 1024 / 1024).toFixed(2)} MB
									</p>
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
