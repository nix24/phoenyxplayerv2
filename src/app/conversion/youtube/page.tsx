"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import type { FFmpeg } from "@ffmpeg/ffmpeg";
import {
	AudioWaveformIcon,
	DownloadIcon,
	HomeIcon,
	Music4Icon,
	PlaySquareIcon,
} from "lucide-react";

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
		<main
			className="min-h-screen bg-gradient-to-br from-purple-900 via-base-100 to-blue-900 
		relative overflow-hidden"
		>
			{/* Animated background elements */}
			<div className="absolute inset-0 opacity-20">
				<div
					className="absolute top-0 left-0 w-96 h-96 bg-primary/30 rounded-full 
			filter blur-3xl animate-pulse"
				/>
				<div
					className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/30 
			rounded-full filter blur-3xl animate-pulse delay-1000"
				/>
			</div>

			<div className="container mx-auto px-4 py-8 relative z-10">
				<nav className="mb-8 flex items-center gap-2 text-white/80">
					<Link
						href="/"
						className="btn btn-ghost btn-circle hover:bg-white/10 transition-all"
					>
						<HomeIcon className="w-5 h-5" />
					</Link>
					<span className="text-white/50">/</span>
					<Link
						href="/conversion"
						className="btn btn-ghost btn-circle hover:bg-white/10 transition-all"
					>
						<AudioWaveformIcon className="w-5 h-5" />
					</Link>
					<span className="text-white/50">/</span>
					<span className="flex items-center gap-2">
						<PlaySquareIcon className="w-5 h-5" /> to MP3
					</span>
				</nav>

				<div className="max-w-4xl mx-auto">
					<div
						className="card backdrop-blur-xl bg-base-100/30 shadow-2xl 
			  border border-white/10 overflow-hidden"
					>
						<div className="card-body">
							<div className="flex items-center gap-4 mb-8">
								<div
									className="w-12 h-12 rounded-full bg-primary/20 flex items-center 
					justify-center animate-pulse"
								>
									<Music4Icon className="w-6 h-6 text-primary" />
								</div>
								<h2
									className="text-2xl font-bold bg-gradient-to-r from-primary 
					to-secondary bg-clip-text text-transparent"
								>
									YouTube to MP3 Converter
								</h2>
							</div>

							<form onSubmit={handleUrlSubmit} className="space-y-6">
								<div className="form-control relative group">
									<input
										type="url"
										placeholder="Paste YouTube URL here"
										className="input input-lg bg-base-200/50 backdrop-blur-sm 
						border-white/10 w-full pl-12 focus:border-primary/50 
						transition-all duration-300"
										value={url}
										onChange={(e) => setUrl(e.target.value)}
										required
										disabled={isLoading}
									/>
									<PlaySquareIcon
										className="absolute left-4 top-1/2 -translate-y-1/2 
					  w-5 h-5 text-white/50 group-focus-within:text-primary 
					  transition-colors"
									/>
								</div>
								<button
									type="submit"
									className="btn btn-primary btn-lg w-full group relative 
					  overflow-hidden"
									disabled={!ffmpegLoaded || !url.trim() || isLoading}
								>
									<span className="relative z-10 flex items-center gap-2">
										{isLoading ? (
											<>
												<span className="loading loading-spinner" />
												<p>Converting...</p>
											</>
										) : (
											<>
												<AudioWaveformIcon className="w-5 h-5" />
												Convert to MP3
											</>
										)}
									</span>
									<div
										className="absolute inset-0 bg-gradient-to-r from-primary 
					  to-secondary opacity-0 group-hover:opacity-100 transition-opacity"
									/>
								</button>
							</form>

							{videoInfo && (
								<div className="mt-8 space-y-6 animate-fadeIn">
									{videoInfo.thumbnail && (
										<div className="relative group">
											<img
												src={videoInfo.thumbnail}
												alt={videoInfo.title}
												className="rounded-xl w-full max-w-sm mx-auto 
							transform group-hover:scale-105 transition-transform 
							duration-300"
											/>
											<div
												className="absolute inset-0 bg-gradient-to-t 
						  from-black/60 to-transparent rounded-xl opacity-0 
						  group-hover:opacity-100 transition-opacity"
											/>
										</div>
									)}

									{videoInfo.title && (
										<h3
											className="text-xl font-bold text-center 
						bg-gradient-to-r from-primary to-secondary 
						bg-clip-text text-transparent"
										>
											{videoInfo.title}
										</h3>
									)}

									<div className="space-y-3">
										<div className="flex justify-between text-sm text-white/70">
											<span className="flex items-center gap-2">
												<span
													className="w-2 h-2 rounded-full bg-primary 
							animate-pulse"
												/>
												<span className="capitalize">{videoInfo.status}</span>
											</span>
											<span>{Math.round(videoInfo.progress)}%</span>
										</div>
										<div className="h-2 bg-base-200/30 rounded-full overflow-hidden">
											<div
												className="h-full bg-gradient-to-r from-primary to-secondary 
							transition-all duration-300"
												style={{ width: `${videoInfo.progress}%` }}
											/>
										</div>
									</div>

									{videoInfo.error && (
										<div
											className="alert alert-error bg-red-500/20 
						backdrop-blur-sm border-red-500/30"
										>
											{videoInfo.error}
										</div>
									)}

									{videoInfo.downloadUrl && (
										<a
											href={videoInfo.downloadUrl}
											download={`${videoInfo.title}.mp3`}
											className="btn btn-success btn-lg w-full group relative 
						  overflow-hidden"
										>
											<span className="relative z-10 flex items-center gap-2">
												<DownloadIcon className="w-5 h-5" />
												Download MP3
											</span>
											<div
												className="absolute inset-0 bg-gradient-to-r 
						  from-green-500 to-emerald-500 opacity-0 
						  group-hover:opacity-100 transition-opacity"
											/>
										</a>
									)}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>
		</main>
	);
}
