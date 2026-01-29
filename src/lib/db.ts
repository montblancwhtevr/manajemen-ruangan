import { neon } from '@neondatabase/serverless';
import type { Room, Booking } from '@/types';

// Initialize Neon client
const sql = neon(process.env.DATABASE_URL!);

// User operations
export async function getUserByEmail(email: string) {
    const result = await sql`
        SELECT id, email, password_hash as "passwordHash", role
        FROM users
        WHERE email = ${email}
    `;

    if (result.length === 0) return undefined;

    return {
        ...result[0],
        id: String(result[0].id),
    };
}

// Room operations
export async function getAllRooms(): Promise<Room[]> {
    const result = await sql`
        SELECT id, name, description, color, created_at as "createdAt"
        FROM rooms
        ORDER BY name ASC
    `;

    return result.map(room => ({
        ...room,
        id: String(room.id),
    })) as Room[];
}

export async function getRoomById(id: string): Promise<Room | undefined> {
    const result = await sql`
        SELECT id, name, description, color, created_at as "createdAt"
        FROM rooms
        WHERE id = ${parseInt(id)}
    `;

    if (result.length === 0) return undefined;

    return {
        ...result[0],
        id: String(result[0].id),
    } as Room;
}

export async function createRoom(data: { name: string; description?: string; color?: string }): Promise<Room> {
    const result = await sql`
        INSERT INTO rooms (name, description, color)
        VALUES (${data.name}, ${data.description || null}, ${data.color || '#3B82F6'})
        RETURNING id, name, description, color, created_at as "createdAt"
    `;

    return {
        ...result[0],
        id: String(result[0].id),
    } as Room;
}

export async function updateRoom(id: string, data: { name?: string; description?: string; color?: string }): Promise<Room | null> {
    // Dynamically build update query for better efficiency
    // But since there are only 3 fields, we can keep it simple
    const current = await getRoomById(id);
    if (!current) return null;

    const result = await sql`
        UPDATE rooms
        SET 
            name = ${data.name || current.name},
            description = ${data.description !== undefined ? data.description : current.description},
            color = ${data.color || current.color}
        WHERE id = ${parseInt(id)}
        RETURNING id, name, description, color, created_at as "createdAt"
    `;

    return {
        ...result[0],
        id: String(result[0].id),
    } as Room;
}

export async function deleteRoom(id: string): Promise<boolean> {
    const result = await sql`
        DELETE FROM rooms
        WHERE id = ${parseInt(id)}
        RETURNING id
    `;

    return result.length > 0;
}

// Booking operations
export async function getAllBookings(): Promise<Booking[]> {
    const result = await sql`
        SELECT 
            b.id, b.room_id as "roomId", r.name as "roomName",
            b.date, b.time_from as "timeFrom", b.time_to as "timeTo",
            b.purpose, b.created_by as "createdBy", b.created_at as "createdAt"
        FROM bookings b
        LEFT JOIN rooms r ON b.room_id = r.id
        ORDER BY b.date DESC, b.time_from DESC
    `;

    return result.map(b => ({
        ...b,
        id: String(b.id),
        roomId: String(b.roomId),
        // SQL TIME type might return HH:mm:ss, we want HH:mm
        timeFrom: b.timeFrom.substring(0, 5),
        timeTo: b.timeTo.substring(0, 5),
    })) as Booking[];
}

export async function getBookingById(id: string): Promise<Booking | undefined> {
    const result = await sql`
        SELECT 
            b.id, b.room_id as "roomId", r.name as "roomName",
            b.date, b.time_from as "timeFrom", b.time_to as "timeTo",
            b.purpose, b.created_by as "createdBy", b.created_at as "createdAt"
        FROM bookings b
        LEFT JOIN rooms r ON b.room_id = r.id
        WHERE b.id = ${parseInt(id)}
    `;

    if (result.length === 0) return undefined;

    const b = result[0];
    return {
        ...b,
        id: String(b.id),
        roomId: String(b.roomId),
        timeFrom: b.timeFrom.substring(0, 5),
        timeTo: b.timeTo.substring(0, 5),
    } as Booking;
}

