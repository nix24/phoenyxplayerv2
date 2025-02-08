"use client";

import { usePlayerStore } from "@/app/lib/stores/usePlayerStore";
import { formatTime } from "@/app/lib/util";
import Image from "next/image";
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

	if (!currentTrack) return null;

	const hasQueue = queue.length > 0;
	const canPlayPrevious = hasQueue;
	const canPlayNext = hasQueue;

	return (
		<div className="fixed bottom-0 left-0 right-0 h-24 bg-base-300 rounded-t-lg shadow-lg border-t border-base-content/10">
			<div className="flex items-center justify-between h-full px-4">
				{/* Track Info */}
				<div className="flex items-center gap-4 w-1/3">
					<div className="relative w-12 h-12">
						<img
							src={currentTrack.thumbnailUrl || Placeholder.src}
							alt={currentTrack.title}
							className="rounded-sm object-cover w-full h-full"
						/>
					</div>
					<div className="w-40">
						<h3 className="text-sm text-base-content font-medium truncate">
							{currentTrack.title}
						</h3>
						<p className="text-xs text-base-content/70 truncate">
							{Array.isArray(currentTrack.artists)
								? currentTrack.artists.join(", ")
								: currentTrack.artists}
						</p>
					</div>
				</div>

				{/* Player Controls */}
				<div className="flex flex-col items-center w-1/3 gap-2">
					<div className="flex items-center gap-4">
						<button
							type="button"
							onClick={playPrevious}
							className={`btn btn-sm btn-circle ${
								!canPlayPrevious ? "btn-disabled" : ""
							}`}
							disabled={!canPlayPrevious}
						>
							<SkipBack className="w-4 h-4" />
						</button>

						<button
							type="button"
							onClick={isPlaying ? pause : play}
							className="btn btn-circle btn-primary"
						>
							{isPlaying ? (
								<Pause className="w-6 h-6" />
							) : (
								<Play className="w-6 h-6" />
							)}
						</button>

						<button
							type="button"
							onClick={playNext}
							className={`btn btn-sm btn-circle ${
								!canPlayNext ? "btn-disabled" : ""
							}`}
							disabled={!canPlayNext}
						>
							<SkipForward className="w-4 h-4" />
						</button>
					</div>

					{/* Progress Bar */}
					<div className="w-full flex items-center gap-2 px-4">
						<span className="text-xs text-base-content/70">
							{formatTime(progress)}
						</span>
						<div
							ref={progressBarRef}
							className="flex-1 h-1 bg-base-content/20 rounded-full cursor-pointer"
							onClick={handleProgressClick}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									handleProgressClick(
										e as unknown as React.MouseEvent<HTMLDivElement>,
									);
								}
							}}
							tabIndex={0}
							role="slider"
							aria-label="Track progress"
							aria-valuemin={0}
							aria-valuemax={duration}
							aria-valuenow={progress}
						>
							<div
								className="h-full bg-primary rounded-full"
								style={{ width: `${(progress / duration) * 100}%` }}
							/>
						</div>
						<span className="text-xs text-base-content/70">
							{formatTime(duration)}
						</span>
					</div>
				</div>

				{/* Volume Control */}
				<div className="flex items-center gap-2 w-1/3 justify-end">
					<button
						type="button"
						onClick={toggleMute}
						className="btn btn-ghost btn-sm btn-circle"
					>
						{isMuted ? (
							<VolumeX className="w-4 h-4" />
						) : (
							<Volume2 className="w-4 h-4" />
						)}
					</button>
					<input
						type="range"
						min="0"
						max="100"
						value={isMuted ? 0 : volume}
						onChange={(e) => setVolume(Number(e.target.value))}
						className="range range-xs cursor-pointer range-primary"
					/>
					<span className="text-sm">{isMuted ? "Muted" : `${volume}%`}</span>
				</div>
			</div>
		</div>
	);
}
