import { prisma } from "@/app/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { ListMusic, PlayCircle } from "lucide-react";
import { Buffer } from "node:buffer";

export default async function PlaylistsPage() {
    const playlists = await prisma.playlist.findMany({
        include: {
            tracks: {
                include: {
                    track: true,
                },
                orderBy: {
                    order: "asc",
                },
            },
        },
    });

    return (
        <div className="container mx-auto p-6">
            <h1 className="mb-8 text-3xl font-bold">Your Playlists</h1>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {playlists.map((playlist) => (
                    <Link
                        key={playlist.id}
                        href={`/playlists/${playlist.id}`}
                        className="group relative overflow-hidden rounded-lg bg-gray-900 p-4 transition-transform hover:scale-105"
                    >
                        <div className="relative aspect-square w-full overflow-hidden rounded-lg">
                            {playlist.tracks[0]?.track.thumbnail ? (
                                <Image
                                    src={`data:image/jpeg;base64,${Buffer.from(playlist.tracks[0].track.thumbnail).toString("base64")}`}
                                    alt={playlist.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="flex h-full items-center justify-center bg-gray-800">
                                    <ListMusic className="h-12 w-12 text-gray-400" />
                                </div>
                            )}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                                <PlayCircle className="h-12 w-12 text-white" />
                            </div>
                        </div>

                        <div className="mt-4 space-y-1">
                            <h2 className="font-semibold text-white">{playlist.name}</h2>
                            <p className="text-sm text-gray-400">
                                {playlist.tracks.length}{" "}
                                {playlist.tracks.length === 1 ? "track" : "tracks"}
                            </p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
