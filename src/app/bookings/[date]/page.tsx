'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiClock, FiCalendar, FiInfo } from 'react-icons/fi';
import Header from '@/components/Header';
import { formatDateIndonesian } from '@/lib/utils';
import type { Room, Booking } from '@/types';

export default function BookingsByDatePage() {
    const router = useRouter();
    const params = useParams();
    const dateStr = params.date as string;

    const [rooms, setRooms] = useState<Room[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [user, setUser] = useState<{ email: string; role: 'admin' | 'user' } | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Check auth
                const authRes = await fetch('/api/auth/me');
                const authData = await authRes.json();
                if (authData.success) setUser(authData.data);

                // Fetch rooms
                const roomsRes = await fetch('/api/rooms');
                const roomsData = await roomsRes.json();
                if (roomsData.success) setRooms(roomsData.data || []);

                // Fetch bookings for this date
                const bookingsRes = await fetch(`/api/bookings?dateFrom=${dateStr}&dateTo=${dateStr}`);
                const bookingsData = await bookingsRes.json();
                if (bookingsData.success) {
                    setBookings(bookingsData.data || []);
                }
            } catch (error) {
                console.error('Failed to fetch data for date:', error);
            } finally {
                setLoading(false);
            }
        };

        if (dateStr) fetchData();
    }, [dateStr]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center" style={{ minHeight: '100vh' }}>
                <div className="loader" />
                <p className="mt-2 text-muted">Memuat data booking...</p>
                <style jsx>{`
                    .loader {
                        width: 48px;
                        height: 48px;
                        border: 4px solid var(--gray-200);
                        border-top-color: var(--primary);
                        borderRadius: 50%;
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                `}</style>
            </div>
        );
    }

    const formattedDate = dateStr ? formatDateIndonesian(dateStr) : '';

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
            <Header user={user} />

            <main className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
                <Link href="/" className="btn btn-secondary mb-4" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <FiArrowLeft /> Kembali ke Dashboard
                </Link>

                <div className="card mb-4" style={{ borderLeft: '4px solid var(--primary)' }}>
                    <div className="flex items-center gap-3">
                        <FiCalendar size={24} className="text-primary" />
                        <h1 style={{ margin: 0 }}>Jadwal Booking: {formattedDate}</h1>
                    </div>
                </div>

                <div className="grid gap-3">
                    {rooms.map(room => {
                        const roomBookings = bookings.filter(b => b.roomId === room.id)
                            .sort((a, b) => a.timeFrom.localeCompare(b.timeFrom));

                        return (
                            <div key={room.id} className="card">
                                <div className="flex justify-between items-start mb-3">
                                    <div className="flex items-center gap-3">
                                        <div
                                            style={{
                                                width: '16px',
                                                height: '16px',
                                                borderRadius: '50%',
                                                backgroundColor: room.color
                                            }}
                                        />
                                        <h3 style={{ margin: 0 }}>{room.name}</h3>
                                    </div>
                                    <Link href={`/rooms/${room.id}`} className="btn btn-secondary btn-sm">
                                        Lihat Ruangan
                                    </Link>
                                </div>

                                {roomBookings.length === 0 ? (
                                    <p className="text-success" style={{ margin: 0, fontSize: '0.875rem' }}>
                                        ✅ Tidak ada booking. Ruangan tersedia sepanjang hari.
                                    </p>
                                ) : (
                                    <div style={{ overflowX: 'auto' }}>
                                        <table className="table" style={{ marginTop: '10px' }}>
                                            <thead>
                                                <tr>
                                                    <th style={{ width: '150px' }}>Waktu</th>
                                                    <th>Keperluan</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {roomBookings.map(booking => (
                                                    <tr key={booking.id}>
                                                        <td>
                                                            <div className="flex items-center gap-2">
                                                                <FiClock className="text-muted" />
                                                                {booking.timeFrom} - {booking.timeTo}
                                                            </div>
                                                        </td>
                                                        <td>
                                                            <div>
                                                                <strong>{booking.purpose || '-'}</strong>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}
