'use client';
// app/tracks/[id]/track-view.tsx
import { usePlayerStore } from '@/app/lib/stores/usePlayerStore';
import { formatTime } from '@/app/lib/util';
import type { Track } from '@/app/lib/types';
import { useEffect } from 'react';
import Image from 'next/image';

export function TrackView({ track }: { track: Track }) {
    const {
        currentTrack,
        isPlaying,
        progress,
        duration,
        play,
        pause,
        playTrack,
        playNext,
        playPrevious,
        queue,
        setQueue
    } = usePlayerStore();

    // Set up the queue when the component mounts
    useEffect(() => {
        setQueue([track]);
    }, [track, setQueue]);

    const isCurrentTrack = currentTrack?.id === track.id;

    // Handle play/pause
    const handlePlayPause = () => {
        if (isCurrentTrack) {
            isPlaying ? pause() : play();
        } else {
            playTrack(track);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            <div className="flex items-center gap-8">
                {/* Track thumbnail */}
                <Image
                    src={track.thumbnailUrl || '/default-thumbnail.png'}
                    alt={track.title}
                    fill={true}

                    className="rounded w-48 h-48 object-cover"
                />

                {/* Track info */}
                <div className="space-y-4 flex-1">
                    <h1 className="text-4xl font-bold">{track.title}</h1>
                    <p className="text-xl text-neutral-400">
                        {Array.isArray(track.artists)
                            ? track.artists.join(', ')
                            : track.artists}
                    </p>

                    {/* Controls */}
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={handlePlayPause}
                            className="p-4 rounded-full bg-white text-black hover:scale-105 transition"
                        >
                            {isCurrentTrack && isPlaying ? (
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                    <title>Pause</title>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 4h4v16H6zm8 0h4v16h-4z" />
                                </svg>
                            ) : (
                                <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                                    <title>Play</title>
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3l14 9-14 9V3z" />
                                </svg>
                            )}
                        </button>

                        <button
                            type="button"
                            onClick={playPrevious}
                            className="p-2 rounded-full hover:bg-neutral-800 transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <title>Previous Track</title>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>

                        <button
                            type="button"
                            onClick={playNext}
                            className="p-2 rounded-full hover:bg-neutral-800 transition"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <title>Next Track</title>
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>

                    {/* Progress bar (only show if current track) */}
                    {isCurrentTrack && (
                        <div className="flex items-center gap-2 text-sm text-neutral-400">
                            <span>{formatTime(progress)}</span>
                            <div className="relative flex-1 h-1 group">
                                <div className="absolute inset-0 h-1 bg-neutral-800 rounded-full">
                                    <div
                                        className="h-full bg-white rounded-full group-hover:bg-green-500 transition-colors"
                                        style={{ width: `${(progress / duration) * 100}%` }}
                                    />
                                </div>
                            </div>
                            <span>{formatTime(duration)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Additional track details */}
            <div className="space-y-4">
                <h2 className="text-xl font-semibold">About this track</h2>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <h3 className="text-sm text-neutral-400">Tags</h3>
                        <p className="mt-1">
                            {Array.isArray(track.tags)
                                ? track.tags.join(', ')
                                : track.tags || 'No tags'}
                        </p>
                    </div>
                    {track.fileSize && (
                        <div>
                            <h3 className="text-sm text-neutral-400">File Size</h3>
                            <p className="mt-1">
                                {(track.fileSize / 1024 / 1024).toFixed(2)} MB
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}