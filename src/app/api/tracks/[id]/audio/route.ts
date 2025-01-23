import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';


export async function GET(
    request: NextRequest,
    context: { params: { id: string } }
) {
    // Await context.params to ensure it's properly resolved
    const params = await context.params;
    const { id } = params;

    try {
        const track = await prisma.track.findUnique({
            where: { id }
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
    } catch (error) {
        console.error('Error fetching track:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
