-- Migration: Add User Categories and Location Fields
-- Date: 2026-02-10
-- Description: Adds user_category enum and location fields to support PFW students/alumni, community members, and international users

-- ============================================
-- STEP 1: Create User Category Enum Type
-- ============================================

CREATE TYPE user_category AS ENUM ('pfw_student', 'pfw_alumni', 'community', 'international');

-- ============================================
-- STEP 2: Add New Columns to Users Table
-- ============================================

ALTER TABLE users 
  ADD COLUMN user_category user_category,
  ADD COLUMN country_of_residence VARCHAR(100),
  ADD COLUMN country_of_origin VARCHAR(100);

-- ============================================
-- STEP 3: Create Index for Performance
-- ============================================

CREATE INDEX idx_users_category ON users(user_category);

-- ============================================
-- STEP 4: Add Comments for Documentation
-- ============================================

COMMENT ON COLUMN users.user_category IS 'User category: pfw_student, pfw_alumni, community, or international';
COMMENT ON COLUMN users.country_of_residence IS 'Country where user currently resides (required for international users)';
COMMENT ON COLUMN users.country_of_origin IS 'Country of origin if different from residence (optional for international users)';

-- ============================================
-- VERIFICATION QUERY
-- ============================================

-- Verify enum type created
SELECT enumlabel FROM pg_enum 
WHERE enumtypid = 'user_category'::regtype
ORDER BY enumsortorder;

-- Verify columns added
SELECT column_name, data_type, is_nullable, character_maximum_length
FROM information_schema.columns
WHERE table_name = 'users' 
  AND column_name IN ('user_category', 'country_of_residence', 'country_of_origin')
ORDER BY ordinal_position;

-- ============================================
-- NOTES
-- ============================================

/*
- user_category is nullable to support existing users
- Location fields (country_of_residence, country_of_origin) are only required when user_category = 'international'
- The existing 'role' field (student/organizer/admin) remains separate from user_category
- Users can have both a role and a category (e.g., International Event Organizer)
*/
