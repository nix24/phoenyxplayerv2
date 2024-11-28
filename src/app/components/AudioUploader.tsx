'use client';

import { useState } from 'react';
import { usePlayerStore } from '../lib/stores/usePlayerStore';

export function AudioUploader() {
    const [metadata, setMetadata] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { setQueue } = usePlayerStore();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setIsLoading(true);
        setError(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!response.ok) {
                throw new Error('Upload failed');
            }
            //refresh track list after successful upload
            const tracksResponse = await fetch('/api/tracks')
            const tracks = await tracksResponse.json()
            setQueue(tracks)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to upload file');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-6 space-y-4">
            <div className="flex items-center">
                <input
                    type="file"
                    className="file-input file-input-bordered w-full max-w-xs"
                    name="audio"
                    id="audio-upload"
                    accept="audio/mpeg"
                    onChange={handleFileChange}
                />
            </div>

            {isLoading && <p>Loading...</p>}

            {error && (
                <div className="text-red-500">
                    Error: {error}
                </div>
            )}
        </div>
    );
}