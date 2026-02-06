'use client';

import { useState, useEffect } from 'react';
import { FiChevronDown, FiChevronUp, FiClock, FiCalendar, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import LoadingSpinner from '@/components/LoadingSpinner';
import { formatDateIndonesian } from '@/lib/utils';
import type { Room, Booking } from '@/types';

interface RoomDetailProps {
    room: Room;
}

function RoomDetail({ room }: RoomDetailProps) {
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
                                                        backgroundColor: booking.bookingType === 'prioritas' ? '#ef4444' :
                                                            booking.bookingType === 'eksternal' ? '#22c55e' : '#eab308',
                                                        borderRadius: '4px',
                                                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                                                    }}
                                                    title={booking.bookingType.charAt(0).toUpperCase() + booking.bookingType.slice(1)}
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

interface RoomListProps {
    rooms: Room[];
    bookings: Booking[];
}

export default function RoomList({ rooms, bookings }: RoomListProps) {
    const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null);

    const getRoomStatus = (roomId: string): 'available' | 'booked' | 'partial' => {
        const roomBookings = bookings.filter(b => b.roomId === roomId);

        if (roomBookings.length === 0) return 'available';

        // Check if there are bookings today
        const today = new Date().toISOString().split('T')[0];
        const todayBookings = roomBookings.filter(b => b.date === today);

        if (todayBookings.length > 0) return 'booked';

        return 'partial';
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'available':
                return 'Tersedia';
            case 'booked':
                return 'Dibooking';
            case 'partial':
                return 'Sudah ada jadwal';
            default:
                return 'Unknown';
        }
    };

    if (rooms.length === 0) {
        return (
            <div className="card text-center text-muted">
                <p>Tidak ada ruangan tersedia</p>
            </div>
        );
    }

    return (
        <div className="room-list">
            {rooms.map(room => {
                const status = getRoomStatus(room.id);
                const isExpanded = expandedRoomId === room.id;

                return (
                    <div
                        key={room.id}
                        className={`room-item-accordion ${isExpanded ? 'expanded' : ''}`}
                        style={{
                            background: 'var(--bg-primary)',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--border-color)',
                            marginBottom: 'var(--spacing-sm)',
                            overflow: 'hidden',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <div
                            className="room-item-header"
                            style={{
                                padding: 'var(--spacing-md)',
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 'var(--spacing-md)'
                            }}
                            onClick={() => setExpandedRoomId(isExpanded ? null : room.id)}
                        >
                            <div
                                className="room-indicator"
                                style={{
                                    width: '12px',
                                    height: '12px',
                                    borderRadius: '50%',
                                    backgroundColor: room.color,
                                    boxShadow: `0 0 10px ${room.color}44`
                                }}
                            />
                            <div className="room-info" style={{ flex: 1 }}>
                                <div className="flex justify-between items-center">
                                    <div className="room-name" style={{ fontWeight: 600 }}>{room.name}</div>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`status-badge status-${status}`}
                                            style={{
                                                fontSize: '0.7rem',
                                                padding: '2px 8px',
                                                borderRadius: '12px',
                                                background: status === 'available' ? 'var(--gray-100)' :
                                                    status === 'booked' ? 'var(--danger-light)' : 'var(--warning-light)',
                                                color: status === 'available' ? 'var(--gray-600)' :
                                                    status === 'booked' ? 'var(--danger)' : 'var(--warning)',
                                            }}
                                        >
                                            {getStatusText(status)}
                                        </span>
                                        {isExpanded ? <FiChevronUp className="text-muted" /> : <FiChevronDown className="text-muted" />}
                                    </div>
                                </div>
                                {room.description && (
                                    <div className="room-description" style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                                        {room.description}
                                    </div>
                                )}
                            </div>
                        </div>

                        {isExpanded && (
                            <RoomDetail room={room} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
