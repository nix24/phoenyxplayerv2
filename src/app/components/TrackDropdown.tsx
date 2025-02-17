import { createPortal } from "react-dom";
import type { Track } from "../lib/types";
import { Info, TagIcon, TrashIcon, MoreVertical } from "lucide-react";

interface TrackDropdownProps {
	track: Track;
	onDelete: () => void;
}

export function TrackDropdown({
	track,
	onDelete,
}: Readonly<TrackDropdownProps>) {
	const getArtistsString = (artists: string | string[] | undefined): string => {
		if (typeof artists === "string") return artists;
		if (Array.isArray(artists)) return artists.join(", ");
		return "Unknown Artist";
	};

	const getTagsString = (tags: string | string[] | undefined): string => {
		if (typeof tags === "string") return JSON.parse(tags).join(", ");
		if (Array.isArray(tags)) return tags.join(", ");
		return "No tags";
	};

	const artists = getArtistsString(track.artists);
	const tags = getTagsString(track.tags);

	return (
		<>
			<button
				type="button"
				className="btn btn-ghost btn-sm"
				onClick={(e) => {
					e.stopPropagation();
					const dialog = document.getElementById(`options-${track.id}`);
					if (dialog) (dialog as HTMLDialogElement).showModal();
				}}
			>
				<MoreVertical className="w-5 h-5" />
			</button>

			{createPortal(
				<dialog
					id={`options-${track.id}`}
					className="modal modal-bottom sm:modal-middle"
					onClick={(e) => {
						if (e.target === e.currentTarget) {
							e.stopPropagation();
							(e.target as HTMLDialogElement).close();
						}
					}}
					onKeyUp={(e) => {
						e.stopPropagation();
						if (e.key === "Escape") {
							(e.target as HTMLDialogElement).close();
						}
					}}
				>
					<div
						className="modal-box bg-base-300/95 backdrop-blur-xl border border-primary/20 z-50"
						// biome-ignore lint/a11y/useSemanticElements: <explanation>
						role="dialog"
						tabIndex={-1}
						onClick={(e) => e.stopPropagation()}
						onKeyUp={(e) => {
							if (e.key === "Escape") {
								(e.target as HTMLDialogElement).close();
							}
						}}
					>
						<div className="space-y-2">
							<button
								type="button"
								onClick={() => {
									(
										document.getElementById(
											`options-${track.id}`,
										) as HTMLDialogElement
									).close();
									const dialog = document.getElementById(`track-${track.id}`);
									if (dialog) (dialog as HTMLDialogElement).showModal();
								}}
								className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 
								rounded-lg transition-all duration-300 hover:translate-x-1"
							>
								<span
									className="w-8 h-8 rounded-full bg-primary/20 flex items-center 
								justify-center group-hover:scale-110 transition-transform"
								>
									<Info className="w-5 h-5" />
								</span>
								Details
							</button>

							<button
								type="button"
								onClick={() => {
									(
										document.getElementById(
											`options-${track.id}`,
										) as HTMLDialogElement
									).close();
									const dialog = document.getElementById(`edit-${track.id}`);
									if (dialog) (dialog as HTMLDialogElement).showModal();
								}}
								className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/10 
								rounded-lg transition-all duration-300 hover:translate-x-1"
							>
								<span
									className="w-8 h-8 rounded-full bg-primary/20 flex items-center 
								justify-center group-hover:scale-110 transition-transform"
								>
									<TagIcon className="w-5 h-5" />
								</span>
								Edit Tags
							</button>

							<button
								type="button"
								onClick={() => {
									(
										document.getElementById(
											`options-${track.id}`,
										) as HTMLDialogElement
									).close();
									onDelete();
								}}
								className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 
								rounded-lg transition-all duration-300 hover:translate-x-1 text-red-400"
							>
								<span
									className="w-8 h-8 rounded-full bg-red-500/20 flex items-center 
								justify-center group-hover:scale-110 transition-transform"
								>
									<TrashIcon className="w-5 h-5" />
								</span>
								Delete
							</button>
						</div>
						<div className="modal-action">
							<form method="dialog">
								<button
									type="button"
									className="btn btn-primary btn-outline group"
									onClick={(e) => {
										e.stopPropagation();
										(
											document.getElementById(
												`options-${track.id}`,
											) as HTMLDialogElement
										).close();
									}}
								>
									<span className="group-hover:scale-110 transition-transform">
										Close
									</span>
								</button>
							</form>
						</div>
					</div>
				</dialog>,
				document.body,
			)}

			{/* Details Modal */}
			{createPortal(
				<dialog
					id={`track-${track.id}`}
					className="modal modal-bottom sm:modal-middle"
					onClick={(e) => {
						if (e.target === e.currentTarget) {
							e.stopPropagation();
							(e.target as HTMLDialogElement).close();
						}
					}}
					onKeyUp={(e) => {
						e.stopPropagation();
						if (e.key === "Escape") {
							(e.target as HTMLDialogElement).close();
						}
					}}
				>
					<div
						className="modal-box bg-base-300/95 backdrop-blur-xl border border-primary/20"
						onClick={(e) => e.stopPropagation()}
						onKeyUp={(e) => {
							if (e.key === "Escape") {
								(e.target as HTMLDialogElement).close();
							}
						}}
						// biome-ignore lint/a11y/useSemanticElements: <explanation>
						role="dialog"
					>
						<div className="relative">
							<div className="absolute -top-6 -left-6 w-20 h-20 bg-primary/10 rounded-full blur-xl animate-pulse" />
							<h3 className="font-bold text-xl mb-6 text-primary">
								{track.title}
							</h3>
							<div className="space-y-4">
								<div className="p-3 bg-base-100/50 rounded-lg backdrop-blur-sm">
									<p className="text-sm opacity-70">Artists</p>
									<p className="font-medium">{artists}</p>
								</div>
								<div className="p-3 bg-base-100/50 rounded-lg backdrop-blur-sm">
									<p className="text-sm opacity-70">Tags</p>
									<div className="flex flex-wrap gap-2 mt-1">
										{tags.split(", ").map((tag: string) => (
											<span
												key={tag}
												className="px-2 py-1 rounded-full bg-primary/20 text-sm
												border border-primary/30 hover:scale-105 transition-transform"
											>
												{tag}
											</span>
										))}
									</div>
								</div>
								<div className="p-3 bg-base-100/50 rounded-lg backdrop-blur-sm">
									<p className="text-sm opacity-70">File Size</p>
									<p className="font-medium">
										{track.fileSize
											? `${(track.fileSize / 1024 / 1024).toFixed(2)} MB`
											: "Unknown"}
									</p>
								</div>
							</div>
							<div className="modal-action">
								<form method="dialog">
									<button
										type="button"
										className="btn btn-primary btn-outline group"
										onClick={(e) => {
											e.stopPropagation();
											(
												document.getElementById(
													`track-${track.id}`,
												) as HTMLDialogElement
											).close();
										}}
									>
										<span className="group-hover:scale-110 transition-transform">
											Close
										</span>
									</button>
								</form>
							</div>
						</div>
					</div>
				</dialog>,
				document.body,
			)}

			{/* Edit Tags Modal */}
			{createPortal(
				<dialog
					id={`edit-${track.id}`}
					className="modal modal-bottom sm:modal-middle"
					onClick={(e) => {
						if (e.target === e.currentTarget) {
							e.stopPropagation();
							(e.target as HTMLDialogElement).close();
						}
					}}
					onKeyUp={(e) => {
						e.stopPropagation();
						if (e.key === "Escape") {
							(e.target as HTMLDialogElement).close();
						}
					}}
				>
					<div
						className="modal-box bg-base-300/95 backdrop-blur-xl border border-primary/20"
						onClick={(e) => e.stopPropagation()}
						onKeyUp={(e) => {
							e.stopPropagation();
							if (e.key === "Escape") {
								(e.target as HTMLDialogElement).close();
							}
						}}
						// biome-ignore lint/a11y/useSemanticElements: <explanation>
						role="dialog"
					>
						<div className="relative">
							<h3 className="font-bold text-xl mb-6 text-primary">Edit Tags</h3>
							<div className="space-y-4">
								<div className="p-4 bg-base-100/50 rounded-lg backdrop-blur-sm">
									<p className="text-sm opacity-70 mb-2">Current Tags</p>
									<div className="flex flex-wrap gap-2">
										{tags.split(", ").map((tag: string) => (
											<span
												key={tag}
												className="px-3 py-1.5 rounded-full bg-primary/20 text-sm
												border border-primary/30 hover:scale-105 transition-transform
												hover:bg-primary/30 cursor-pointer"
											>
												{tag}
												<span className="ml-2 opacity-70">×</span>
											</span>
										))}
									</div>
								</div>
								<div className="p-4 bg-base-100/50 rounded-lg backdrop-blur-sm">
									<input
										type="text"
										placeholder="Add new tag..."
										className="input input-bordered w-full bg-base-100/50
										focus:border-primary/50 transition-colors"
									/>
								</div>
							</div>
							<div className="modal-action flex gap-2">
								<form method="dialog">
									<button
										type="button"
										className="btn btn-ghost group"
										onClick={(e) => {
											e.stopPropagation();
											(
												document.getElementById(
													`edit-${track.id}`,
												) as HTMLDialogElement
											).close();
										}}
									>
										<span className="group-hover:scale-110 transition-transform">
											Cancel
										</span>
									</button>
								</form>
								<button type="button" className="btn btn-primary group">
									<span className="group-hover:scale-110 transition-transform">
										Save Changes
									</span>
								</button>
							</div>
						</div>
					</div>
				</dialog>,
				document.body,
			)}
		</>
	);
}
