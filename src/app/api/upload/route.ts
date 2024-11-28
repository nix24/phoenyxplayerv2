// app/api/upload/route.ts
import { type NextRequest, NextResponse } from 'next/server';
import * as mm from 'music-metadata';
import { prisma } from '@/app/lib/prisma';

export async function POST(request: NextRequest) {
    try {
        console.log('Received request:', request);
        const data = await request.formData();
        console.log('Form data:', data);
        const file: File | null = data.get('file') as unknown as File;

        if (!file) {
            console.log('No file received');
            return NextResponse.json(
                { error: 'No file received' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes);

        const metadata = await mm.parseBuffer(buffer)

        const track = await prisma.track.create({
            data: {
                id: crypto.randomUUID(),
                title: metadata.common.title || file.name,
                artists: JSON.stringify([metadata.common.artist || 'Unknown']),
                tags: JSON.stringify(metadata.common.genre || []),
                fileSize: file.size,
                data: buffer
            }
        })
        return NextResponse.json({
            success: true,
            track
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to process file' },
            { status: 500 }
        );
    }
}
