import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { getBookingById, updateBooking, deleteBooking } from '@/lib/db';

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

// PUT /api/bookings/[id] - Update a booking (admin only)
export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        await requireAdmin();
        const { id } = await params;
        const body = await request.json();

        const result = await updateBooking(id, {
            roomId: body.roomId,
            date: body.date,
            timeFrom: body.timeFrom,
            timeTo: body.timeTo,
            purpose: body.purpose,
            bookingType: body.bookingType,
        });

        if (!result.success) {
            return NextResponse.json(
                { success: false, error: result.error },
                { status: 400 }
            );
        }

        return NextResponse.json({
            success: true,
            data: result.booking,
        });
    } catch (error: any) {
        console.error('Update booking error:', error);

        if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Terjadi kesalahan saat mengupdate booking' },
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
