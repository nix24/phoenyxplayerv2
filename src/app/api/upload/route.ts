import { type NextRequest, NextResponse } from 'next/server';
import * as mm from 'music-metadata';
import { prisma } from '@/app/lib/prisma';
import sharp from 'sharp';

export async function POST(request: NextRequest) {
    try {
        const data = await request.formData();
        const file: File | null = data.get('file') as unknown as File;
        const customThumbnail: File | null = data.get('thumbnail') as unknown as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No audio file received' },
                { status: 400 }
            );
        }

        // Process audio file
        const audioBytes = await file.arrayBuffer();
        const audioBuffer = Buffer.from(audioBytes);
        const metadata = await mm.parseBuffer(audioBuffer);

        // Handle thumbnail
        let thumbnail: Buffer | undefined;
        let thumbnailType: string | undefined;

        if (customThumbnail) {
            // If a custom thumbnail was uploaded, process it
            const thumbBytes = await customThumbnail.arrayBuffer();
            const thumbBuffer = Buffer.from(thumbBytes);
            
            // Process with sharp to ensure it's a valid image and resize if needed
            thumbnail = await sharp(thumbBuffer)
                .resize(300, 300, { fit: 'cover' })
                .jpeg({ quality: 80 })
                .toBuffer();
            thumbnailType = 'image/jpeg';
        } else if (metadata.common.picture && metadata.common.picture.length > 0) {
            // Fall back to embedded artwork if available
            const rawThumb = metadata.common.picture[0];
            thumbnail = await sharp(rawThumb.data)
                .resize(300, 300, { fit: 'cover' })
                .jpeg({ quality: 80 })
                .toBuffer();
            thumbnailType = 'image/jpeg';
        }

        // Create track in database
        const track = await prisma.track.create({
            data: {
                id: crypto.randomUUID(),
                title: metadata.common.title || file.name,
                artists: JSON.stringify([metadata.common.artist || 'Unknown']),
                tags: JSON.stringify(metadata.common.genre || []),
                fileSize: file.size,
                data: audioBuffer,
                ...(thumbnail && {
                    thumbnail,
                    thumbnailType
                })
            }
        });

        // Remove binary data from response
        const { data: _data, thumbnail: _thumbnail, ...safeTrack } = track;

        return NextResponse.json({
            success: true,
            track: safeTrack
        });

    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json(
            { error: 'Failed to process upload' },
            { status: 500 }
        );
    }
}
