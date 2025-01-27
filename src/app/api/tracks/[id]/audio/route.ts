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

        const fileSize = track.fileSize || 0;
        const rangeHeader = request.headers.get('range');

        if (rangeHeader) {
            // Handle range request
            const parts = rangeHeader.replace(/bytes=/, '').split('-');
            const start = Number.parseInt(parts[0], 10);
            const end = parts[1] ? Number.parseInt(parts[1], 10) : fileSize - 1;
            const chunkSize = end - start + 1;

            // Create a slice of the audio data for the requested range
            const audioData = Buffer.from(track.data).subarray(start, end + 1);

            return new NextResponse(audioData, {
                status: 206,
                headers: {
                    'Content-Type': 'audio/mpeg',
                    'Content-Length': chunkSize.toString(),
                    'Content-Range': `bytes ${start}-${end}/${fileSize}`,
                    'Accept-Ranges': 'bytes',
                },
            });
        }

        // Return full file if no range is requested
        return new NextResponse(track.data, {
            headers: {
                'Content-Type': 'audio/mpeg',
                'Content-Length': fileSize.toString(),
                'Accept-Ranges': 'bytes',
            },
        });
    } catch (error) {
        console.error('Error fetching track:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
