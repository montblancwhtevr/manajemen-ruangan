import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getRoomById, updateRoom, deleteRoom } from '@/lib/db';

// GET /api/rooms/[id] - Get a single room
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const room = await getRoomById(id);

        if (!room) {
            return NextResponse.json(
                { success: false, error: 'Ruangan tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: room,
        });
    } catch (error) {
        console.error('Get room error:', error);
        return NextResponse.json(
            { success: false, error: 'Terjadi kesalahan' },
            { status: 500 }
        );
    }
}

// PUT /api/rooms/[id] - Update a room (admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();
        const { id } = await params;
        const body = await request.json();
        const { name, description, color } = body;

        const room = await updateRoom(id, { name, description, color });

        if (!room) {
            return NextResponse.json(
                { success: false, error: 'Ruangan tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: room,
        });
    } catch (error: any) {
        console.error('Update room error:', error);

        if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Terjadi kesalahan saat mengupdate ruangan' },
            { status: 500 }
        );
    }
}

// DELETE /api/rooms/[id] - Delete a room (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();
        const { id } = await params;
        const success = await deleteRoom(id);

        if (!success) {
            return NextResponse.json(
                { success: false, error: 'Ruangan tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
        });
    } catch (error: any) {
        console.error('Delete room error:', error);

        if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Terjadi kesalahan saat menghapus ruangan' },
            { status: 500 }
        );
    }
}
