-- Production Data Integrity Constraints
-- This migration adds constraints to prevent data inconsistencies

-- Prevent negative points
ALTER TABLE users ADD CONSTRAINT positive_points CHECK (total_points >= 0);

-- Prevent negative reward costs
ALTER TABLE rewards ADD CONSTRAINT positive_cost CHECK (cost > 0);

-- Prevent negative event points
ALTER TABLE events ADD CONSTRAINT positive_event_points CHECK (points >= 0);

-- Unique constraint on check-in (one check-in per user per event)
-- This prevents duplicate check-ins from race conditions
CREATE UNIQUE INDEX idx_unique_checkin ON event_attendees(user_id, event_id)
WHERE checked_in_at IS NOT NULL;

-- Ensure event capacity is positive if specified
ALTER TABLE events ADD CONSTRAINT positive_capacity CHECK (capacity IS NULL OR capacity > 0);
