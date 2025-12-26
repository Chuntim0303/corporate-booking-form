-- Migration script to add receipt storage columns to partner_applications table
-- Run this script to update your database schema for S3 receipt storage

-- Add columns for receipt storage if they don't exist
ALTER TABLE partner_applications
ADD COLUMN IF NOT EXISTS receipt_storage_key VARCHAR(500) DEFAULT '' COMMENT 'S3 key for uploaded receipt',
ADD COLUMN IF NOT EXISTS receipt_file_name VARCHAR(255) DEFAULT '' COMMENT 'Original filename of uploaded receipt',
ADD COLUMN IF NOT EXISTS total_payable DECIMAL(10, 2) DEFAULT 0.00 COMMENT 'Total amount payable for partnership tier';

-- Add index for faster lookups on receipt storage key
CREATE INDEX IF NOT EXISTS idx_receipt_storage_key ON partner_applications(receipt_storage_key);

-- Add comment to table
ALTER TABLE partner_applications COMMENT = 'Stores corporate partnership applications with receipt information';
