"use client";

import { useState, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import Link from "next/link";
import type { FFmpeg } from "@ffmpeg/ffmpeg";

type ConversionFormat = "mp3" | "opus" | "wav";
type FileStatus = "waiting" | "converting" | "completed" | "error";

interface FileWithStatus {
	file: File;
	status: FileStatus;
	progress: number;
	error?: string;
	downloadUrl?: string;
}

export default function FileConversion() {
	const [files, setFiles] = useState<FileWithStatus[]>([]);
	const [selectedFormat, setSelectedFormat] = useState<ConversionFormat>("mp3");
	const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null);
	const [ffmpegReady, setFfmpegReady] = useState(false);

	useEffect(() => {
		/**
		 * Loads FFmpeg and its dependencies asynchronously.
		 * Sets up FFmpeg instance and updates component state upon successful loading.
		 * @async
		 */
		const loadFfmpeg = async () => {
			try {
				const { FFmpeg } = await import("@ffmpeg/ffmpeg");
				const { toBlobURL } = await import("@ffmpeg/util");

				const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.2/dist/umd";
				const ffmpegInstance = new FFmpeg();

				await ffmpegInstance.load({
					coreURL: await toBlobURL(
						`${baseURL}/ffmpeg-core.js`,
						"text/javascript",
					),
					wasmURL: await toBlobURL(
						`${baseURL}/ffmpeg-core.wasm`,
						"application/wasm",
					),
				});

				setFfmpeg(ffmpegInstance);
				setFfmpegReady(true);
				console.log("FFmpeg loaded successfully!");
			} catch (error) {
				console.error("Error loading FFmpeg:", error);
			}
		};

		loadFfmpeg();

		// Cleanup function to terminate FFmpeg instance when component unmounts
		return () => {
			if (ffmpeg) {
				ffmpeg.terminate();
			}
		};
	}, [ffmpeg]); // Re-run effect if ffmpeg instance changes

	const onDrop = useCallback((acceptedFiles: File[]) => {
		const newFiles = acceptedFiles.slice(0, 5).map((file) => ({
			file,
			status: "waiting" as FileStatus,
			progress: 0,
		}));
		setFiles((prev) => [...prev, ...newFiles].slice(0, 5));
	}, []);

	const { getRootProps, getInputProps, isDragActive } = useDropzone({
		onDrop,
		accept: {
			"audio/*": [".mp3", ".wav", ".ogg", ".m4a", ".aac"],
		},
		maxFiles: 5,
	});

	const convertFile = async (fileWithStatus: FileWithStatus) => {
		if (!ffmpegReady || !ffmpeg) {
			console.warn("FFmpeg not ready yet.");
			return;
		}

		const { file } = fileWithStatus;
		const inputFileName = file.name;
		const outputFileName = `output.${selectedFormat}`;
		const { fetchFile } = await import("@ffmpeg/util");

		const handleProgress = (p: { progress: number }) => {
			const progress = p.progress * 100;
			setFiles((prev) =>
				prev.map((f) => (f.file === file ? { ...f, progress } : f)),
			);
		};

		// Update status to converting
		setFiles((prev) =>
			prev.map((f) =>
				f.file === file ? { ...f, status: "converting", progress: 0 } : f,
			),
		);

		ffmpeg.on("progress", handleProgress);

		try {
			// Write the file to FFmpeg's virtual file system
			await ffmpeg.writeFile(inputFileName, await fetchFile(file));

			// Execute FFmpeg command
			const command = ["-i", inputFileName, outputFileName];
			await ffmpeg.exec(command);

			// Read and process the result
			const data = await ffmpeg.readFile(outputFileName);
			const uint8Array = new Uint8Array(data as unknown as ArrayBuffer);
			const url = URL.createObjectURL(
				new Blob([uint8Array], { type: `audio/${selectedFormat}` }),
			);

			// Update status to completed
			setFiles((prev) =>
				prev.map((f) =>
					f.file === file ? { ...f, status: "completed", downloadUrl: url } : f,
				),
			);
		} catch (error: unknown) {
			console.error("Conversion error:", error);
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			setFiles((prev) =>
				prev.map((f) =>
					f.file === file ? { ...f, status: "error", error: errorMessage } : f,
				),
			);
		} finally {
			ffmpeg.off("progress", handleProgress);
		}
	};

	const handleConvert = async () => {
		// Convert files sequentially
		for (const fileWithStatus of files) {
			if (fileWithStatus.status === "waiting") {
				await convertFile(fileWithStatus);
			}
		}
	};

	return (
		<main className="container mx-auto px-4 py-8">
			<div className="max-w-4xl mx-auto">
				<nav className="mb-8 breadcrumbs">
					<ul>
						<li>
							<Link href="/" className="text-primary">
								Home
							</Link>
						</li>
						<li>File Conversion</li>
					</ul>
				</nav>

				<div className="card bg-base-200 shadow-xl">
					<div className="card-body">
						<h1 className="card-title text-2xl mb-6">Audio File Conversion</h1>

						<div className="form-control w-full max-w-xs mb-6">
							<label htmlFor="format-select" className="label">
								<span className="label-text">Output Format</span>
							</label>
							<select
								id="format-select"
								className="select select-bordered"
								value={selectedFormat}
								onChange={(e) =>
									setSelectedFormat(e.target.value as ConversionFormat)
								}
								disabled={!ffmpegReady}
							>
								<option value="mp3">MP3</option>
								<option value="opus">Opus</option>
								<option value="wav">WAV</option>
							</select>
						</div>

						<button
							type="button"
							{...getRootProps()}
							className={`w-full border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors
                ${
									isDragActive
										? "border-primary bg-primary/10"
										: "border-base-content/20 hover:border-primary"
								}`}
							aria-label="Drag and drop audio files here or click to select files"
							disabled={!ffmpegReady}
						>
							<input {...getInputProps()} aria-label="File input" />
							<div className="flex flex-col items-center gap-4">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									className="h-12 w-12 opacity-50"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
									aria-hidden="true"
								>
									<title>Upload icon</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
									/>
								</svg>
								<div>
									<p className="text-lg font-medium">
										Drop your audio files here
									</p>
									<p className="text-sm opacity-70">or click to select files</p>
								</div>
							</div>
						</button>

						{!ffmpegReady && (
							<div className="alert alert-info mt-4">
								<svg
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
									className="stroke-current shrink-0 w-6 h-6"
								>
									<title>Loading icon</title>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth="2"
										d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
									/>
								</svg>
								<span>Loading FFmpeg... Please wait.</span>
							</div>
						)}

						{files.length > 0 && (
							<div className="mt-8">
								<h2 className="text-lg font-semibold mb-4">Files to Convert</h2>
								<div className="space-y-4">
									{files.map((file, i) => (
										<div
											key={`${file.file.name}-${i}`}
											className="card bg-base-300"
										>
											<div className="card-body p-4">
												<div className="flex items-center justify-between">
													<span className="font-medium">{file.file.name}</span>
													<span className="badge badge-primary">
														{file.status}
													</span>
												</div>
												{file.status === "converting" && (
													<progress
														className="progress progress-primary w-full"
														value={file.progress}
														max="100"
														aria-label={`Conversion progress for ${file.file.name}`}
													/>
												)}
												{file.error && (
													<div className="text-error text-sm mt-2">
														{file.error}
													</div>
												)}
												{file.downloadUrl && (
													<a
														href={file.downloadUrl}
														download
														className="btn btn-primary btn-sm mt-2"
													>
														Download
													</a>
												)}
											</div>
										</div>
									))}
								</div>

								<div className="mt-6 flex justify-end">
									<button
										type="button"
										className="btn btn-primary"
										onClick={handleConvert}
										disabled={
											files.some((f) => f.status === "converting") ||
											!ffmpegReady
										}
									>
										Convert Files
									</button>
								</div>
							</div>
						)}
					</div>
				</div>
			</div>
		</main>
	);
}
