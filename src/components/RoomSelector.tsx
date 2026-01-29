'use client';

import type { Room } from '@/types';

interface RoomSelectorProps {
    rooms: Room[];
    selectedRoomId: string;
    onChange: (roomId: string) => void;
}

export default function RoomSelector({ rooms, selectedRoomId, onChange }: RoomSelectorProps) {
    return (
        <div className="form-group">
            <label className="label">Ruangan</label>
            <select
                className="select"
                value={selectedRoomId}
                onChange={(e) => onChange(e.target.value)}
            >
                <option value="">Semua Ruangan</option>
                {rooms.map(room => (
                    <option key={room.id} value={room.id}>
                        {room.name}
                    </option>
                ))}
            </select>
        </div>
    );
}
