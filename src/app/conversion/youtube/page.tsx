"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { FFmpeg } from "@ffmpeg/ffmpeg";

interface VideoInfo {
	url: string;
	status: "waiting" | "downloading" | "converting" | "completed" | "error";
	progress: number;
	error?: string;
	downloadUrl?: string;
	title?: string;
	thumbnail?: string;
}

export default function YoutubePage() {
	const [url, setUrl] = useState("");
	const [videoInfo, setVideoInfo] = useState<VideoInfo | null>(null);
	const [ffmpeg, setFfmpeg] = useState<FFmpeg | null>(null);
	const [ffmpegLoaded, setFfmpegLoaded] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	// Load FFmpeg
	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		let mounted = true;

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

				if (mounted) {
					setFfmpeg(ffmpegInstance);
					setFfmpegLoaded(true);
					console.log("FFmpeg loaded successfully!");
				}
			} catch (error) {
				console.error("Error loading FFmpeg:", error);
				if (mounted) {
					setVideoInfo((prev) =>
						prev
							? {
									...prev,
									status: "error",
									error: "Failed to load FFmpeg. Please refresh and try again.",
								}
							: null,
					);
				}
			}
		};

		loadFfmpeg();

		return () => {
			mounted = false;
			if (ffmpeg) {
				ffmpeg.terminate();
			}
		};
	}, []);

	const convertToMp3 = useCallback(
		async (inputBuffer: Uint8Array, title: string) => {
			if (!ffmpeg || !ffmpegLoaded) {
				throw new Error("FFmpeg is not ready");
			}

			const inputFileName = "input.webm";
			const outputFileName = `${title.replace(/[^a-z0-9]/gi, "_")}.mp3`;

			await ffmpeg.writeFile(inputFileName, inputBuffer);

			const handleProgress = (p: { progress: number }) => {
				const progress = 95 + p.progress * 5; // Scale progress to remaining 5%
				setVideoInfo((prev) =>
					prev
						? {
								...prev,
								progress,
							}
						: null,
				);
			};

			ffmpeg.on("progress", handleProgress);

			try {
				await ffmpeg.exec([
					"-i",
					inputFileName,
					"-vn",
					"-ab",
					"128k",
					"-ar",
					"44100",
					"-y",
					outputFileName,
				]);

				const data = await ffmpeg.readFile(outputFileName);
				const uint8Array = new Uint8Array(data as unknown as ArrayBuffer);
				const downloadUrl = URL.createObjectURL(
					new Blob([uint8Array], { type: "audio/mp3" }),
				);

				return downloadUrl;
			} finally {
				ffmpeg.off("progress", handleProgress);
			}
		},
		[ffmpeg, ffmpegLoaded],
	);

	const handleUrlSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!url.trim() || !ffmpegLoaded || !ffmpeg || isLoading) return;

		setIsLoading(true);
		setVideoInfo({
			url,
			status: "downloading",
			progress: 0,
		});

		try {
			// Download video through API
			const response = await fetch("/api/youtube", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ url }),
			});

			if (!response.ok) {
				const error = await response.json();
				throw new Error(error.error || "Failed to download video");
			}

			const { title, thumbnail, audioData } = await response.json();

			setVideoInfo((prev) =>
				prev
					? {
							...prev,
							title,
							thumbnail,
							progress: 95,
							status: "converting",
						}
					: null,
			);

			const downloadUrl = await convertToMp3(new Uint8Array(audioData), title);

			setVideoInfo((prev) =>
				prev
					? {
							...prev,
							status: "completed",
							progress: 100,
							downloadUrl,
						}
					: null,
			);
		} catch (error: unknown) {
			console.error("Conversion error:", error);
			const errorMessage =
				error instanceof Error ? error.message : String(error);
			setVideoInfo((prev) =>
				prev
					? {
							...prev,
							status: "error",
							error: errorMessage,
						}
					: null,
			);
		} finally {
			setIsLoading(false);
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
						<li>
							<Link href="/conversion" className="text-primary">
								Conversion
							</Link>
						</li>
						<li>YouTube to MP3</li>
					</ul>
				</nav>

				<div className="card bg-base-200 shadow-xl">
					<div className="card-body">
						<h2 className="card-title mb-4">YouTube to MP3 Converter</h2>
						<form onSubmit={handleUrlSubmit} className="space-y-4">
							<div className="form-control">
								<input
									type="url"
									placeholder="Enter YouTube URL"
									className="input input-bordered w-full"
									value={url}
									onChange={(e) => setUrl(e.target.value)}
									required
									disabled={isLoading}
								/>
							</div>
							<button
								type="submit"
								className="btn btn-primary"
								disabled={!ffmpegLoaded || !url.trim() || isLoading}
							>
								{isLoading ? (
									<>
										<span className="loading loading-spinner" />
										<p>Converting...</p>
									</>
								) : (
									"Convert to MP3"
								)}
							</button>
						</form>

						{videoInfo && (
							<div className="mt-8 space-y-4">
								{videoInfo.thumbnail && (
									<img
										src={videoInfo.thumbnail}
										alt={videoInfo.title}
										className="rounded-lg max-w-sm mx-auto"
									/>
								)}
								{videoInfo.title && (
									<h3 className="text-lg font-semibold">{videoInfo.title}</h3>
								)}
								<div className="flex flex-col gap-2">
									<div className="flex justify-between text-sm">
										<span>
											Status:{" "}
											<span className="capitalize">{videoInfo.status}</span>
										</span>
										<span>{Math.round(videoInfo.progress)}%</span>
									</div>
									<progress
										className="progress progress-primary w-full"
										value={videoInfo.progress}
										max="100"
									/>
								</div>
								{videoInfo.error && (
									<div className="alert alert-error">{videoInfo.error}</div>
								)}
								{videoInfo.downloadUrl && (
									<a
										href={videoInfo.downloadUrl}
										download={`${videoInfo.title}.mp3`}
										className="btn btn-success w-full"
									>
										Download MP3
									</a>
								)}
							</div>
						)}
					</div>
				</div>
			</div>
		</main>
	);
}
