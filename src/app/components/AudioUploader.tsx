"use client";

import { useState } from "react";
import { usePlayerStore } from "../lib/stores/usePlayerStore";
import { Upload } from "lucide-react";

interface AudioUploaderProps {
	onUploadComplete: () => void;
}
export function AudioUploader({ onUploadComplete }: AudioUploaderProps) {
	const [metadata, setMetadata] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const { setQueue } = usePlayerStore();

	const handleFileChange = async (
		event: React.ChangeEvent<HTMLInputElement>,
	) => {
		const file = event.target.files?.[0];
		if (!file) return;

		setIsLoading(true);
		setError(null);

		const formData = new FormData();
		formData.append("file", file);

		try {
			const response = await fetch("/api/upload", {
				method: "POST",
				body: formData,
			});

			if (!response.ok) {
				throw new Error("Upload failed");
			}
			onUploadComplete?.();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to upload file");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div className="p-6 space-y-4">
			{/* Audio Uploader */}
			<div className="flex items-center space-x-2">
				<label
					htmlFor="audio-upload"
					className="btn btn-outline btn-accent gap-2 file-input w-full max-w-xs rounded-full"
				>
					{isLoading ? (
						<>
							<span className="loading loading-spinner loading-sm" />
							Uploading...
						</>
					) : (
						<>
							<Upload className="w-5 h-5" />
							Upload Audio
						</>
					)}
				</label>
				<input
					type="file"
					id="audio-upload"
					name="audio"
					className="hidden"
					accept="audio/mpeg"
					onChange={handleFileChange}
					disabled={isLoading}
				/>
			</div>

			{/* Error Message */}
			{error && <div className="text-sm text-error">Error: {error}</div>}
		</div>
	);
}
