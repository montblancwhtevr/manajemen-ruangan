import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getBookingById, deleteBooking } from '@/lib/db';

// GET /api/bookings/[id] - Get a single booking
export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const booking = await getBookingById(id);

        if (!booking) {
            return NextResponse.json(
                { success: false, error: 'Booking tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
            data: booking,
        });
    } catch (error) {
        console.error('Get booking error:', error);
        return NextResponse.json(
            { success: false, error: 'Terjadi kesalahan' },
            { status: 500 }
        );
    }
}

// DELETE /api/bookings/[id] - Delete a booking (admin only)
export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();
        const { id } = await params;
        const success = await deleteBooking(id);

        if (!success) {
            return NextResponse.json(
                { success: false, error: 'Booking tidak ditemukan' },
                { status: 404 }
            );
        }

        return NextResponse.json({
            success: true,
        });
    } catch (error: any) {
        console.error('Delete booking error:', error);

        if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Terjadi kesalahan saat menghapus booking' },
            { status: 500 }
        );
    }
}
