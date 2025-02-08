'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { usePlaylist } from '@/app/hooks/usePlaylist';
import Image from 'next/image';
import { PlayCircle, Plus } from 'lucide-react';
import { usePlayerStore } from '@/app/lib/stores/usePlayerStore';
import type { Track } from '@/app/lib/types';
import { NowPlayingBar } from '@/app/components/NowPlayingBar';
import { TrackDropdown } from '@/app/components/TrackDropdown';
import Link from 'next/link';
import Placeholder from "@/app/images/placeholder.png";
import { useQueryClient } from '@tanstack/react-query';

export default function PlaylistPage() {
    const { playlistId } = useParams();
    const { data: playlist, isLoading, isError } = usePlaylist(playlistId as string);
    const { playTrack } = usePlayerStore();
    const queryClient = useQueryClient(); // Fixed: get the full queryClient instance

    const handleDelete = async (trackId: string) => {
        try {
            const response = await fetch(`/api/tracks/${trackId}`, {
                method: 'DELETE',
            });
            if (!response.ok) throw new Error('Failed to delete track');
            queryClient.invalidateQueries({ queryKey: ['playlist', playlistId] }); // Fixed: use queryClient instance
        } catch (err) {
            console.error(err);
        }
    };

    if (isLoading) {
        return (
            <div className="container mx-auto p-6">
                <div className="mb-8 flex items-center gap-6">
                    <div className="h-48 w-48 animate-pulse rounded-lg bg-gray-800" />
                    <div className="space-y-2">
                        <div className="h-8 w-48 animate-pulse rounded bg-gray-800" />
                        <div className="h-4 w-24 animate-pulse rounded bg-gray-800" />
                    </div>
                </div>
                <div className="space-y-4">
                    {[...Array(4)].map((_, i) => (
                        <div
                            key={i.toString()}
                            className="flex items-center gap-4 rounded-lg bg-gray-900 p-4"
                        >
                            <div className="h-12 w-12 animate-pulse rounded bg-gray-800" />
                            <div className="flex-1 space-y-2">
                                <div className="h-4 w-48 animate-pulse rounded bg-gray-800" />
                                <div className="h-3 w-32 animate-pulse rounded bg-gray-800" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="container mx-auto p-6">
                <div className="rounded-lg bg-red-500/10 p-4 text-red-500">
                    Error loading playlist
                </div>
            </div>
        );
    }

    if (!playlist) return null;

    const tracks = playlist.tracks.map(pt => pt.track as Track & { url: string; thumbnailUrl: string });

    return (
        <main className="min-h-screen pb-24 bg-base-100">
            <div className="container mx-auto px-4">
                <div className="mb-8 flex items-center gap-6 pt-6">
                    <div className="relative h-48 w-48 overflow-hidden rounded-lg">
                        {playlist.tracks[0]?.track.thumbnailUrl ? (
                            <Image
                                src={playlist.tracks[0].track.thumbnailUrl}
                                alt={playlist.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <div className="flex h-full items-center justify-center bg-base-300">
                                <Plus className="h-12 w-12 opacity-50" />
                            </div>
                        )}
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold">{playlist.name}</h1>
                        <p className="mt-2 opacity-70">
                            {playlist.tracks.length} {playlist.tracks.length === 1 ? 'track' : 'tracks'}
                        </p>
                        {playlist.description && (
                            <p className="mt-2 opacity-70">{playlist.description}</p>
                        )}
                    </div>
                </div>

                <section className="max-w-4xl mx-auto">
                    <ul className="list bg-base-100 rounded-box shadow-md">
                        {tracks.map((track) => (
                            <li
                                key={track.id}
                                className="list-row cursor-pointer hover:bg-base-300 transition-all"
                                onClick={() => playTrack(track, tracks)}
                                onKeyUp={(e) => {
                                    if (e.key === "Enter" || e.key === " ") {
                                        playTrack(track, tracks);
                                    }
                                }}
                            >
                                <div>
                                    <img
                                        className="w-16 h-16 rounded-lg object-cover"
                                        src={track.thumbnailUrl || Placeholder.src}
                                        alt={track.title}
                                    />
                                </div>
                                <div>
                                    <Link
                                        href={`/tracks/${track.id}`}
                                        className="hover:text-primary transition-colors"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {track.title}
                                    </Link>
                                    <p className="text-sm opacity-70">
                                        {Array.isArray(track.artists)
                                            ? track.artists.join(", ")
                                            : track.artists}
                                    </p>
                                </div>
                                <div className="list-col-grow flex justify-end">
                                    <TrackDropdown track={track} onDelete={() => handleDelete(track.id)} />
                                </div>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>
            <NowPlayingBar />
        </main>
    );
}