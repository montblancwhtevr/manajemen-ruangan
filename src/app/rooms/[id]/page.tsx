'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { FiArrowLeft, FiClock, FiCalendar, FiInfo, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Header from '@/components/Header';
import { formatDateIndonesian } from '@/lib/utils';
import type { Room, Booking } from '@/types';

export default function RoomDetailPage() {
    const router = useRouter();
    const params = useParams();
    const roomId = params.id as string;

    const [room, setRoom] = useState<Room | null>(null);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [user, setUser] = useState<{ email: string; role: 'admin' | 'user' } | null>(null);
    const [loading, setLoading] = useState(true);

    // Search and Pagination state
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                // Check auth
                const authRes = await fetch('/api/auth/me');
                const authData = await authRes.json();
                if (authData.success) setUser(authData.data);

                // Fetch room
                const roomRes = await fetch(`/api/rooms/${roomId}`);
                const roomData = await roomRes.json();
                if (roomData.success) setRoom(roomData.data);

                // Fetch bookings for this room
                const bookingsRes = await fetch(`/api/bookings?roomId=${roomId}`);
                const bookingsData = await bookingsRes.json();
                if (bookingsData.success) {
                    // Sort bookings by date and time
                    const today = new Date().toISOString().split('T')[0];
                    const filtered = (bookingsData.data || []).filter((b: Booking) => b.date >= today);
                    const sorted = filtered.sort((a: Booking, b: Booking) => {
                        if (a.date !== b.date) return a.date.localeCompare(b.date);
                        return a.timeFrom.localeCompare(b.timeFrom);
                    });
                    setBookings(sorted);
                }
            } catch (error) {
                console.error('Failed to fetch room details:', error);
            } finally {
                setLoading(false);
            }
        };

        if (roomId) fetchData();
    }, [roomId]);

    // Filter and Paginate Bookings
    const filteredBookings = bookings.filter(b =>
        b.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formatDateIndonesian(b.date).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const paginatedBookings = filteredBookings.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center" style={{ minHeight: '100vh' }}>
                <div className="loader" />
                <p className="mt-2 text-muted">Memuat detail ruangan...</p>
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

    if (!room) {
        return (
            <div className="container" style={{ paddingTop: 'var(--spacing-xl)' }}>
                <div className="card text-center">
                    <h2 className="text-danger">Ruangan Tidak Ditemukan</h2>
                    <p className="mb-4">Maaf, ruangan yang Anda cari tidak tersedia atau telah dihapus.</p>
                    <Link href="/" className="btn btn-primary">
                        <FiArrowLeft /> Kembali ke Dashboard
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
            <Header user={user} />

            <main className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
                <Link href="/" className="btn btn-secondary mb-4" style={{ display: 'inline-flex', alignItems: 'center' }}>
                    <FiArrowLeft /> Kembali
                </Link>

                <div className="card mb-4">
                    <div className="flex items-center gap-3 mb-3">
                        <div
                            style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                backgroundColor: room.color,
                                boxShadow: `0 0 10px ${room.color}44`
                            }}
                        />
                        <h1 style={{ margin: 0 }}>{room.name}</h1>
                    </div>

                    <div className="grid grid-2 gap-3 mt-3">
                        <div className="flex gap-2 items-start">
                            <FiInfo style={{ marginTop: '4px', color: 'var(--primary)' }} />
                            <div>
                                <label className="label" style={{ marginBottom: '2px' }}>Deskripsi</label>
                                <p style={{ margin: 0 }}>{room.description || 'Tidak ada deskripsi tersedia.'}</p>
                            </div>
                        </div>
                        <div className="flex gap-2 items-start">
                            <FiClock style={{ marginTop: '4px', color: 'var(--primary)' }} />
                            <div>
                                <label className="label" style={{ marginBottom: '2px' }}>Status Saat Ini</label>
                                <p style={{ margin: 0 }}>
                                    {bookings.some(b => b.date === new Date().toISOString().split('T')[0])
                                        ? <span className="text-danger font-bold">Terpakai Hari Ini</span>
                                        : <span className="text-success font-bold">Tersedia Hari Ini</span>
                                    }
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                        <h3 style={{ margin: 0 }}>Jadwal Booking</h3>
                        <div className="relative" style={{ width: '100%', maxWidth: '300px' }}>
                            <FiSearch className="absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                className="input"
                                style={{ paddingLeft: '35px' }}
                                placeholder="Cari tanggal atau keperluan..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                    </div>

                    {filteredBookings.length === 0 ? (
                        <p className="text-muted text-center py-4">
                            {bookings.length === 0 ? 'Belum ada jadwal booking untuk ruangan ini.' : 'Jadwal tidak ditemukan.'}
                        </p>
                    ) : (
                        <>
                            <div style={{ overflowX: 'auto' }}>
                                <table className="table">
                                    <thead>
                                        <tr>
                                            <th>Tanggal</th>
                                            <th>Waktu</th>
                                            <th>Keperluan</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {paginatedBookings.map(booking => {
                                            const isToday = booking.date === new Date().toISOString().split('T')[0];
                                            return (
                                                <tr key={booking.id} style={isToday ? { background: 'rgba(0, 102, 255, 0.05)' } : {}}>
                                                    <td>
                                                        <div className="flex items-center gap-2">
                                                            <FiCalendar className="text-muted" />
                                                            {formatDateIndonesian(booking.date)}
                                                            {isToday && <span className="admin-badge" style={{ fontSize: '0.65rem' }}>HARI INI</span>}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="flex items-center gap-2">
                                                            <FiClock className="text-muted" />
                                                            {booking.timeFrom} - {booking.timeTo}
                                                        </div>
                                                    </td>
                                                    <td>{booking.purpose}</td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>

                            {totalPages > 1 && (
                                <div className="flex justify-between items-center mt-4">
                                    <span className="text-sm text-muted">
                                        Halaman {currentPage} dari {totalPages} ({filteredBookings.length} data)
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            disabled={currentPage === 1}
                                            onClick={() => setCurrentPage(p => p - 1)}
                                        >
                                            <FiChevronLeft />
                                        </button>
                                        <button
                                            className="btn btn-secondary btn-sm"
                                            disabled={currentPage === totalPages}
                                            onClick={() => setCurrentPage(p => p + 1)}
                                        >
                                            <FiChevronRight />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </div>
    );
}
