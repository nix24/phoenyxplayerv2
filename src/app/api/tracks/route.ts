import { type NextRequest, NextResponse } from 'next/server';
import { getTracks } from '@/app/lib/actions';

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const page = Number.parseInt(searchParams.get('page') || '1');
        const data = await getTracks(page);
        return NextResponse.json(data);
    } catch (error) {
        console.error('Failed to fetch tracks:', error);
        return NextResponse.json(
            { error: 'Failed to fetch tracks' },
            { status: 500 }
        );
    }
}