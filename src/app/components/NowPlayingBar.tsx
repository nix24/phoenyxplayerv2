"use client";

import { usePlayerStore } from "@/app/lib/stores/usePlayerStore";
import Placeholder from "@/app/images/placeholder.png";
import {
	Play,
	Pause,
	SkipBack,
	SkipForward,
	Volume2,
	VolumeX,
} from "lucide-react";
import { useEffect, useRef } from "react";

export function NowPlayingBar() {
	const {
		currentTrack,
		isPlaying,
		progress,
		duration,
		volume,
		isMuted,
		queue,
		play,
		pause,
		playPrevious,
		playNext,
		setProgress,
		setVolume,
		toggleMute,
	} = usePlayerStore();

	const progressBarRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const updateProgress = () => {
			if (isPlaying) {
				requestAnimationFrame(updateProgress);
			}
		};

		if (isPlaying) {
			requestAnimationFrame(updateProgress);
		}

		return () => {
			cancelAnimationFrame(0);
		};
	}, [isPlaying]);

	const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
		if (!progressBarRef.current) return;

		const rect = progressBarRef.current.getBoundingClientRect();
		const pos = (e.clientX - rect.left) / rect.width;
		setProgress(pos * duration);
	};

	const handleProgressKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			handleProgressClick(e as unknown as React.MouseEvent<HTMLDivElement>);
		} else if (e.key === "ArrowRight") {
			e.preventDefault();
			const newTime = Math.min(progress + 5, duration);
			setProgress(newTime);
		} else if (e.key === "ArrowLeft") {
			e.preventDefault();
			const newTime = Math.max(progress - 5, 0);
			setProgress(newTime);
		}
	};

	if (!currentTrack) return null;

	const hasQueue = queue.length > 0;
	const canPlayPrevious = hasQueue;
	const canPlayNext = hasQueue;

	return (
		<div
			className="fixed bottom-0 left-0 right-0 h-24 md:h-28 bg-base-300/95 backdrop-blur-xl
  border-t border-primary/20 shadow-[0_-5px_25px_rgba(var(--primary-rgb),0.15)] flex flex-col justify-between"
		>
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute -top-12 left-1/4 w-32 h-32 bg-primary/20 rounded-full blur-2xl animate-pulse" />
				<div className="absolute -top-8 right-1/3 w-24 h-24 bg-secondary/20 rounded-full blur-2xl animate-pulse delay-300" />
			</div>

			{/* Progress Bar - Moved to top */}
			<div
				ref={progressBarRef}
				onClick={handleProgressClick}
				onKeyDown={handleProgressKeyDown}
				role="slider"
				aria-label="Progress"
				aria-valuemin={0}
				aria-valuemax={duration}
				aria-valuenow={progress}
				tabIndex={0}
				className="relative h-1 bg-base-content/20 cursor-pointer group"
			>
				<div
					className="absolute h-full bg-primary"
					style={{ width: `${(progress / duration) * 100}%` }}
				/>
				<div
					className="absolute h-3 w-3 bg-primary rounded-full -top-1 -mt-[0.5] opacity-0 group-hover:opacity-100 transition-opacity"
					style={{
						left: `${(progress / duration) * 100}%`,
						transform: "translateX(-50%)",
					}}
				/>
			</div>

			<div className="relative flex items-center justify-between px-4 md:px-6 gap-2 md:gap-4 flex-1">
				{/* Track Info */}
				<div className="flex items-center gap-2 md:gap-4 w-1/3 min-w-0">
					<div className="relative group shrink-0">
						<div className="absolute inset-0 bg-primary/20 rounded-lg rotate-45 scale-0 group-hover:scale-100 transition-transform duration-300" />
						<img
							src={currentTrack.thumbnailUrl ?? Placeholder.src}
							alt={currentTrack.title}
							className="w-12 h-12 md:w-16 md:h-16 rounded-lg object-cover z-10 relative group-hover:scale-105 transition-transform"
						/>
					</div>
					<div className="min-w-0">
						<h3 className="font-medium truncate text-sm md:text-base">
							{currentTrack.title}
						</h3>
						<p className="text-xs md:text-sm text-base-content/60 truncate">
							{Array.isArray(currentTrack.artists)
								? currentTrack.artists.join(", ")
								: currentTrack.artists}
						</p>
					</div>
				</div>

				{/* Controls */}
				<div className="flex items-center gap-2 md:gap-4">
					<button
						type="button"
						onClick={playPrevious}
						disabled={!canPlayPrevious}
						className="btn btn-circle btn-sm md:btn-md btn-ghost"
						aria-label="Previous track"
					>
						<SkipBack className="w-4 h-4 md:w-5 md:h-5" />
					</button>

					<button
						type="button"
						onClick={isPlaying ? pause : play}
						className="btn btn-circle btn-sm md:btn-md"
						aria-label={isPlaying ? "Pause" : "Play"}
					>
						{isPlaying ? (
							<Pause className="w-4 h-4 md:w-5 md:h-5" />
						) : (
							<Play className="w-4 h-4 md:w-5 md:h-5" />
						)}
					</button>

					<button
						type="button"
						onClick={playNext}
						disabled={!canPlayNext}
						className="btn btn-circle btn-sm md:btn-md btn-ghost"
						aria-label="Next track"
					>
						<SkipForward className="w-4 h-4 md:w-5 md:h-5" />
					</button>
				</div>

				{/* Volume */}
				<div className="flex items-center gap-2 md:gap-4 w-1/3 justify-end">
					<button
						type="button"
						onClick={toggleMute}
						className="btn btn-circle btn-sm md:btn-md btn-ghost"
						aria-label={isMuted ? "Unmute" : "Mute"}
					>
						{isMuted ? (
							<VolumeX className="w-4 h-4 md:w-5 md:h-5" />
						) : (
							<Volume2 className="w-4 h-4 md:w-5 md:h-5" />
						)}
					</button>

					<input
						type="range"
						min="0"
						max="1"
						step="0.01"
						value={volume}
						onChange={(e) => setVolume(Number.parseFloat(e.target.value))}
						className="range range-xs md:range-sm range-primary w-20 md:w-32"
					/>
				</div>
			</div>
		</div>
	);
}
