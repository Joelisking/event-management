-- Performance Optimization Indexes
-- These indexes improve query performance for frequently accessed data

-- Leaderboard query optimization
CREATE INDEX IF NOT EXISTS idx_users_points_desc ON users(total_points DESC)
WHERE role = 'student';

-- Event listing query optimization
CREATE INDEX IF NOT EXISTS idx_events_start_date ON events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_status ON events(status);
CREATE INDEX IF NOT EXISTS idx_events_category ON events(category);

-- Combined index for common event queries (status + start_date)
CREATE INDEX IF NOT EXISTS idx_events_status_start ON events(status, start_date);

-- RSVP queries optimization
CREATE INDEX IF NOT EXISTS idx_event_attendees_user ON event_attendees(user_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_event ON event_attendees(event_id);
CREATE INDEX IF NOT EXISTS idx_event_attendees_status ON event_attendees(status);

-- Combined index for attendee queries (event_id + status)
CREATE INDEX IF NOT EXISTS idx_event_attendees_event_status ON event_attendees(event_id, status);

-- Notification queries optimization
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created ON notifications(created_at DESC);

-- Redemption queries optimization
CREATE INDEX IF NOT EXISTS idx_redemptions_user ON redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_reward ON redemptions(reward_id);
CREATE INDEX IF NOT EXISTS idx_redemptions_redeemed_at ON redemptions(redeemed_at DESC);

-- User lookup optimization
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- Event organizer queries optimization
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
