import { create } from 'zustand';
import { Howl } from 'howler';
import type { Track } from '@/app/lib/types';
import { detectBPM } from '@/app/lib/utils/bpmDetector';

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
    bpm: number;
    pulseTimestamp: number;
    beatIntervalId: number | null;

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
    triggerPulse: () => void;
    startBeatPulse: () => void;
    stopBeatPulse: () => void;
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
    bpm: 120,
    pulseTimestamp: 0,
    beatIntervalId: null,

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
        // Clean up any existing player
        get().cleanup();

        if (tracks) {
            set({ queue: tracks });
        }

        if (!track.url) {
            throw new Error('Track URL is required for playback');
        }

        const howl = new Howl({
            src: [track.url],
            html5: true,
            onload: async () => {
                // Detect BPM if not already set
                if (!track.bpm && track.url) {
                    try {
                        const detectedBpm = await detectBPM(track.url);
                        track.bpm = detectedBpm;
                    } catch (error) {
                        console.error('Failed to detect BPM:', error);
                    }
                }

                set({
                    duration: howl.duration(),
                    bpm: track.bpm || 120,
                });
            },
            onplay: () => {
                set({ isPlaying: true });
                get().startBeatPulse();
            },
            onpause: () => {
                set({ isPlaying: false });
                get().stopBeatPulse();
            },
            onstop: () => {
                set({ isPlaying: false });
                get().stopBeatPulse();
            },
            onend: () => {
                get().stopBeatPulse();
                get().playNext();
            },
        });

        set({
            currentTrack: track,
            howl,
            progress: 0,
        });

        howl.play();
    },

    play: () => {
        const { howl } = get();
        if (howl) {
            howl.play();
            set({ isPlaying: true });
            get().startBeatPulse();
        }
    },

    pause: () => {
        const { howl } = get();
        if (howl) {
            howl.pause();
            set({ isPlaying: false });
            get().stopBeatPulse();
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
        get().stopBeatPulse();
        set({
            currentTrack: null,
            howl: null,
            isPlaying: false,
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

    triggerPulse: () => set({ pulseTimestamp: Date.now() }),

    startBeatPulse: () => {
        const { bpm } = get();
        const interval = 60000 / bpm;
        const id = setInterval(() => {
            set({ pulseTimestamp: Date.now() });
        }, interval);
        set({ beatIntervalId: id as unknown as number });
    },

    stopBeatPulse: () => {
        const { beatIntervalId } = get();
        if (beatIntervalId) {
            clearInterval(beatIntervalId);
            set({ beatIntervalId: null });
        }
    },
}));