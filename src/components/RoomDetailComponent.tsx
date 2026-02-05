'use client';

import { useState, useEffect } from 'react';
import { FiClock, FiCalendar, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatDateIndonesian } from '@/lib/utils';
import type { Room, Booking } from '@/types';

interface RoomDetailProps {
    room: Room;
}

export default function RoomDetail({ room }: RoomDetailProps) {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    useEffect(() => {
        const fetchBookings = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/bookings?roomId=${room.id}`);
                const data = await response.json();
                if (data.success) {
                    const today = new Date().toISOString().split('T')[0];
                    const filtered = (data.data || []).filter((b: Booking) => b.date >= today);
                    const sorted = filtered.sort((a: Booking, b: Booking) => {
                        if (a.date !== b.date) return a.date.localeCompare(b.date);
                        return a.timeFrom.localeCompare(b.timeFrom);
                    });
                    setBookings(sorted);
                }
            } catch (error) {
                console.error('Failed to fetch bookings:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchBookings();
    }, [room.id]);

    const filteredBookings = bookings.filter(b =>
        b.purpose.toLowerCase().includes(searchQuery.toLowerCase()) ||
        formatDateIndonesian(b.date).toLowerCase().includes(searchQuery.toLowerCase())
    );

    const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const paginatedBookings = filteredBookings.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="animate-fade-in" style={{ padding: 'var(--spacing-md)', borderTop: '1px solid var(--border-color)', marginTop: 'var(--spacing-xs)' }}>
            <div className="flex flex-col gap-2 mb-3">
                <div className="flex items-center gap-2">
                    <FiClock className="text-primary" />
                    <span className="font-bold">Jadwal Mendatang</span>
                </div>
                <div className="flex items-center gap-2" style={{ width: '100%', maxWidth: '250px' }}>
                    <FiSearch className="text-muted" style={{ flexShrink: 0 }} />
                    <input
                        type="text"
                        className="input input-sm"
                        placeholder="Cari..."
                        value={searchQuery}
                        onChange={(e) => {
                            setSearchQuery(e.target.value);
                            setCurrentPage(1);
                        }}
                    />
                </div>
            </div>

            {loading ? (
                <div className="py-4 text-center">
                    <LoadingSpinner size="sm" />
                </div>
            ) : filteredBookings.length === 0 ? (
                <p className="text-muted text-center py-4 text-sm">
                    {bookings.length === 0 ? 'Belum ada jadwal booking mendatang.' : 'Jadwal tidak ditemukan.'}
                </p>
            ) : (
                <>
                    <div style={{ overflowX: 'auto' }}>
                        <table className="table table-sm" style={{ fontSize: '0.875rem' }}>
                            <thead>
                                <tr>
                                    <th>Tanggal</th>
                                    <th>Waktu</th>
                                    <th>Keperluan</th>
                                    <th style={{ width: '60px', textAlign: 'center' }}>Prioritas</th>
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
                                                    {isToday && <span className="admin-badge" style={{ fontSize: '0.6rem', padding: '1px 4px' }}>HARI INI</span>}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    <FiClock className="text-muted" />
                                                    {booking.timeFrom} - {booking.timeTo}
                                                </div>
                                            </td>
                                            <td>{booking.purpose}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div
                                                    style={{
                                                        display: 'inline-block',
                                                        width: '20px',
                                                        height: '20px',
                                                        backgroundColor: booking.isPriority ? '#22c55e' : '#eab308',
                                                        borderRadius: '4px',
                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                                    }}
                                                    title={booking.isPriority ? 'Prioritas' : 'Non-Prioritas'}
                                                ></div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-between items-center mt-3">
                            <span className="text-xs text-muted">
                                Halaman {currentPage} dari {totalPages}
                            </span>
                            <div className="flex gap-1">
                                <button
                                    className="btn btn-secondary btn-xs"
                                    disabled={currentPage === 1}
                                    onClick={(e) => { e.stopPropagation(); setCurrentPage(p => p - 1); }}
                                >
                                    <FiChevronLeft />
                                </button>
                                <button
                                    className="btn btn-secondary btn-xs"
                                    disabled={currentPage === totalPages}
                                    onClick={(e) => { e.stopPropagation(); setCurrentPage(p => p + 1); }}
                                >
                                    <FiChevronRight />
                                </button>
                            </div>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
