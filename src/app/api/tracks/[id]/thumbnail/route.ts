import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';
import Placeholder from "@/app/images/placeholder.png";

export async function GET(
    request: NextRequest,
    context: { params: { id: string } }
) {
    try {
        // Properly destructure id from context
        const { id } = await context.params;

        const track = await prisma.track.findUnique({
            where: { id },
            select: {
                thumbnail: true,
                thumbnailType: true
            }
        });

        if (!track?.thumbnail) {
            // Redirect to default thumbnail if none exists
            const placeholderUrl = new URL(Placeholder.src, request.url).toString();
            return NextResponse.redirect(placeholderUrl);
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