import { type NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/app/lib/prisma';

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        await prisma.track.delete({
            where: { id: params.id }
        });
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete error:', error);
        return NextResponse.json(
            { error: 'Failed to delete track' },
            { status: 500 }
        );
    }
}