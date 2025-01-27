import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET(
    request: NextRequest,
    context: { params: { id: string } }
) {
    try {
        // Properly destructure id from context
        const { id } = context.params;

        const track = await prisma.track.findUnique({
            where: { id },
            select: {
                thumbnail: true,
                thumbnailType: true
            }
        });

        if (!track?.thumbnail) {
            // Redirect to default thumbnail if none exists
            return NextResponse.redirect(new URL('/default-thumbnail.png', request.url));
        }

        const response = new NextResponse(track.thumbnail, {
            headers: {
                'Content-Type': track.thumbnailType || 'image/jpeg',
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Content-Length': track.thumbnail.length.toString(),
            },
        });

        return response;
    } catch (error) {
        console.error('Error fetching thumbnail:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}