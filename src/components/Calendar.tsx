'use client';

import { useState } from 'react';
import { FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, isBefore, startOfToday } from 'date-fns';
import type { Room, Booking } from '@/types';

// Indonesian month names
const INDONESIAN_MONTHS = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

interface CalendarProps {
    rooms: Room[];
    bookings: Booking[];
    onDateClick?: (date: Date) => void;
}

export default function Calendar({ rooms, bookings, onDateClick }: CalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get first day of month (0 = Sunday, 1 = Monday, etc.)
    const firstDayOfMonth = monthStart.getDay();

    // Monday start (0 = Monday, 6 = Sunday) - adjust from JS getDay() which uses Sunday=0
    const startPadding = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

    const getBookingsOnDate = (date: Date) => {
        return bookings.filter(booking => {
            const bookingDate = new Date(booking.date);
            return isSameDay(bookingDate, date);
        });
    };

    const previousMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
    };

    const nextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
    };

    const dayHeaders = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

    return (
        <div className="calendar">
            <div className="calendar-header">
                <h3 style={{ margin: 0 }}>
                    {INDONESIAN_MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h3>
                <div className="flex gap-1">
                    <button onClick={previousMonth} className="btn btn-secondary btn-sm">
                        <FiChevronLeft />
                    </button>
                    <button onClick={nextMonth} className="btn btn-secondary btn-sm">
                        <FiChevronRight />
                    </button>
                </div>
            </div>

            <div className="calendar-grid">
                {dayHeaders.map(day => (
                    <div key={day} className="calendar-day-header">
                        {day}
                    </div>
                ))}

                {/* Empty cells for padding */}
                {Array.from({ length: startPadding }).map((_, i) => (
                    <div key={`padding-${i}`} className="calendar-day disabled" />
                ))}

                {/* Actual days */}
                {days.map(day => {
                    const isCurrentMonth = isSameMonth(day, currentMonth);
                    const isTodayDate = isToday(day);
                    const today = startOfToday();
                    const isPast = isBefore(day, today);
                    const bookingsOnDate = getBookingsOnDate(day);

                    return (
                        <div
                            key={day.toISOString()}
                            className={`calendar-day ${(!isCurrentMonth || isPast) ? 'disabled' : ''} ${isTodayDate ? 'today' : ''}`}
                            style={{ cursor: (!isCurrentMonth || isPast) ? 'default' : 'pointer' }}
                            onClick={() => {
                                if (isCurrentMonth && !isPast && onDateClick) {
                                    onDateClick(day);
                                }
                            }}
                        >
                            <span className="day-number">{format(day, 'd')}</span>
                            <div className="day-indicators">
                                {Array.from(new Set(bookingsOnDate.map(b => b.roomId))).map(roomId => {
                                    const room = rooms.find(r => r.id === roomId);
                                    return (
                                        <div
                                            key={roomId}
                                            className="day-indicator"
                                            style={{ backgroundColor: room?.color || 'var(--primary)' }}
                                            title={room?.name || 'Ruangan'}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
