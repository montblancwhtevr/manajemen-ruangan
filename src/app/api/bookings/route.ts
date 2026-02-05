import { NextRequest, NextResponse } from 'next/server';
import { requireAuth, requireAdmin, getSession } from '@/lib/auth';
import { getAllBookings, getBookingsByFilters, createBooking } from '@/lib/db';

// GET /api/bookings - Get all bookings (public access with optional filters)
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const dateFrom = searchParams.get('dateFrom');
        const dateTo = searchParams.get('dateTo');
        const roomId = searchParams.get('roomId');

        let bookings;
        if (dateFrom || dateTo || roomId) {
            bookings = await getBookingsByFilters({
                dateFrom: dateFrom || undefined,
                dateTo: dateTo || undefined,
                roomId: roomId || undefined,
            });
        } else {
            bookings = await getAllBookings();
        }

        return NextResponse.json({
            success: true,
            data: bookings,
        });
    } catch (error) {
        console.error('Get bookings error:', error);
        return NextResponse.json(
            { success: false, error: 'Failed to fetch bookings' },
            { status: 500 }
        );
    }
}

// POST /api/bookings - Create a new booking (admin only)
export async function POST(request: NextRequest) {
    try {
        await requireAdmin();
        const session = await getSession();
        const body = await request.json();
        const { roomId, date, timeFrom, timeTo, purpose, isPriority } = body;

        if (!roomId || !date || !timeFrom || !timeTo || isPriority === undefined) {
            return NextResponse.json(
                { success: false, error: 'Semua field wajib harus diisi' },
                { status: 400 }
            );
        }

        const result = await createBooking({
            roomId,
            date,
            timeFrom,
            timeTo,
            purpose: purpose || '',
            isPriority: isPriority,
            createdBy: session?.email || 'unknown',
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
        console.error('Create booking error:', error);

        if (error.message === 'Unauthorized' || error.message === 'Admin access required') {
            return NextResponse.json(
                { success: false, error: error.message },
                { status: 403 }
            );
        }

        return NextResponse.json(
            { success: false, error: 'Terjadi kesalahan saat membuat booking' },
            { status: 500 }
        );
    }
}
