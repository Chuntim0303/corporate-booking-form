-- Add wedding_form_id to payments table
-- Migration: add_wedding_form_id_to_payments.sql

ALTER TABLE payments
ADD COLUMN wedding_form_id INT NULL AFTER partner_application_id,
ADD CONSTRAINT fk_payments_wedding_form
  FOREIGN KEY (wedding_form_id) REFERENCES wedding_forms(id)
  ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_wedding_form_id ON payments(wedding_form_id);
