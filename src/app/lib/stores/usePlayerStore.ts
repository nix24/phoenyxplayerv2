import { create } from 'zustand';
import { Howl } from 'howler';
import type { Track } from '@/app/lib/types';

interface PlayerState {
    currentTrack: Track | null;
    isPlaying: boolean;
    howl: Howl | null;
    duration: number;
    progress: number;
    queue: Track[];
    volume: number;
    isMuted: boolean;
    previousVolume: number;
    currentIndex: number;

    initializePlayer: (track: Track, tracks?: Track[]) => void;
    play: () => void;
    pause: () => void;
    playTrack: (track: Track, tracks?: Track[]) => void;
    setProgress: (time: number) => void;
    cleanup: () => void;
    playNext: () => void;
    playPrevious: () => void;
    setQueue: (tracks: Track[]) => void;
    setVolume: (volume: number) => void;
    toggleMute: () => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
    currentTrack: null,
    isPlaying: false,
    howl: null,
    duration: 0,
    progress: 0,
    queue: [],
    volume: 100,
    isMuted: false,
    previousVolume: 100,
    currentIndex: -1,

    setQueue: (tracks) => {
        set({ queue: tracks });
    },

    playNext: () => {
        const { currentTrack, queue, howl } = get();
        if (!currentTrack || queue.length === 0) return;

        const currentIndex = queue.findIndex(track => track.id === currentTrack.id);
        if (currentIndex === -1) return;

        const nextIndex = currentIndex === queue.length - 1 ? 0 : currentIndex + 1;
        const nextTrack = queue[nextIndex];

        if (howl) {
            howl.stop();
        }

        get().initializePlayer(nextTrack);
    },

    playPrevious: () => {
        const { currentTrack, queue, howl } = get();
        if (!currentTrack || queue.length === 0) return;

        const currentIndex = queue.findIndex(track => track.id === currentTrack.id);
        if (currentIndex === -1) return;

        const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
        const prevTrack = queue[prevIndex];

        if (howl) {
            howl.stop();
        }

        get().initializePlayer(prevTrack);
    },

    initializePlayer: (track, tracks) => {
        const { howl: currentHowl } = get();
        if (currentHowl) {
            currentHowl.stop();
            currentHowl.unload();
        }

        if (tracks) {
            set({ queue: tracks });
        }

        if (!track.url) {
            throw new Error('Track URL is required for playback');
        }

        const howl = new Howl({
            src: [track.url],
            html5: true,
            onload: () => {
                set(state => ({
                    duration: howl.duration(),
                    currentTrack: track,
                    currentIndex: state.queue.findIndex(t => t.id === track.id)
                }));
            },
            onend: () => {
                get().playNext();
            },
            onplay: () => {
                set({ isPlaying: true });
                const updateProgress = () => {
                    if (get().isPlaying) {
                        set({ progress: howl.seek() });
                        requestAnimationFrame(updateProgress);
                    }
                };
                updateProgress();
            },
            onpause: () => set({ isPlaying: false }),
            onstop: () => set({ isPlaying: false, progress: 0 }),
        });

        set({ howl });
        howl.play();
    },

    play: () => {
        const { howl } = get();
        if (howl) {
            howl.play();
        }
    },

    pause: () => {
        const { howl } = get();
        if (howl) {
            howl.pause();
        }
    },

    playTrack: (track, tracks) => {
        get().initializePlayer(track, tracks);
    },

    setProgress: (time) => {
        const { howl } = get();
        if (howl) {
            howl.seek(time);
            set({ progress: time });
        }
    },

    cleanup: () => {
        const { howl } = get();
        if (howl) {
            howl.stop();
            howl.unload();
        }
        set({
            currentTrack: null,
            isPlaying: false,
            howl: null,
            duration: 0,
            progress: 0,
        });
    },

    setVolume: (volume) => {
        const { howl, isMuted } = get();
        if (howl && !isMuted) {
            howl.volume(volume / 100);
        }
        set({ volume });
    },

    toggleMute: () => {
        const { howl, isMuted, volume, previousVolume } = get();
        if (howl) {
            if (isMuted) {
                howl.volume(previousVolume / 100);
                set({ isMuted: false });
            } else {
                set({ previousVolume: volume });
                howl.volume(0);
                set({ isMuted: true });
            }
        }
    },
}));