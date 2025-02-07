import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import { Prisma } from '@prisma/client';

export async function POST(
  request: Request,
  { params }: { params: { playlistId: string } }
) {
  try {
    const { trackId } = await request.json();
    const { playlistId } = await params;

    // Get the current highest order
    const lastTrack = await prisma.playlistTrack.findFirst({
      where: { playlistId },
      orderBy: { order: 'desc' }
    });

    const newOrder = lastTrack ? lastTrack.order + 1 : 0;

    // Add track to playlist
    const playlistTrack = await prisma.playlistTrack.create({
      data: {
        playlistId,
        trackId,
        order: newOrder
      },
      include: {
        track: true
      }
    });

    return NextResponse.json(playlistTrack);
  } catch (error: unknown) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json(
          { error: 'Track already exists in playlist' },
          { status: 400 }
        );
      }
    }
    return NextResponse.json(
      { error: 'Failed to add track to playlist' },
      { status: 500 }
    );
  }
}
export async function GET(
  request: Request,
  { params }: { params: { playlistId: string } }
) {
  try {
    const playlist = await prisma.playlist.findUnique({
      where: { id: params.playlistId },
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

    if (!playlist) {
      return NextResponse.json({ error: "Playlist not found" }, { status: 404 });
    }

    return NextResponse.json(playlist);
  } catch (error) {
    console.error("Error fetching playlist:", error);
    return NextResponse.json(
      { error: "Error fetching playlist" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { playlistId: string } }
) {
  try {
    const body = await request.json();
    const { name, trackIds } = body;

    const playlist = await prisma.playlist.update({
      where: { id: params.playlistId },
      data: {
        name,
        tracks: {
          deleteMany: {},
          create: trackIds.map((trackId: string, index: number) => ({
            trackId,
            order: index,
          })),
        },
      },
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

    return NextResponse.json(playlist);
  } catch (error) {
    console.error("Error updating playlist:", error);
    return NextResponse.json(
      { error: "Error updating playlist" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { playlistId: string } }
) {
  try {
    await prisma.playlist.delete({
      where: { id: params.playlistId },
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Error deleting playlist:", error);
    return NextResponse.json(
      { error: "Error deleting playlist" },
      { status: 500 }
    );
  }
}