'use client';

import Link from 'next/link';
import type { Room, Booking } from '@/types';

interface RoomListProps {
    rooms: Room[];
    bookings: Booking[];
    onRoomClick?: (room: Room) => void;
}

export default function RoomList({ rooms, bookings, onRoomClick }: RoomListProps) {
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

    const today = new Date().toISOString().split('T')[0];

    return (
        <div className="room-list">
            {rooms.map(room => {
                const status = getRoomStatus(room.id);

                return (
                    <Link
                        key={room.id}
                        href={`/rooms/${room.id}`}
                        className="room-item"
                        style={{ cursor: 'pointer', textDecoration: 'none', color: 'inherit' }}
                        onClick={() => onRoomClick?.(room)}
                    >
                        <div
                            className="room-indicator"
                            style={{
                                backgroundColor: room.color,
                                boxShadow: `0 0 10px ${room.color}44`
                            }}
                        />
                        <div className="room-info" style={{ flex: 1 }}>
                            <div className="flex justify-between items-center">
                                <div className="room-name">{room.name}</div>
                                <span
                                    className={`status-badge status-${status}`}
                                    style={{
                                        fontSize: '0.75rem',
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
                            </div>
                            {room.description && (
                                <div className="room-description">{room.description}</div>
                            )}
                        </div>
                    </Link>
                );
            })}
        </div>
    );
}
