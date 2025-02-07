export default function PlaylistsLoading() {
	return (
		<div className="container mx-auto p-6">
			<div className="mb-8 h-9 w-48 animate-pulse rounded-lg bg-gray-800" />

			<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
				{[...Array(8)].map((_, i) => (
					<div
						key={i.toString()}
						className="overflow-hidden rounded-lg bg-gray-900 p-4"
					>
						<div className="aspect-square w-full animate-pulse rounded-lg bg-gray-800" />
						<div className="mt-4 space-y-2">
							<div className="h-5 w-3/4 animate-pulse rounded bg-gray-800" />
							<div className="h-4 w-1/2 animate-pulse rounded bg-gray-800" />
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
