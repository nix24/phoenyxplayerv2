"use client";

import { useEffect, useState, useCallback } from "react";
import { Search } from "lucide-react";
import FlexSearch from "flexsearch";
import type { Track } from "@/app/lib/types";

interface SearchBarProps {
	tracks: Track[];
	onSearchResults: (results: Track[]) => void;
}

export function SearchBar({ tracks, onSearchResults }: SearchBarProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [index, setIndex] = useState<FlexSearch.Index>();

	// Initialize FlexSearch index
	useEffect(() => {
		const searchIndex = new FlexSearch.Index({
			preset: "performance",
			tokenize: "forward",
		});

		// Index all tracks
		tracks.forEach((track, idx) => {
			const searchableContent = `${track.title} ${
				Array.isArray(track.artists) ? track.artists.join(" ") : track.artists
			} ${
				Array.isArray(track.tags) ? track.tags.join(" ") : track.tags
			}`.toLowerCase();
			searchIndex.add(idx, searchableContent);
		});

		setIndex(searchIndex);
	}, [tracks]);

	// Handle search
	const handleSearch = useCallback(
		(term: string) => {
			setSearchTerm(term);

			if (!term.trim() || !index) {
				onSearchResults(tracks);
				return;
			}

			const results = index.search(term.toLowerCase());
			const matchedTracks = results.map((idx) => tracks[idx as number]);
			onSearchResults(matchedTracks);
		},
		[index, tracks, onSearchResults],
	);

	return (
		<div className="form-control w-full max-w-xl mx-auto my-6">
			<div className="input-group relative">
				<span className="absolute left-3 top-2 flex items-center pointer-events-none">
					<Search className="h-5 w-5 text-accent" />
				</span>
				<input
					type="text"
					value={searchTerm}
					onChange={(e) => handleSearch(e.target.value)}
					placeholder="Search by song, artist, album, or tag..."
					className="input input-bordered w-full pl-10 text-sm placeholder-accent focus:ring-2 focus:ring-accent"
				/>
			</div>
		</div>
	);
}
