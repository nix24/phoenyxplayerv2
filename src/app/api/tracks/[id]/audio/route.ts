import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    const track = await prisma.track.findUnique({
        where: { id: params.id }
    });

    if (!track?.data) {
        return NextResponse.json({ error: 'Track not found' }, { status: 404 });
    }

    return new NextResponse(track.data, {
        headers: {
            'Content-Type': 'audio/mpeg',
            'Content-Length': track.fileSize?.toString() || '',
        },
    });
}