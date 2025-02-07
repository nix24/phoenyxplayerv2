import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
  try {
    const playlists = await prisma.playlist.findMany({
      include: {
        tracks: {
          include: {
            track: true
          },
          orderBy: {
            order: 'asc'
          }
        }
      }
    });
    return NextResponse.json(playlists);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch playlists' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, description } = await request.json();
    const playlist = await prisma.playlist.create({
      data: {
        name,
        description
      }
    });
    return NextResponse.json(playlist);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create playlist' }, { status: 500 });
  }
}
