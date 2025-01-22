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
		play,
		pause,
		playPrevious,
		playNext,
		setProgress,
	} = usePlayerStore();

	if (!currentTrack) return null;

	return (
		<div className="fixed bottom-0 left-0 right-0 h-24 bg-neutral-900 border-t border-neutral-800">
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
					<div>
						<h3 className="text-sm font-medium">{currentTrack.title}</h3>
						<p className="text-xs text-neutral-400">{currentTrack.artists}</p>
					</div>
				</div>

				{/* Player Controls */}
				<div className="flex flex-col items-center w-1/3">
					<div className="flex items-center gap-4">
						<button
							type="button"
							onClick={() => playPrevious()}
							className="text-neutral-400 hover:text-white"
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
							onClick={() => (isPlaying ? pause() : play())}
							className="p-2 rounded-full bg-white text-black hover:scale-105 transition"
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
							onClick={() => playNext()}
							className="text-neutral-400 hover:text-white"
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
					<div className="w-full mt-2 flex items-center gap-2 text-xs text-neutral-400">
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
							<div className="absolute inset-0 h-1 bg-neutral-800 rounded-full">
								<div
									className="h-full bg-white rounded-full group-hover:bg-green-500 transition-colors"
									style={{ width: `${(progress / duration) * 100}%` }}
								/>
							</div>
						</div>
						<span>{formatTime(duration)}</span>
					</div>
				</div>

				{/* Volume Control (placeholder for now) */}
				<div className="w-1/3 flex justify-end">
					{/* Volume controls will go here */}
				</div>
			</div>
		</div>
	);
}
