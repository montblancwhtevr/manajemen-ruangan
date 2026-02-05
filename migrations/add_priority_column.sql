-- Add is_priority column to bookings table
-- This migration adds a boolean field to track whether a booking is priority or not
-- Default is FALSE (non-priority/yellow) for existing and new bookings

ALTER TABLE bookings 
ADD COLUMN is_priority BOOLEAN DEFAULT FALSE NOT NULL;

-- Optional: Add an index if you plan to filter by priority frequently
CREATE INDEX idx_bookings_priority ON bookings(is_priority);
