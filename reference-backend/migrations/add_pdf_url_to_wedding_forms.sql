-- Migration: Add pdf_url column to wedding_forms table
-- Date: 2025-11-20
-- Description: This migration adds a pdf_url column to store the S3 URL of the generated PDF

-- Add pdf_url column to wedding_forms table
ALTER TABLE wedding_forms
ADD COLUMN pdf_url VARCHAR(512) AFTER deposit_receipt_url,
ADD INDEX idx_pdf_url (pdf_url);

-- Optional: Add comment to the column for documentation
ALTER TABLE wedding_forms
MODIFY COLUMN pdf_url VARCHAR(512) COMMENT 'S3 URL of the generated wedding form PDF';
