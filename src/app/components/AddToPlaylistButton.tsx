"use client";

import { useState } from "react";
import type { Track } from "@/app/lib/types";
import { PlusIcon } from "lucide-react";
import { toast } from "sonner";

interface Playlist {
	id: string;
	name: string;
	description: string;
}

interface AddToPlaylistButtonProps {
	track: Track;
}

export default function AddToPlaylistButton({
	track,
}: AddToPlaylistButtonProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [playlists, setPlaylists] = useState<Playlist[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [newPlaylistName, setNewPlaylistName] = useState("");

	const fetchPlaylists = async () => {
		try {
			const response = await fetch("/api/playlists");
			const data = await response.json();
			setPlaylists(data);
		} catch (error) {
			console.error("Failed to fetch playlists:", error);
			toast.error("Failed to load playlists");
		}
	};

	const handleOpen = async () => {
		setIsOpen(true);
		await fetchPlaylists();
	};

	const addToPlaylist = async (playlistId: string) => {
		setIsLoading(true);
		try {
			const response = await fetch(`/api/playlists/${playlistId}/tracks`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ trackId: track.id }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error);
			}

			toast.success("Added to playlist");
			setIsOpen(false);
		} catch (error) {
			toast.error(
				error instanceof Error ? error.message : "Failed to add to playlist",
			);
		} finally {
			setIsLoading(false);
		}
	};

	const createAndAddToPlaylist = async () => {
		if (!newPlaylistName.trim()) return;
		setIsLoading(true);

		try {
			// Create new playlist
			const createResponse = await fetch("/api/playlists", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ name: newPlaylistName }),
			});

			const playlist = await createResponse.json();

			// Add track to the new playlist
			await addToPlaylist(playlist.id);

			setNewPlaylistName("");
			toast.success("Created playlist and added track");
		} catch (error) {
			toast.error("Failed to create playlist");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="relative">
			<button
				type="button"
				onClick={handleOpen}
				className="flex items-center space-x-1 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
			>
				<PlusIcon className="h-5 w-5" />
				<span>Add to Playlist</span>
			</button>

			{isOpen && (
				<div className="absolute right-0 mt-2 w-64 rounded-lg bg-gray-900 p-4 shadow-lg ring-1 ring-black ring-opacity-5">
					<div className="mb-4">
						<input
							type="text"
							placeholder="New playlist name"
							value={newPlaylistName}
							onChange={(e) => setNewPlaylistName(e.target.value)}
							className="w-full rounded bg-gray-800 px-3 py-2 text-white placeholder-gray-400"
						/>
						<button
							type="button"
							onClick={createAndAddToPlaylist}
							disabled={!newPlaylistName.trim() || isLoading}
							className="mt-2 w-full rounded bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20 disabled:opacity-50"
						>
							Create & Add
						</button>
					</div>

					<div className="space-y-2">
						<div className="text-sm font-medium text-gray-400">
							Or add to existing:
						</div>
						{playlists.map((playlist) => (
							<button
								type="button"
								key={playlist.id}
								onClick={() => addToPlaylist(playlist.id)}
								disabled={isLoading}
								className="w-full rounded px-4 py-2 text-left text-sm text-white hover:bg-white/10 disabled:opacity-50"
							>
								{playlist.name}
							</button>
						))}
					</div>
				</div>
			)}
		</div>
	);
}
