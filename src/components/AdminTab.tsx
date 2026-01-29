'use client';

import { useState, useRef } from 'react';
import { FiPlus, FiTrash2, FiEdit2, FiSave, FiSearch, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import Flatpickr from 'react-flatpickr';
import 'flatpickr/dist/flatpickr.css';
import { formatDateIndonesian } from '@/lib/utils';
import type { Room, Booking } from '@/types';
import Modal, { ModalType } from './Modal';

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
    });

    // Room form state
    const [newRoom, setNewRoom] = useState({
        name: '',
        description: '',
        color: '#3B82F6',
    });

    const [editingRoom, setEditingRoom] = useState<Room | null>(null);
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
    const itemsPerPage = 10;

    const datePickerRef = useRef<any>(null);
    const timeFromPickerRef = useRef<any>(null);
    const timeToPickerRef = useRef<any>(null);

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
    const filteredBookings = bookings.filter(b =>
        (b.roomName || '').toLowerCase().includes(bookingSearch.toLowerCase()) ||
        (b.purpose || '').toLowerCase().includes(bookingSearch.toLowerCase())
    );

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
            {/* Create Booking Form */}
            <div className="card">
                <h3 className="mb-3">Buat Booking Baru</h3>
                <form onSubmit={handleCreateBooking}>
                    <div className="grid grid-2 gap-2">
                        <div className="form-group">
                            <label className="label">Ruangan *</label>
                            <select
                                className="select"
                                value={newBooking.roomId}
                                onChange={(e) => setNewBooking({ ...newBooking, roomId: e.target.value })}
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
                                value={newBooking.date}
                                onChange={(dates) => {
                                    if (dates[0]) {
                                        setNewBooking({ ...newBooking, date: dates[0].toISOString().split('T')[0] });
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
                                value={newBooking.timeFrom}
                                onChange={(dates) => {
                                    if (dates[0]) {
                                        const hours = dates[0].getHours().toString().padStart(2, '0');
                                        const minutes = dates[0].getMinutes().toString().padStart(2, '0');
                                        setNewBooking({ ...newBooking, timeFrom: `${hours}:${minutes}` });
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
                                value={newBooking.timeTo}
                                onChange={(dates) => {
                                    if (dates[0]) {
                                        const hours = dates[0].getHours().toString().padStart(2, '0');
                                        const minutes = dates[0].getMinutes().toString().padStart(2, '0');
                                        setNewBooking({ ...newBooking, timeTo: `${hours}:${minutes}` });
                                    }
                                }}
                                className="input"
                                placeholder="HH:mm"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="label">Keperluan</label>
                        <textarea
                            className="textarea"
                            rows={3}
                            value={newBooking.purpose}
                            onChange={(e) => setNewBooking({ ...newBooking, purpose: e.target.value })}
                            placeholder="Masukkan keperluan booking (opsional)"
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        <FiPlus />
                        {loading ? 'Memproses...' : 'Buat Booking'}
                    </button>
                </form>
            </div>

            {/* Manage Bookings */}
            <div className="card">
                <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                    <h3 style={{ margin: 0 }}>Kelola Booking</h3>
                    <div className="relative" style={{ width: '100%', maxWidth: '300px' }}>
                        <FiSearch className="absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
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
                                            <td>
                                                <button
                                                    onClick={() => handleDeleteBooking(booking.id)}
                                                    className="btn btn-danger btn-sm"
                                                    disabled={loading}
                                                >
                                                    <FiTrash2 />
                                                </button>
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
                            {editingRoom ? <FiSave /> : <FiPlus />}
                            {editingRoom ? 'Update Ruangan' : 'Tambah Ruangan'}
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
                <div className="flex justify-between items-center mb-3 flex-wrap gap-2">
                    <h4 style={{ margin: 0 }}>Daftar Ruangan</h4>
                    <div className="relative" style={{ width: '100%', maxWidth: '300px' }}>
                        <FiSearch className="absolute text-muted" style={{ left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
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
