export default function PlaylistLoading() {
	return (
		<div className="container mx-auto p-6">
			<div className="mb-8 flex items-end space-x-6">
				<div className="aspect-square w-48 animate-pulse rounded-lg bg-gray-800" />
				<div className="space-y-3">
					<div className="h-4 w-20 animate-pulse rounded bg-gray-800" />
					<div className="h-9 w-64 animate-pulse rounded bg-gray-800" />
					<div className="h-4 w-48 animate-pulse rounded bg-gray-800" />
				</div>
			</div>

			<div className="mt-8">
				<div className="mb-4 h-7 w-32 animate-pulse rounded bg-gray-800" />
				<div className="space-y-2">
					{[...Array(6)].map((_, i) => (
						<div
							key={i.toString()}
							className="flex items-center space-x-4 rounded-lg bg-gray-900 p-3"
						>
							<div className="h-12 w-12 animate-pulse rounded bg-gray-800" />
							<div className="space-y-2">
								<div className="h-4 w-48 animate-pulse rounded bg-gray-800" />
								<div className="h-3 w-32 animate-pulse rounded bg-gray-800" />
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
}
