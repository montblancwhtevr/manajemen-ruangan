import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAdmin } from '@/lib/auth';
import { getAllRooms, createRoom } from '@/lib/db';

// GET /api/rooms - Get all rooms (public access)
export async function GET() {
    try {
        const rooms = await getAllRooms();

        return NextResponse.json({
            success: true,
            data: rooms,
        });
    } catch (error) {
        console.error('Get rooms error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch rooms' },
            { status: 500 }
        );
    }
}

// POST /api/rooms - Create a new room (admin only)
export async function POST(request: NextRequest) {
    try {
        await requireAdmin();
        const body = await request.json();
        const { name, description, color } = body;

        if (!name) {
            return NextResponse.json(
                { success: false, error: 'Nama ruangan harus diisi' },
                { status: 400 }
            );
        }

        const room = await createRoom({ name, description, color });

        return NextResponse.json({
            success: true,
            data: room,
        });
    } catch (error: any) {
        console.error('Create room error:', error);

        if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Terjadi kesalahan saat membuat ruangan' },
            { status: 500 }
        );
    }
}
