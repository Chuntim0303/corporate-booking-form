-- Migration script to add UTM tracking columns to partner_applications table
-- Run this script to update your database schema for UTM tracking

-- Add columns for UTM tracking if they don't exist
ALTER TABLE partner_applications
ADD COLUMN IF NOT EXISTS utm_source VARCHAR(255) DEFAULT '' COMMENT 'UTM source parameter for tracking',
ADD COLUMN IF NOT EXISTS utm_medium VARCHAR(255) DEFAULT '' COMMENT 'UTM medium parameter for tracking';

-- Add index for faster lookups on utm tracking
CREATE INDEX IF NOT EXISTS idx_utm_source ON partner_applications(utm_source);
CREATE INDEX IF NOT EXISTS idx_utm_medium ON partner_applications(utm_medium);

-- Add comment to table
ALTER TABLE partner_applications COMMENT = 'Stores corporate partnership applications with UTM tracking';
