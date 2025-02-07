import Link from 'next/link';

export default function PlaylistNotFound() {
  return (
    <div className="container mx-auto flex min-h-[50vh] flex-col items-center justify-center p-6">
      <h2 className="mb-4 text-2xl font-bold">Playlist not found</h2>
      <p className="mb-6 text-gray-400">The playlist you're looking for doesn't exist</p>
      <Link
        href="/playlists"
        className="rounded-lg bg-white/10 px-4 py-2 font-medium hover:bg-white/20"
      >
        Back to playlists
      </Link>
    </div>
  );
}
