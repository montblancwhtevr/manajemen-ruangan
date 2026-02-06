'use client';

import { format } from 'date-fns';
import { FiX } from 'react-icons/fi';
import type { Room, Booking } from '@/types';
import { formatDate } from '@/lib/utils';

interface DateBookingDetailsProps {
    selectedDate: Date;
    rooms: Room[];
    bookings: Booking[];
    onClose: () => void;
}

export default function DateBookingDetails({ selectedDate, rooms, bookings, onClose }: DateBookingDetailsProps) {
    const dateStr = formatDate(selectedDate);
    const displayDate = format(selectedDate, 'd MMMM yyyy');

    // Filter bookings for the selected date
    // Note: booking.date might be an ISO datetime string, so we need to extract just the date part
    const bookingsOnDate = bookings.filter(booking => {
        // Extract date portion from ISO string or use as-is if already in YYYY-MM-DD format
        const bookingDateStr = booking.date.includes('T')
            ? formatDate(new Date(booking.date))
            : booking.date;
        return bookingDateStr === dateStr;
    });

    // Group bookings by room
    const bookingsByRoom = bookingsOnDate.reduce((acc, booking) => {
        if (!acc[booking.roomId]) {
            acc[booking.roomId] = [];
        }
        acc[booking.roomId].push(booking);
        return acc;
    }, {} as Record<string, Booking[]>);

    return (
        <div className="card" style={{ marginBottom: 'var(--spacing-lg)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-md)' }}>
                <h3 style={{ margin: 0 }}>
                    📅 Detail Booking - {displayDate}
                </h3>
                <button
                    onClick={onClose}
                    className="btn btn-secondary btn-sm"
                    style={{ padding: 'var(--spacing-xs)' }}
                >
                    <FiX />
                </button>
            </div>

            {bookingsOnDate.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    Tidak ada booking pada tanggal ini.
                </p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-md)' }}>
                    {Object.entries(bookingsByRoom).map(([roomId, roomBookings]) => {
                        const room = rooms.find(r => r.id === roomId);
                        return (
                            <div
                                key={roomId}
                                style={{
                                    padding: 'var(--spacing-md)',
                                    background: 'var(--bg-secondary)',
                                    borderRadius: 'var(--radius-md)',
                                    borderLeft: `4px solid ${room?.color || 'var(--primary)'}`
                                }}
                            >
                                <h4 style={{
                                    margin: '0 0 var(--spacing-sm) 0',
                                    color: room?.color || 'var(--primary)'
                                }}>
                                    {room?.name || 'Ruangan'}
                                </h4>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                                    {roomBookings.map(booking => (
                                        <div
                                            key={booking.id}
                                            style={{
                                                padding: 'var(--spacing-sm)',
                                                background: 'var(--bg-primary)',
                                                borderRadius: 'var(--radius-sm)',
                                                fontSize: '0.9rem',
                                                borderLeft: `4px solid ${booking.bookingType === 'prioritas' ? '#ef4444' :
                                                        booking.bookingType === 'eksternal' ? '#22c55e' : '#eab308'
                                                    }`,
                                                boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
                                            }}
                                        >
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                                                <strong>{booking.purpose}</strong>
                                                <span style={{ color: 'var(--text-secondary)' }}>
                                                    {booking.timeFrom} - {booking.timeTo}
                                                </span>
                                            </div>
                                            {/* <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                                Dibuat oleh: {booking.createdBy}
                                            </div> */}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
