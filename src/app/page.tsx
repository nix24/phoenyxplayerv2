'use client';

import { tracks } from "./lib/testData";
import { usePlayerStore } from "@/app/lib/stores/usePlayerStore";
import { NowPlayingBar } from "@/app/components/NowPlayingBar";
import { useEffect, useState } from "react";
import { AudioUploader } from "./components/AudioUploader";
import type { Track } from "@prisma/client";

export default function Home() {
    const { playTrack, setQueue } = usePlayerStore();
    const [tracks, setTracks] = useState<Track[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchTracks = async () => {
            try {
                const response = await fetch('/api/tracks');
                if (!response.ok) throw new Error('Failed to fetch tracks');
                const data = await response.json();

                const formattedTracks = data.map((track: Track) => ({
                    id: track.id,
                    url: `/api/tracks/${track.id}/audio`, // URL to stream the audio
                    title: track.title,
                    artists: JSON.parse(track.artists) as string[], // Parsing artists as an array of strings
                    tags: JSON.parse(track.tags),
                    fileSize: track.fileSize === null ? undefined : track.fileSize,

                }));

                setTracks(formattedTracks);
                setQueue(formattedTracks);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load tracks');
            } finally {
                setLoading(false);
            }
        };

        fetchTracks();
    }, [setQueue]);

    if (loading) return <div className="p-6">Loading tracks...</div>;
    if (error) return <div className="p-6 text-red-500">Error: {error}</div>;
    return (
        <main className="min-h-screen pb-24">
            <header className="p-6">
                <p className="text-sm text-neutral-400 mb-4">
                    Disclaimer: This app is still in early stages of development. Feel free
                    to check out the code on{" "}
                    <a href="https://github.com/nix24/phoenixPlayer" className="underline hover:text-white">
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
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        playTrack(track);
                                    }
                                }}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-neutral-700 rounded" />
                                    <div>
                                        <p className="font-medium">{track.title}</p>
                                        <p className="text-sm text-neutral-400">{track.artists}</p>
                                    </div>
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
                            <AudioUploader />
                        </label>
                    </div>
                </div>
            </aside>

            <NowPlayingBar />
        </main>
    );
}