-- Database Schema for Neon PostgreSQL
-- Run this SQL when setting up your Neon database in the SQL Editor

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'user')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(50) DEFAULT '#3B82F6',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Bookings table
CREATE TABLE IF NOT EXISTS bookings (
  id SERIAL PRIMARY KEY,
  room_id INTEGER NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  time_from TIME NOT NULL,
  time_to TIME NOT NULL,
  purpose TEXT NOT NULL,
  created_by VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_bookings_room_id ON bookings(room_id);
CREATE INDEX IF NOT EXISTS idx_bookings_date ON bookings(date);
CREATE INDEX IF NOT EXISTS idx_bookings_room_date ON bookings(room_id, date);

-- Sample data
INSERT INTO users (email, password_hash, role) VALUES
  ('admin@example.com', 'admin123', 'admin')
ON CONFLICT (email) DO NOTHING;

INSERT INTO rooms (name, description, color) VALUES
  ('Ruang ABB', 'Ruang meeting utama', '#EF4444'),
  ('Ruang AAD', 'Ruang diskusi kecil', '#3B82F6'),
  ('Ruang DDA', 'Ruang presentasi', '#10B981'),
  ('Test', '', '#F59E0B')
ON CONFLICT DO NOTHING;
