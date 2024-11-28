import { NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function GET() {
    try {
        const tracks = await prisma.track.findMany();
        return NextResponse.json(tracks);
    } catch (error) {
        console.error('Failed to fetch tracks:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tracks' },
            { status: 500 }
        );
    }
}