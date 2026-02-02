'use client';

import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import RoomDetailInline from '@/components/RoomDetailInline';
import type { Room, Booking } from '@/types';

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
                            <RoomDetailInline room={room} />
                        )}
                    </div>
                );
            })}
        </div>
    );
}
