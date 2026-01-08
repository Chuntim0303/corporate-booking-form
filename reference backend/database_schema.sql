-- ============================================
-- Event Venue Booking Form - MySQL Database Schema
-- ============================================

-- Update the existing contacts table to add new columns for industry and position
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS industry VARCHAR(100) AFTER company_name,
ADD COLUMN IF NOT EXISTS position VARCHAR(100) AFTER industry;

-- Add address columns to contacts table (matching existing schema naming)
ALTER TABLE contacts
ADD COLUMN IF NOT EXISTS address_line_1 VARCHAR(255) AFTER identification_card,
ADD COLUMN IF NOT EXISTS address_line_2 VARCHAR(255) AFTER address_line_1,
ADD COLUMN IF NOT EXISTS city VARCHAR(100) AFTER address_line_2,
ADD COLUMN IF NOT EXISTS state VARCHAR(100) AFTER city,
ADD COLUMN IF NOT EXISTS postcode VARCHAR(10) AFTER state;

-- Add index on email_address for faster lookups
ALTER TABLE contacts
ADD INDEX IF NOT EXISTS idx_email_address (email_address),
ADD INDEX IF NOT EXISTS idx_phone_number (phone_number),
ADD INDEX IF NOT EXISTS idx_pxier_contact_id (pxier_contact_id);

-- ============================================
-- Create event_bookings table
-- ============================================
CREATE TABLE IF NOT EXISTS event_bookings (
    booking_id VARCHAR(50) PRIMARY KEY,
    contact_id INT UNSIGNED NOT NULL,

    -- Event Information
    event_date DATE NOT NULL,
    event_time VARCHAR(20) NOT NULL,
    hall VARCHAR(100) NOT NULL,

    -- Booking Details
    is_company_event BOOLEAN DEFAULT FALSE,

    -- Payment Information
    payment_proof_urls JSON,

    -- Status tracking
    status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending',

    -- Additional data (for any extra fields)
    metadata JSON,

    -- Timestamps
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,

    -- Foreign key to contacts table
    FOREIGN KEY (contact_id) REFERENCES contacts(contact_id) ON DELETE RESTRICT,

    -- Indexes
    INDEX idx_event_date (event_date),
    INDEX idx_hall (hall),
    INDEX idx_status (status),
    INDEX idx_contact_id (contact_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- Comments for documentation
-- ============================================
ALTER TABLE event_bookings COMMENT = 'Stores event venue booking information';
ALTER TABLE event_bookings
    MODIFY COLUMN booking_id VARCHAR(50) COMMENT 'Unique booking ID (e.g., BK20260107123456)',
    MODIFY COLUMN contact_id INT UNSIGNED NOT NULL COMMENT 'Reference to contacts table',
    MODIFY COLUMN event_date DATE NOT NULL COMMENT 'Date of the event',
    MODIFY COLUMN event_time VARCHAR(20) NOT NULL COMMENT 'Time of the event (e.g., 09:00 AM)',
    MODIFY COLUMN hall VARCHAR(100) NOT NULL COMMENT 'Hall selection (grand-ballroom, crystal-hall, etc.)',
    MODIFY COLUMN is_company_event BOOLEAN DEFAULT FALSE COMMENT 'Whether this is a company event',
    MODIFY COLUMN payment_proof_urls JSON COMMENT 'Array of S3 URLs for payment proof uploads',
    MODIFY COLUMN status ENUM('pending', 'confirmed', 'cancelled', 'completed') DEFAULT 'pending' COMMENT 'Booking status',
    MODIFY COLUMN metadata JSON COMMENT 'Additional booking data in JSON format';

-- ============================================
-- Sample Query Examples
-- ============================================
-- Get all bookings with contact information:
-- SELECT
--     eb.booking_id,
--     eb.event_date,
--     eb.event_time,
--     eb.hall,
--     eb.status,
--     c.first_name,
--     c.last_name,
--     c.email_address,
--     c.phone_number,
--     c.company_name,
--     c.industry,
--     c.position
-- FROM event_bookings eb
-- JOIN contacts c ON eb.contact_id = c.contact_id
-- WHERE eb.deleted_at IS NULL
-- ORDER BY eb.created_at DESC;

-- Get bookings for a specific date:
-- SELECT * FROM event_bookings
-- WHERE event_date = '2026-01-22'
-- AND deleted_at IS NULL;

-- Get all company event bookings:
-- SELECT
--     eb.*,
--     c.company_name,
--     c.industry,
--     c.position
-- FROM event_bookings eb
-- JOIN contacts c ON eb.contact_id = c.contact_id
-- WHERE eb.is_company_event = TRUE
-- AND eb.deleted_at IS NULL;
