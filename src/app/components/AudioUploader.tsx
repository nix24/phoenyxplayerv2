"use client";

import { useState } from "react";
import { usePlayerStore } from "../lib/stores/usePlayerStore";
import { Upload, X } from "lucide-react";

interface AudioUploaderProps {
	onUploadComplete: () => void;
}

export function AudioUploader({ onUploadComplete }: AudioUploaderProps) {
	const [metadata, setMetadata] = useState<string>("");
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [isExpanded, setIsExpanded] = useState(false);
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
			setIsExpanded(false); // Close after successful upload
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to upload file");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<>
			{/* Mobile Toggle Button */}
			<button
				type="button"
				onClick={() => setIsExpanded(!isExpanded)}
				className="md:hidden fixed bottom-24 right-4 btn btn-circle btn-primary shadow-lg"
			>
				{isExpanded ? (
					<X className="w-5 h-5" />
				) : (
					<Upload className="w-5 h-5" />
				)}
			</button>

			{/* Upload Panel */}
			<div
				className={`fixed md:static transition-all duration-300 ease-in-out
          ${
						isExpanded
							? "bottom-36 right-4 opacity-100 scale-100"
							: "bottom-36 right-4 opacity-0 scale-95 pointer-events-none md:opacity-100 md:scale-100 md:pointer-events-auto"
					}
        `}
			>
				<div className="bg-base-200 md:bg-transparent p-4 rounded-box shadow-lg md:shadow-none">
					<div className="space-y-3">
						{/* Upload Button */}
						<label
							htmlFor="audio-upload"
							className={`btn btn-accent gap-2 w-full md:w-auto 
                ${isLoading ? "loading" : ""}`}
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

						{/* Error Message */}
						{error && (
							<div className="text-sm text-error bg-error/10 p-2 rounded-lg">
								{error}
							</div>
						)}
					</div>
				</div>
			</div>
		</>
	);
}
