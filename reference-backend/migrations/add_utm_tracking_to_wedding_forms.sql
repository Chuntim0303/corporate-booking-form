-- Add UTM tracking fields to wedding_forms table
-- Migration: add_utm_tracking_to_wedding_forms.sql

ALTER TABLE wedding_forms
ADD COLUMN utm_source VARCHAR(255) NULL AFTER event_reference,
ADD COLUMN utm_medium VARCHAR(255) NULL AFTER utm_source;

-- Add index for better query performance on UTM fields
CREATE INDEX idx_utm_source ON wedding_forms(utm_source);
CREATE INDEX idx_utm_medium ON wedding_forms(utm_medium);
