"use client";

import { usePlayerStore } from "@/app/lib/stores/usePlayerStore";
import { formatTime } from "@/app/lib/util";
import Image from "next/image";

export function NowPlayingBar() {
	const {
		currentTrack,
		isPlaying,
		progress,
		duration,
		volume,
		isMuted,
		play,
		pause,
		playPrevious,
		playNext,
		setProgress,
		setVolume,
		toggleMute
	} = usePlayerStore();

	if (!currentTrack) return null;

	return (
		<div className="fixed bottom-0 left-0 right-0 h-24 bg-base-300 rounded-t-lg">
			<div className="flex items-center justify-between h-full px-4">
				{/* Track Info */}
				<div className="flex items-center gap-4 w-1/3">
					<Image
						src={currentTrack.thumbnailUrl || "/default-thumbnail.png"}
						alt={currentTrack.title}
						width={48}
						height={48}
						className="w-12 h-12 rounded-sm"
					/>
					<div className="w-40">
						<h3 className="text-sm text-base-content font-medium truncate">
							{currentTrack.title}
						</h3>
						<p className="text-xs text-base-content/70 truncate">
							{currentTrack.artists}
						</p>
					</div>
				</div>

				{/* Player Controls */}
				<div className="flex flex-col items-center w-1/3">
					<div className="flex items-center gap-4">
						<button
							type="button"
							onClick={playPrevious}
							className="text-base-content hover:text-accent transition"
						>
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>Previous Track</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M15 19l-7-7 7-7"
								/>
							</svg>
						</button>

						<button
							type="button"
							onClick={isPlaying ? pause : play}
							className="p-2 rounded-full bg-base-content text-base-300 hover:scale-105 transition"
						>
							{isPlaying ? (
								<svg
									className="w-6 h-6"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<title>Pause</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M6 4h4v16H6zm8 0h4v16h-4z"
									/>
								</svg>
							) : (
								<svg
									className="w-6 h-6"
									fill="currentColor"
									viewBox="0 0 24 24"
								>
									<title>Play</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M5 3l14 9-14 9V3z"
									/>
								</svg>
							)}
						</button>

						<button
							type="button"
							onClick={playNext}
							className="text-base-content hover:text-accent transition"
						>
							<svg
								className="w-5 h-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<title>Next Track</title>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M9 5l7 7-7 7"
								/>
							</svg>
						</button>
					</div>

					{/* Progress Bar */}
					<div className="w-full mt-2 flex items-center gap-2 text-xs text-base-content">
						<span>{formatTime(progress)}</span>
						<div className="relative flex-1 h-1 group">
							<input
								type="range"
								min={0}
								max={duration}
								value={progress}
								onChange={(e) => setProgress(Number.parseFloat(e.target.value))}
								className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
							/>
							<div className="absolute inset-0 h-1 bg-base-100 rounded-full">
								<div
									className="h-full bg-primary rounded-full group-hover:bg-secondary transition-colors"
									style={{ width: `${(progress / duration) * 100}%` }}
								/>
							</div>
						</div>
						<span>{formatTime(duration)}</span>
					</div>
				</div>

				{/* Volume Control */}
				<div className="w-1/3 flex justify-end items-center space-x-4">
					<button
						className="btn btn-ghost btn-sm"
						type="button"
						onClick={toggleMute}
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							className="h-5 w-5"
							viewBox="0 0 20 20"
							fill="currentColor"
						>
							<title>{isMuted ? 'Unmute' : 'Mute'}</title>
							{isMuted ? (
								<path
									fillRule="evenodd"
									d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
									clipRule="evenodd"
								/>
							) : (
								<path
									fillRule="evenodd"
									d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217z"
									clipRule="evenodd"
								/>
							)}
						</svg>
					</button>
					<input
						type="range"
						min="0"
						max="100"
						value={isMuted ? 0 : volume}
						className="range range-xs range-primary"
						onChange={(e) => setVolume(Number(e.target.value))}
					/>
				</div>
			</div>
		</div>
	);
}
