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

    initializePlayer: (track: Track) => void;
    play: () => void;
    pause: () => void;
    playTrack: (track: Track) => void;
    setProgress: (time: number) => void;
    cleanup: () => void;
    playNext: () => void;
    playPrevious: () => void;
    setQueue: (tracks: Track[]) => void;
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
    currentTrack: null,
    isPlaying: false,
    howl: null,
    duration: 0,
    progress: 0,
    queue: [],

    setQueue: (tracks) => {
        set({ queue: tracks });
    },

    playNext: () => {
        const { currentTrack, queue } = get();
        if (!currentTrack || queue.length === 0) return;

        const currentIndex = queue.findIndex(track => track.id === currentTrack.id);
        const nextIndex = currentIndex === queue.length - 1 ? 0 : currentIndex + 1;
        const nextTrack = queue[nextIndex];

        if (nextTrack) {
            get().playTrack(nextTrack);
        }
    },

    playPrevious: () => {
        const { currentTrack, queue } = get();
        if (!currentTrack || queue.length === 0) return;

        const currentIndex = queue.findIndex(track => track.id === currentTrack.id);
        const prevIndex = currentIndex === 0 ? queue.length - 1 : currentIndex - 1;
        const prevTrack = queue[prevIndex];

        if (prevTrack) {
            get().playTrack(prevTrack);
        }
    },

    initializePlayer: (track) => {
        const state = get();
        if (state.howl) state.cleanup();

        const howl = new Howl({
            src: [track.url || ''],
            html5: true,
            onload: () => set({ duration: howl.duration() }),
            onplay: () => {
                set({ isPlaying: true });
                const progressInterval = setInterval(() => {
                    if (howl.playing()) {
                        set({ progress: howl.seek() });
                    } else {
                        clearInterval(progressInterval);
                    }
                }, 1000);
            },
            onpause: () => {
                const currentProgress = howl.seek();
                set({ isPlaying: false, progress: currentProgress });
            },
            onstop: () => set({ isPlaying: false, progress: 0 }),
            onend: () => {
                set({ isPlaying: false, progress: 0 });
                get().playNext();
            }
        });

        set({
            howl,
            currentTrack: track,
            isPlaying: false,
            progress: 0,
        });
    },

    play: () => {
        const { howl } = get();
        if (howl) howl.play();
    },

    pause: () => {
        const { howl } = get();
        if (howl) howl.pause();
    },

    playTrack: (track: Track) => {
        const state = get();
        state.initializePlayer(track);
        state.play();
    },

    setProgress: (time) => {
        const { howl, isPlaying } = get();
        if (howl) {
            howl.seek(time);
            set({ progress: time });
            if (isPlaying) {
                howl.play();
            }
        }
    },

    cleanup: () => {
        const { howl } = get();
        if (howl) howl.unload();
        set({
            howl: null,
            isPlaying: false,
            progress: 0,
            duration: 0,
        });
    },
}));