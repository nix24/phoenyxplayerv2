"use client";

import { useEffect } from "react";

export default function PlaylistError({
	error,
	reset,
}: {
	error: Error & { digest?: string };
	reset: () => void;
}) {
	useEffect(() => {
		console.error("Playlist page error:", error);
	}, [error]);

	return (
		<div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center p-6">
			<h2 className="mb-4 text-2xl font-bold">Something went wrong!</h2>
			<p className="mb-6 text-gray-400">Failed to load playlist</p>
			<button
				type="button"
				onClick={reset}
				className="rounded-lg bg-white/10 px-4 py-2 font-medium hover:bg-white/20"
			>
				Try again
			</button>
		</div>
	);
}