export async function getBookingsByFilters(filters: {
    dateFrom?: string;
    dateTo?: string;
    roomId?: string;
}): Promise<Booking[]> {
    // Simple approach: fetch all and filter if logic is complex, 
    // but SQL is better for this.

    let query = `
        SELECT 
            b.id, b.room_id as "roomId", r.name as "roomName",
            b.date, b.time_from as "timeFrom", b.time_to as "timeTo",
            b.purpose, b.created_by as "createdBy", b.created_at as "createdAt"
        FROM bookings b
        LEFT JOIN rooms r ON b.room_id = r.id
        WHERE 1=1
    `;

    const params: any[] = [];

    if (filters.dateFrom && filters.dateTo) {
        params.push(filters.dateFrom, filters.dateTo);
        query += ` AND b.date >= $${params.length - 1} AND b.date <= $${params.length}`;
    }

    if (filters.roomId) {
        params.push(parseInt(filters.roomId));
        query += ` AND b.room_id = $${params.length}`;
    }

    query += ` ORDER BY b.date DESC, b.time_from DESC`;

    // Note: neon template literal is safer, but for complex filters we might need builder
    // However, neon's sql`...` is very smart. Let's use it properly.

    let result;
    if (filters.dateFrom && filters.dateTo && filters.roomId) {
        result = await sql`
            SELECT b.id, b.room_id as "roomId", r.name as "roomName", b.date, b.time_from as "timeFrom", b.time_to as "timeTo", b.purpose, b.created_by as "createdBy", b.created_at as "createdAt"
            FROM bookings b LEFT JOIN rooms r ON b.room_id = r.id
            WHERE b.date >= ${filters.dateFrom} AND b.date <= ${filters.dateTo} AND b.room_id = ${parseInt(filters.roomId)}
            ORDER BY b.date DESC, b.time_from DESC
        `;
    } else if (filters.dateFrom && filters.dateTo) {
        result = await sql`
            SELECT b.id, b.room_id as "roomId", r.name as "roomName", b.date, b.time_from as "timeFrom", b.time_to as "timeTo", b.purpose, b.created_by as "createdBy", b.created_at as "createdAt"
            FROM bookings b LEFT JOIN rooms r ON b.room_id = r.id
            WHERE b.date >= ${filters.dateFrom} AND b.date <= ${filters.dateTo}
            ORDER BY b.date DESC, b.time_from DESC
        `;
    } else if (filters.roomId) {
        result = await sql`
            SELECT b.id, b.room_id as "roomId", r.name as "roomName", b.date, b.time_from as "timeFrom", b.time_to as "timeTo", b.purpose, b.created_by as "createdBy", b.created_at as "createdAt"
            FROM bookings b LEFT JOIN rooms r ON b.room_id = r.id
            WHERE b.room_id = ${parseInt(filters.roomId)}
            ORDER BY b.date DESC, b.time_from DESC
        `;
    } else {
        return getAllBookings();
    }

    return result.map(b => ({
        ...b,
        id: String(b.id),
        roomId: String(b.roomId),
        timeFrom: b.timeFrom.substring(0, 5),
        timeTo: b.timeTo.substring(0, 5),
    })) as Booking[];
}

export async function createBooking(data: {
    roomId: string;
    date: string;
    timeFrom: string;
    timeTo: string;
    purpose: string;
    createdBy: string;
}): Promise<{ success: boolean; booking?: Booking; error?: string }> {
    // Check for conflicts in SQL
    const conflicts = await sql`
        SELECT id FROM bookings
        WHERE room_id = ${parseInt(data.roomId)} 
        AND date = ${data.date}
        AND (
            (time_from < ${data.timeTo} AND time_to > ${data.timeFrom})
        )
    `;

    if (conflicts.length > 0) {
        return { success: false, error: 'Ruangan sudah dibooking pada waktu tersebut' };
    }

    const result = await sql`
        INSERT INTO bookings (room_id, date, time_from, time_to, purpose, created_by)
        VALUES (${parseInt(data.roomId)}, ${data.date}, ${data.timeFrom}, ${data.timeTo}, ${data.purpose}, ${data.createdBy})
        RETURNING id, room_id as "roomId", date, time_from as "timeFrom", time_to as "timeTo", purpose, created_by as "createdBy", created_at as "createdAt"
    `;

    const b = result[0];
    const room = await getRoomById(data.roomId);

    return {
        success: true,
        booking: {
            ...b,
            id: String(b.id),
            roomId: String(b.roomId),
            roomName: room?.name,
            timeFrom: b.timeFrom.substring(0, 5),
            timeTo: b.timeTo.substring(0, 5),
        } as Booking
    };
}

export async function deleteBooking(id: string): Promise<boolean> {
    const result = await sql`
        DELETE FROM bookings
        WHERE id = ${parseInt(id)}
        RETURNING id
    `;

    return result.length > 0;
}
