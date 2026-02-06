'use client';

import { useState, useRef } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiSave, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { formatDateIndonesian, getBookingTypeColor, PRIORITY_COLORS } from '@/lib/utils';
import type { Room, Booking } from '@/types';
import Modal, { ModalType } from './Modal';
import LoadingSpinner from './LoadingSpinner';

interface AdminTabProps {
    rooms: Room[];
    bookings: Booking[];
    onRefresh: () => void;
}

export default function AdminTab({ rooms, bookings, onRefresh }: AdminTabProps) {
    // Booking form state
    const [newBooking, setNewBooking] = useState({
        roomId: '',
        date: '',
        timeFrom: '',
        timeTo: '',
        purpose: '',
        bookingType: 'internal' as 'prioritas' | 'internal' | 'eksternal',
    });

    // Room form state
    const [newRoom, setNewRoom] = useState({
        name: '',
        description: '',
        color: '#3B82F6',
    });

    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
    const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
    const [loading, setLoading] = useState(false);

    // Modal state
    const [modal, setModal] = useState<{
        isOpen: boolean;
        type: ModalType;
        title: string;
        message: string;
        onConfirm: () => void;
    }>({
        isOpen: false,
        type: 'info',
        title: '',
        message: '',
        onConfirm: () => { },
    });

    const showModal = (type: ModalType, title: string, message: string, onConfirm = () => { }) => {
        setModal({
            isOpen: true,
            type,
            title,
            message,
            onConfirm: () => {
                onConfirm();
                setModal(prev => ({ ...prev, isOpen: false }));
            }
        });
    };

    // Search and Pagination state
    const [bookingSearch, setBookingSearch] = useState('');
    const [roomSearch, setRoomSearch] = useState('');
    const [bookingPage, setBookingPage] = useState(1);
    const [roomPage, setRoomPage] = useState(1);
    const [showPastBookings, setShowPastBookings] = useState(false);
    const itemsPerPage = 10;

    const datePickerRef = useRef<any>(null);
    const timeFromPickerRef = useRef<any>(null);
    const timeToPickerRef = useRef<any>(null);
    const bookingFormRef = useRef<HTMLDivElement>(null);

    // Create Booking
    const handleCreateBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newBooking),
            });

            const data = await response.json();

            if (data.success) {
                showModal('success', 'Berhasil', 'Booking berhasil dibuat!');
                setNewBooking({
                    roomId: '',
                    date: '',
                    timeFrom: '',
                    timeTo: '',
                    purpose: '',
                    bookingType: 'internal',
                });
                onRefresh();
            } else {
                showModal('error', 'Gagal', data.error || 'Gagal membuat booking');
            }
        } catch (error) {
            showModal('error', 'Terjadi Kesalahan', String(error));
        } finally {
            setLoading(false);
        }
    };

    // Update Booking
    const handleUpdateBooking = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingBooking) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/bookings/${editingBooking.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    roomId: editingBooking.roomId,
                    date: editingBooking.date,
                    timeFrom: editingBooking.timeFrom,
                    timeTo: editingBooking.timeTo,
                    purpose: editingBooking.purpose,
                    bookingType: editingBooking.bookingType,
                }),
            });

            const data = await response.json();

            if (data.success) {
                showModal('success', 'Berhasil', 'Booking berhasil diupdate!');
                setEditingBooking(null);
                onRefresh();
            } else {
                showModal('error', 'Gagal', data.error || 'Gagal mengupdate booking');
            }
        } catch (error) {
            showModal('error', 'Terjadi Kesalahan', String(error));
        } finally {
            setLoading(false);
        }
    };

    // Delete Booking
    const handleDeleteBooking = (bookingId: string) => {
        showModal(
            'confirm',
            'Konfirmasi Batal',
            'Apakah Anda yakin ingin membatalkan booking ini?',
            async () => {
                setLoading(true);
                try {
                    const response = await fetch(`/api/bookings/${bookingId}`, {
                        method: 'DELETE',
                    });

                    const data = await response.json();

                    if (data.success) {
                        showModal('success', 'Berhasil', 'Booking berhasil dibatalkan!');
                        onRefresh();
                    } else {
                        showModal('error', 'Gagal', data.error || 'Gagal membatalkan booking');
                    }
                } catch (error) {
                    showModal('error', 'Terjadi Kesalahan', String(error));
                } finally {
                    setLoading(false);
                }
            }
        );
    };

    // Create Room
    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await fetch('/api/rooms', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newRoom),
            });

            const data = await response.json();

            if (data.success) {
                showModal('success', 'Berhasil', 'Ruangan berhasil ditambahkan!');
                setNewRoom({ name: '', description: '', color: '#3B82F6' });
                onRefresh();
            } else {
                showModal('error', 'Gagal', data.error || 'Gagal menambahkan ruangan');
            }
        } catch (error) {
            showModal('error', 'Terjadi Kesalahan', String(error));
        } finally {
            setLoading(false);
        }
    };

    // Update Room
    const handleUpdateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingRoom) return;

        setLoading(true);
        try {
            const response = await fetch(`/api/rooms/${editingRoom.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editingRoom.name,
                    description: editingRoom.description,
                    color: editingRoom.color,
                }),
            });

            const data = await response.json();

            if (data.success) {
                showModal('success', 'Berhasil', 'Ruangan berhasil diupdate!');
                setEditingRoom(null);
                onRefresh();
            } else {
                showModal('error', 'Gagal', data.error || 'Gagal mengupdate ruangan');
            }
        } catch (error) {
            showModal('error', 'Terjadi Kesalahan', String(error));
        } finally {
            setLoading(false);
        }
    };

    // Delete Room
    const handleDeleteRoom = (roomId: string) => {
        showModal(
            'confirm',
            'Konfirmasi Hapus',
            'Apakah Anda yakin ingin menghapus ruangan ini?',
            async () => {
                setLoading(true);
                try {
                    const response = await fetch(`/api/rooms/${roomId}`, {
                        method: 'DELETE',
                    });

                    const data = await response.json();

                    if (data.success) {
                        showModal('success', 'Berhasil', 'Ruangan berhasil dihapus!');
                        onRefresh();
                    } else {
                        showModal('error', 'Gagal', data.error || 'Gagal menghapus ruangan');
                    }
                } catch (error) {
                    showModal('error', 'Terjadi Kesalahan', String(error));
                } finally {
                    setLoading(false);
                }
            }
        );
    };

    // Filter and Paginate Bookings
    const today = new Date().toISOString().split('T')[0];
    const filteredBookings = bookings.filter(b => {
        // Filter by search term
        const matchesSearch = (b.roomName || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
            (b.purpose || '').toLowerCase().includes(bookingSearch.toLowerCase());

        // Filter by date (hide past bookings unless toggle is on)
        const bookingDate = b.date.includes('T') ? b.date.split('T')[0] : b.date;
        const isFuture = bookingDate >= today;
        const matchesDateFilter = showPastBookings || isFuture;

        return matchesSearch && matchesDateFilter;
    });

    const totalBookingPages = Math.ceil(filteredBookings.length / itemsPerPage);
    const paginatedBookings = filteredBookings.slice(
        (bookingPage - 1) * itemsPerPage,
        bookingPage * itemsPerPage
    );

    // Filter and Paginate Rooms
    const filteredRooms = rooms.filter(r =>
        r.name.toLowerCase().includes(roomSearch.toLowerCase()) ||
        (r.description || '').toLowerCase().includes(roomSearch.toLowerCase())
    );

    const totalRoomPages = Math.ceil(filteredRooms.length / itemsPerPage);
    const paginatedRooms = filteredRooms.slice(
        (roomPage - 1) * itemsPerPage,
        roomPage * itemsPerPage
    );

    return (
        <div className="grid gap-3">
            {/* Create/Edit Booking Form */}
            <div className="card" ref={bookingFormRef}>
                <h3 className="mb-3">{editingBooking ? 'Edit Booking' : 'Buat Booking Baru'}</h3>
                <form onSubmit={editingBooking ? handleUpdateBooking : handleCreateBooking}>
                    <div className="grid grid-2 gap-2">
                        <div className="form-group">
                            <label className="label">Ruangan *</label>
                            <select
                                className="select"
                                value={editingBooking ? editingBooking.roomId : newBooking.roomId}
                                onChange={(e) => {
                                    if (editingBooking) {
                                        setEditingBooking({ ...editingBooking, roomId: e.target.value });
                                    } else {
                                        setNewBooking({ ...newBooking, roomId: e.target.value });
                                    }
                                }}
                                required
                            >
                                <option value="">Pilih Ruangan</option>
                                {rooms.map(room => (
                                    <option key={room.id} value={room.id}>{room.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="label">Tanggal *</label>
                            <Flatpickr
                                ref={datePickerRef}
                                options={{
                                    dateFormat: 'Y-m-d',
                                    minDate: 'today',
                                }}
                                value={editingBooking ? editingBooking.date : newBooking.date}
                                onChange={(dates) => {
                                    if (dates[0]) {
                                        const d = dates[0];
                                        const year = d.getFullYear();
                                        const month = (d.getMonth() + 1).toString().padStart(2, '0');
                                        const day = d.getDate().toString().padStart(2, '0');
                                        const formatted = `${year}-${month}-${day}`;

                                        if (editingBooking) {
                                            setEditingBooking({ ...editingBooking, date: formatted });
                                        } else {
                                            setNewBooking({ ...newBooking, date: formatted });
                                        }
                                    }
                                }}
                                className="input"
                                placeholder="Pilih tanggal"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="label">Waktu Mulai *</label>
                            <Flatpickr
                                ref={timeFromPickerRef}
                                options={{
                                    enableTime: true,
                                    noCalendar: true,
                                    dateFormat: 'H:i',
                                    time_24hr: true,
                                    disableMobile: true,
                                }}
                                value={editingBooking ? editingBooking.timeFrom : newBooking.timeFrom}
                                onChange={(dates) => {
                                    if (dates[0]) {
                                        const hours = dates[0].getHours().toString().padStart(2, '0');
                                        const minutes = dates[0].getMinutes().toString().padStart(2, '0');
                                        const time = `${hours}:${minutes}`;
                                        if (editingBooking) {
                                            setEditingBooking({ ...editingBooking, timeFrom: time });
                                        } else {
                                            setNewBooking({ ...newBooking, timeFrom: time });
                                        }
                                    }
                                }}
                                className="input"
                                placeholder="HH:mm"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="label">Waktu Selesai *</label>
                            <Flatpickr
                                ref={timeToPickerRef}
                                options={{
                                    enableTime: true,
                                    noCalendar: true,
                                    dateFormat: 'H:i',
                                    time_24hr: true,
                                    disableMobile: true,
                                }}
                                value={editingBooking ? editingBooking.timeTo : newBooking.timeTo}
                                onChange={(dates) => {
                                    if (dates[0]) {
                                        const hours = dates[0].getHours().toString().padStart(2, '0');
                                        const minutes = dates[0].getMinutes().toString().padStart(2, '0');
                                        const time = `${hours}:${minutes}`;
                                        if (editingBooking) {
                                            setEditingBooking({ ...editingBooking, timeTo: time });
                                        } else {
                                            setNewBooking({ ...newBooking, timeTo: time });
                                        }
                                    }
                                }}
                                className="input"
                                placeholder="HH:mm"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Tipe Booking *</label>
                        <div style={{ display: 'flex', gap: '15px', marginTop: '8px', flexWrap: 'wrap' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="bookingType"
                                    checked={editingBooking ? editingBooking.bookingType === 'prioritas' : newBooking.bookingType === 'prioritas'}
                                    onChange={() => {
                                        if (editingBooking) {
                                            setEditingBooking({ ...editingBooking, bookingType: 'prioritas' });
                                        } else {
                                            setNewBooking({ ...newBooking, bookingType: 'prioritas' });
                                        }
                                    }}
                                    style={{ cursor: 'pointer' }}
                                    required
                                />
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        width: '16px',
                                        height: '16px',
                                        backgroundColor: PRIORITY_COLORS.prioritas,
                                        borderRadius: '3px'
                                    }}></span>
                                    Prioritas
                                </span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="bookingType"
                                    checked={editingBooking ? editingBooking.bookingType === 'internal' : newBooking.bookingType === 'internal'}
                                    onChange={() => {
                                        if (editingBooking) {
                                            setEditingBooking({ ...editingBooking, bookingType: 'internal' });
                                        } else {
                                            setNewBooking({ ...newBooking, bookingType: 'internal' });
                                        }
                                    }}
                                    style={{ cursor: 'pointer' }}
                                    required
                                />
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        width: '16px',
                                        height: '16px',
                                        backgroundColor: PRIORITY_COLORS.internal,
                                        borderRadius: '3px'
                                    }}></span>
                                    Internal
                                </span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                                <input
                                    type="radio"
                                    name="bookingType"
                                    checked={editingBooking ? editingBooking.bookingType === 'eksternal' : newBooking.bookingType === 'eksternal'}
                                    onChange={() => {
                                        if (editingBooking) {
                                            setEditingBooking({ ...editingBooking, bookingType: 'eksternal' });
                                        } else {
                                            setNewBooking({ ...newBooking, bookingType: 'eksternal' });
                                        }
                                    }}
                                    style={{ cursor: 'pointer' }}
                                    required
                                />
                                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{
                                        display: 'inline-block',
                                        width: '16px',
                                        height: '16px',
                                        backgroundColor: PRIORITY_COLORS.eksternal,
                                        borderRadius: '3px'
                                    }}></span>
                                    Eksternal
                                </span>
                            </label>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Keperluan</label>
                        <textarea
                            className="textarea"
                            rows={3}
                            value={editingBooking ? editingBooking.purpose : newBooking.purpose}
                            onChange={(e) => {
                                if (editingBooking) {
                                    setEditingBooking({ ...editingBooking, purpose: e.target.value });
                                } else {
                                    setNewBooking({ ...newBooking, purpose: e.target.value });
                                }
                            }}
                            placeholder="Masukkan keperluan booking (opsional)"
                        />
                    </div>

                    <div className="flex gap-2">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {loading ? <LoadingSpinner size="sm" /> : (editingBooking ? <FiSave /> : <FiPlus />)}
                                {loading ? 'Memproses...' : (editingBooking ? 'Update Booking' : 'Buat Booking')}
                            </div>
                        </button>
                        {editingBooking && (
                            <button
                                type="button"
                                onClick={() => setEditingBooking(null)}
                                className="btn btn-secondary"
                            >
                                Batal
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* Manage Bookings */}
            <div className="card">
                <h3 className="mb-3">Kelola Booking</h3>

                <div className="mb-3">
                    <div className="relative" style={{ maxWidth: '400px' }}>
                        {/* <FiSearch className="absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} /> */}
                        <input
                            type="text"
                            className="input"
                            style={{ paddingLeft: '35px' }}
                            placeholder="Cari ruangan atau keperluan..."
                            value={bookingSearch}
                            onChange={(e) => {
                                setBookingSearch(e.target.value);
                                setBookingPage(1);
                            }}
                        />
                    </div>
                </div>

                <div className="mb-3">
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem' }}>
                        <input
                            type="checkbox"
                            checked={showPastBookings}
                            onChange={(e) => {
                                setShowPastBookings(e.target.checked);
                                setBookingPage(1);
                            }}
                            style={{ cursor: 'pointer' }}
                        />
                        <span>Tampilkan booking yang sudah lewat</span>
                    </label>
                </div>

                {filteredBookings.length === 0 ? (
                    <p className="text-muted text-center">Data tidak ditemukan</p>
                ) : (
                    <>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Ruangan</th>
                                        <th>Tanggal</th>
                                        <th>Waktu</th>
                                        <th>Keperluan</th>
                                        <th style={{ width: '50px', textAlign: 'center' }}>Tipe</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedBookings.map(booking => (
                                        <tr key={booking.id}>
                                            <td>{booking.roomName || booking.roomId}</td>
                                            <td>{formatDateIndonesian(booking.date)}</td>
                                            <td>{booking.timeFrom} - {booking.timeTo}</td>
                                            <td>{booking.purpose}</td>
                                            <td style={{ textAlign: 'center' }}>
                                                <div
                                                    style={{
                                                        display: 'inline-block',
                                                        width: '12px',
                                                        height: '12px',
                                                        backgroundColor: getBookingTypeColor(booking.bookingType),
                                                        borderRadius: '50%',
                                                        boxShadow: '0 0 5px rgba(0,0,0,0.1)'
                                                    }}
                                                    title={booking.bookingType.charAt(0).toUpperCase() + booking.bookingType.slice(1)}
                                                ></div>
                                            </td>
                                            <td>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => {
                                                            setEditingBooking(booking);
                                                            setTimeout(() => {
                                                                bookingFormRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                                            }, 100);
                                                        }}
                                                        className="btn btn-secondary btn-sm"
                                                        disabled={loading}
                                                    >
                                                        <FiEdit2 />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteBooking(booking.id)}
                                                        className="btn btn-danger btn-sm"
                                                        disabled={loading}
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {totalBookingPages > 1 && (
                            <div className="flex justify-between items-center mt-4">
                                <span className="text-sm text-muted">
                                    Halaman {bookingPage} dari {totalBookingPages} ({filteredBookings.length} data)
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        disabled={bookingPage === 1}
                                        onClick={() => setBookingPage(p => p - 1)}
                                    >
                                        <FiChevronLeft />
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        disabled={bookingPage === totalBookingPages}
                                        onClick={() => setBookingPage(p => p + 1)}
                                    >
                                        <FiChevronRight />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Manage Rooms */}
            <div className="card">
                <h3 className="mb-3">Kelola Ruangan</h3>

                {/* Add/Edit Room Form */}
                <form onSubmit={editingRoom ? handleUpdateRoom : handleCreateRoom} className="mb-3">
                    <div className="grid grid-2 gap-2">
                        <div className="form-group">
                            <label className="label">Nama Ruangan *</label>
                            <input
                                type="text"
                                className="input"
                                value={editingRoom ? editingRoom.name : newRoom.name}
                                onChange={(e) => {
                                    if (editingRoom) {
                                        setEditingRoom({ ...editingRoom, name: e.target.value });
                                    } else {
                                        setNewRoom({ ...newRoom, name: e.target.value });
                                    }
                                }}
                                placeholder="Contoh: Ruang Rapat"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="label">Deskripsi</label>
                            <input
                                type="text"
                                className="input"
                                value={editingRoom ? editingRoom.description || '' : newRoom.description}
                                onChange={(e) => {
                                    if (editingRoom) {
                                        setEditingRoom({ ...editingRoom, description: e.target.value });
                                    } else {
                                        setNewRoom({ ...newRoom, description: e.target.value });
                                    }
                                }}
                                placeholder="Deskripsi ruangan (opsional)"
                            />
                        </div>

                        <div className="form-group">
                            <label className="label">Warna Ruangan *</label>
                            <div className="flex gap-1 items-center">
                                <input
                                    type="color"
                                    className="input-color"
                                    value={editingRoom ? editingRoom.color : newRoom.color}
                                    onChange={(e) => {
                                        if (editingRoom) {
                                            setEditingRoom({ ...editingRoom, color: e.target.value });
                                        } else {
                                            setNewRoom({ ...newRoom, color: e.target.value });
                                        }
                                    }}
                                    required
                                />
                                <span className="text-sm text-muted">Akan muncul di kalender</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {loading ? <LoadingSpinner size="sm" /> : (editingRoom ? <FiSave /> : <FiPlus />)}
                                {editingRoom ? 'Update Ruangan' : 'Tambah Ruangan'}
                            </div>
                        </button>
                        {editingRoom && (
                            <button
                                type="button"
                                onClick={() => setEditingRoom(null)}
                                className="btn btn-secondary"
                            >
                                Batal
                            </button>
                        )}
                    </div>
                </form>

                {/* Room List */}
                <h4 className="mb-3">Daftar Ruangan</h4>

                <div className="mb-3">
                    <div className="relative" style={{ maxWidth: '400px' }}>
                        {/* <FiSearch className="absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} /> */}
                        <input
                            type="text"
                            className="input"
                            style={{ paddingLeft: '35px' }}
                            placeholder="Cari ruangan..."
                            value={roomSearch}
                            onChange={(e) => {
                                setRoomSearch(e.target.value);
                                setRoomPage(1);
                            }}
                        />
                    </div>
                </div>

                {filteredRooms.length === 0 ? (
                    <p className="text-muted text-center">Data tidak ditemukan</p>
                ) : (
                    <>
                        <div style={{ overflowX: 'auto' }}>
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Warna</th>
                                        <th>Nama</th>
                                        <th>Deskripsi</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedRooms.map(room => (
                                        <tr key={room.id}>
                                            <td>
                                                <div
                                                    className="room-color-preview"
                                                    style={{ backgroundColor: room.color }}
                                                />
                                            </td>
                                            <td>{room.name}</td>
                                            <td>{room.description || '-'}</td>
                                            <td>
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => setEditingRoom(room)}
                                                        className="btn btn-secondary btn-sm"
                                                        disabled={loading}
                                                    >
                                                        <FiEdit2 />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteRoom(room.id)}
                                                        className="btn btn-danger btn-sm"
                                                        disabled={loading}
                                                    >
                                                        <FiTrash2 />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {totalRoomPages > 1 && (
                            <div className="flex justify-between items-center mt-4">
                                <span className="text-sm text-muted">
                                    Halaman {roomPage} dari {totalRoomPages} ({filteredRooms.length} data)
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        disabled={roomPage === 1}
                                        onClick={() => setRoomPage(p => p - 1)}
                                    >
                                        <FiChevronLeft />
                                    </button>
                                    <button
                                        className="btn btn-secondary btn-sm"
                                        disabled={roomPage === totalRoomPages}
                                        onClick={() => setRoomPage(p => p + 1)}
                                    >
                                        <FiChevronRight />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            <Modal
                isOpen={modal.isOpen}
                type={modal.type}
                title={modal.title}
                message={modal.message}
                onConfirm={modal.onConfirm}
                onCancel={() => setModal(prev => ({ ...prev, isOpen: false }))}
            />
        </div>
    );
}
