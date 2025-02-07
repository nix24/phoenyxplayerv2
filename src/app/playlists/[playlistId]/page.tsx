'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { usePlaylist } from '@/app/hooks/usePlaylist';
import Image from 'next/image';
import { PlayCircle, Plus } from 'lucide-react';
import { usePlayerStore } from '@/app/lib/stores/usePlayerStore';
import type { Track } from '@/app/lib/types';

export default function PlaylistPage() {
    const { playlistId } = useParams();
    const { data: playlist, isLoading, isError } = usePlaylist(playlistId as string);

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

    return (
        <div className="container mx-auto p-6">
            <div className="mb-8 flex items-center gap-6">
                <div className="relative h-48 w-48 overflow-hidden rounded-lg">
                    {playlist.tracks[0]?.track.thumbnailUrl ? (
                        <Image
                            src={playlist.tracks[0].track.thumbnailUrl}
                            alt={playlist.name}
                            fill
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full items-center justify-center bg-gray-800">
                            <Plus className="h-12 w-12 text-gray-400" />
                        </div>
                    )}
                </div>
                <div>
                    <h1 className="text-4xl font-bold">{playlist.name}</h1>
                    <p className="mt-2 text-gray-400">
                        {playlist.tracks.length} {playlist.tracks.length === 1 ? 'track' : 'tracks'}
                    </p>
                    {playlist.description && (
                        <p className="mt-2 text-gray-400">{playlist.description}</p>
                    )}
                </div>
            </div>

            <div className="space-y-4">
                {playlist.tracks.map((playlistTrack, index) => (
                    <PlaylistTrack
                        key={playlistTrack.id}
                        track={playlistTrack.track as Track & { url: string; thumbnailUrl: string }}
                        index={index}
                        tracks={playlist.tracks.map(pt => pt.track as Track & { url: string; thumbnailUrl: string })}
                    />
                ))}
            </div>
        </div>
    );
}

function PlaylistTrack({
    track,
    index,
    tracks,
}: {
    track: Track & { url: string; thumbnailUrl: string };
    index: number;
    tracks: (Track & { url: string; thumbnailUrl: string })[];
}) {
    const store = usePlayerStore();

    return (
        <div className="group flex items-center gap-4 rounded-lg bg-gray-900 p-4 transition-colors hover:bg-gray-800">
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded">
                {track.thumbnailUrl ? (
                    <Image
                        src={track.thumbnailUrl}
                        alt={track.title}
                        fill
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center bg-gray-800">
                        <Plus className="h-6 w-6 text-gray-400" />
                    </div>
                )}
            </div>

            <div className="flex-grow">
                <h3 className="font-medium">{track.title}</h3>
                <p className="text-sm text-gray-400">
                    {Array.isArray(track.artists)
                        ? track.artists.join(', ')
                        : JSON.parse(track.artists).join(', ')}
                </p>
            </div>

            <button
                type="button"
                onClick={() => store.playTrack(track, tracks)}
                className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 opacity-0 transition-opacity group-hover:opacity-100"
            >
                <PlayCircle className="h-6 w-6" />
            </button>
        </div>
    );
}