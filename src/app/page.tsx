'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import KetersediaanTab from '@/components/KetersediaanTab';
import AdminTab from '@/components/AdminTab';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { Room, Booking } from '@/types';

export default function HomePage() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'ketersediaan' | 'admin'>('ketersediaan');
    const [user, setUser] = useState<{ email: string; role: 'admin' | 'user' } | null>(null);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkAuth();
        fetchData();
    }, []);

    const checkAuth = async () => {
        try {
            const response = await fetch('/api/auth/me');
            const data = await response.json();

            if (data.success && data.data) {
                setUser(data.data);
            }
            // Users can view without logging in
        } catch (error) {
            console.error('Auth check failed:', error);
            // Continue without auth - users can still view
        }
    };

    const fetchData = async () => {
        setLoading(true);
        try {
            const [roomsRes, bookingsRes] = await Promise.all([
                fetch('/api/rooms'),
                fetch('/api/bookings'),
            ]);

            const roomsData = await roomsRes.json();
            const bookingsData = await bookingsRes.json();

            if (roomsData.success) {
                setRooms(roomsData.data || []);
            }

            if (bookingsData.success) {
                setBookings(bookingsData.data || []);
            }
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <LoadingSpinner fullPage label="Memuat..." />;
    }

    return (
        <div style={{ minHeight: '100vh', background: 'var(--bg-secondary)' }}>
            <Header user={user} />

            <main className="container" style={{ paddingTop: 'var(--spacing-xl)', paddingBottom: 'var(--spacing-xl)' }}>
                <div className="tabs">
                    <button
                        className={`tab ${activeTab === 'ketersediaan' ? 'active' : ''}`}
                        onClick={() => setActiveTab('ketersediaan')}
                    >
                        📅 Ketersediaan
                    </button>
                    {user?.role === 'admin' && (
                        <button
                            className={`tab ${activeTab === 'admin' ? 'active' : ''}`}
                            onClick={() => setActiveTab('admin')}
                        >
                            🔧 Admin
                        </button>
                    )}
                </div>

                {activeTab === 'ketersediaan' && (
                    <KetersediaanTab rooms={rooms} allBookings={bookings} />
                )}

                {activeTab === 'admin' && user?.role === 'admin' && (
                    <AdminTab rooms={rooms} bookings={bookings} onRefresh={fetchData} />
                )}
            </main>
        </div>
    );
}
