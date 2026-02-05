'use client';

import { useState } from 'react';
import { FiSearch } from 'react-icons/fi';
import DateRangePicker from './DateRangePicker';
import RoomSelector from './RoomSelector';
import Calendar from './Calendar';
import RoomList from './RoomList';
import DateBookingDetails from './DateBookingDetails';
import type { Room, Booking } from '@/types';
import { formatDate } from '@/lib/utils';

interface KetersediaanTabProps {
    rooms: Room[];
    allBookings: Booking[];
}

export default function KetersediaanTab({ rooms, allBookings }: KetersediaanTabProps) {
    const [selectedRoomId, setSelectedRoomId] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [filteredBookings, setFilteredBookings] = useState<Booking[]>(allBookings);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const handleSearch = (from: string, to: string) => {
        setDateFrom(from);
        setDateTo(to);
        filterBookings(from, to, selectedRoomId);
    };

    const handleRoomChange = (roomId: string) => {
        setSelectedRoomId(roomId);
        filterBookings(dateFrom, dateTo, roomId);
    };


    const filterBookings = (from: string, to: string, roomId: string) => {
        const today = formatDate(new Date());
        let filtered = allBookings.filter(booking => booking.date >= today);

        if (from && to) {
            filtered = filtered.filter(booking => {
                return booking.date >= from && booking.date <= to;
            });
        }

        if (roomId) {
            filtered = filtered.filter(booking => booking.roomId === roomId);
        }

        setFilteredBookings(filtered);
    };

    const displayedRooms = selectedRoomId
        ? rooms.filter(r => r.id === selectedRoomId)
        : rooms;

    return (
        <div>
            <div className="grid grid-2 gap-3">
                <div>
                    <h3 className="mb-2">Kalender Booking</h3>
                    <Calendar
                        rooms={rooms}
                        bookings={filteredBookings}
                        onDateClick={(date) => setSelectedDate(date)}
                    />
                </div>

                <div>
                    {selectedDate && (
                        <DateBookingDetails
                            selectedDate={selectedDate}
                            rooms={rooms}
                            bookings={allBookings}
                            onClose={() => setSelectedDate(null)}
                        />
                    )}
                    <h3 className="mb-2">Daftar Ruangan</h3>
                    <RoomList
                        rooms={displayedRooms}
                        bookings={filteredBookings}
                    />
                </div>
            </div>
        </div>
    );
}
