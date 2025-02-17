"use client";
import { usePlayerStore } from "@/app/lib/stores/usePlayerStore";
import { formatTime } from "@/app/lib/util";
import type { Track } from "@/app/lib/types";
import { useEffect, useState, useCallback } from "react";
import { Pause, Play, StepBack, StepForward } from "lucide-react";
import { useRouter } from "next/navigation";
import { Vibrant } from "node-vibrant/browser";
import placeholder from "@/app/images/placeholder.png";
import AddToPlaylistButton from "./AddToPlaylistButton";

export default function TrackView({
	track,
	tracks = [],
}: Readonly<{ track: Track; tracks?: Track[] }>) {
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
		<div style={{ backgroundColor: bgColor }} className="relative min-h-screen">
			<div className="glass w-full backdrop-blur-xl bg-opacity-80 transition-colors duration-500">
				<div className="max-w-5xl mx-auto p-6 space-y-8">
					<div className="flex flex-col items-center text-center space-y-8">
						{/* Thumbnail Section */}
						<div className="relative group">
							<div
								className={`relative rounded-2xl overflow-hidden shadow-2xl
            transition-all duration-300 ease-in-out transform
            hover:scale-105 hover:shadow-[0_0_30px_rgba(var(--primary-rgb),0.3)]
            ${pulse ? "animate-pulse" : ""}`}
							>
								<img
									src={track.thumbnailUrl ?? placeholder.src}
									alt={track.title}
									className="w-64 h-64 md:w-96 md:h-96 object-cover"
								/>
								<div
									className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent 
              opacity-0 group-hover:opacity-100 transition-opacity duration-300"
								/>
							</div>
						</div>

						{/* Track Info */}
						<div className="space-y-6">
							<h1
								className="text-4xl md:text-5xl font-bold tracking-tight 
            hover:text-primary transition-colors duration-300"
							>
								{track.title}
							</h1>
							<p className="text-lg md:text-xl text-base-content/80">
								{Array.isArray(track.artists)
									? track.artists.join(", ")
									: track.artists}
							</p>

							{/* Controls */}
							<div className="flex items-center justify-center gap-6">
								<button
									type="button"
									onClick={playPrevious}
									className="btn btn-circle btn-ghost hover:scale-110 transition-transform"
								>
									<StepBack className="w-6 h-6" />
								</button>

								<button
									type="button"
									onClick={handlePlayPause}
									className="btn btn-circle btn-primary btn-lg hover:scale-110 
                transition-transform hover:shadow-lg hover:shadow-primary/20"
								>
									{isCurrentTrack && isPlaying ? (
										<Pause className="w-8 h-8" />
									) : (
										<Play className="w-8 h-8" />
									)}
								</button>

								<button
									type="button"
									onClick={playNext}
									className="btn btn-circle btn-ghost hover:scale-110 transition-transform"
								>
									<StepForward className="w-6 h-6" />
								</button>
							</div>

							<AddToPlaylistButton track={track} />
						</div>

						{/* Progress Bar */}
						{isCurrentTrack && (
							<div className="w-full max-w-2xl flex items-center gap-4 px-4">
								<span className="text-sm tabular-nums">
									{formatTime(progress)}
								</span>
								<div className="relative flex-1 h-2 group">
									<input
										type="range"
										min={0}
										max={duration}
										value={progress}
										onChange={(e) => setProgress(Number(e.target.value))}
										className="range range-xs range-primary w-full"
									/>
								</div>
								<span className="text-sm tabular-nums">
									{formatTime(duration)}
								</span>
							</div>
						)}
					</div>

					{/* Track Details */}
					<div className="max-w-2xl mx-auto mt-12 divide-y divide-base-content/10">
						<div className="py-6">
							<h2 className="text-xl font-semibold mb-4">About this track</h2>
							<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
								<div className="space-y-2">
									<h3 className="text-sm text-base-content/70">Tags</h3>
									<div className="flex flex-wrap gap-2">
										{(Array.isArray(track.tags) ? track.tags : [track.tags])
											.filter(Boolean)
											.map((tag) => (
												<span
													key={tag}
													className="badge badge-primary badge-outline 
                      hover:badge-primary transition-colors duration-300"
												>
													{tag}
												</span>
											))}
									</div>
								</div>

								{track.fileSize && (
									<div className="space-y-2">
										<h3 className="text-sm text-base-content/70">File Size</h3>
										<p className="font-medium">
											{(track.fileSize / 1024 / 1024).toFixed(2)} MB
										</p>
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
