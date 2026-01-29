export interface User {
  id: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: Date;
}

export interface Room {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: Date;
}

export interface Booking {
  id: string;
  roomId: string;
  roomName?: string;
  date: string; // YYYY-MM-DD format
  timeFrom: string; // HH:mm format
  timeTo: string; // HH:mm format
  purpose: string;
  createdBy: string;
  createdAt: Date;
}

export interface BookingSearchParams {
  dateFrom?: string;
  dateTo?: string;
  roomId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}
