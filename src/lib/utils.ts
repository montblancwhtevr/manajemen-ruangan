import { format, parse, isValid } from 'date-fns';

/**
 * Format a date to YYYY-MM-DD
 */
export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, 'yyyy-MM-dd');
}

/**
 * Format a date to display format (DD/MM/YYYY)
 */
export function formatDateDisplay(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return format(d, 'dd/MM/yyyy');
}

/**
 * Format a date to Indonesian display format (e.g., 11 Januari 2026)
 */
export function formatDateIndonesian(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    const months = [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
    ];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

/**
 * Format time to HH:mm
 */
export function formatTime(time: string | Date): string {
    if (typeof time === 'string') {
        return time;
    }
    return format(time, 'HH:mm');
}

/**
 * Parse date string to Date object
 */
export function parseDate(dateString: string): Date | null {
    try {
        const parsed = parse(dateString, 'yyyy-MM-dd', new Date());
        return isValid(parsed) ? parsed : null;
    } catch {
        return null;
    }
}

/**
 * Check if two time ranges overlap
 */
export function timeRangesOverlap(
    start1: string,
    end1: string,
    start2: string,
    end2: string
): boolean {
    const s1 = timeToMinutes(start1);
    const e1 = timeToMinutes(end1);
    const s2 = timeToMinutes(start2);
    const e2 = timeToMinutes(end2);

    return s1 < e2 && s2 < e1;
}

/**
 * Convert time string (HH:mm) to minutes since midnight
 */
function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
}

/**
 * Validate time format (HH:mm)
 */
export function isValidTimeFormat(time: string): boolean {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
}

/**
 * Get current date in YYYY-MM-DD format
 */
export function getCurrentDate(): string {
    return formatDate(new Date());
}

/**
 * Get current time in HH:mm format
 */
export function getCurrentTime(): string {
    return format(new Date(), 'HH:mm');
}

/**
 * Priority color configuration
 */
export const PRIORITY_COLORS = {
    prioritas: '#1e3fd3ff',
    internal: '#292929ff',
    eksternal: '#f0f00bff',
} as const;

/**
 * Get color for booking type
 */
export function getBookingTypeColor(type: string): string {
    switch (type) {
        case 'prioritas':
            return PRIORITY_COLORS.prioritas;
        case 'eksternal':
            return PRIORITY_COLORS.eksternal;
        case 'internal':
        default:
            return PRIORITY_COLORS.internal;
    }
}
