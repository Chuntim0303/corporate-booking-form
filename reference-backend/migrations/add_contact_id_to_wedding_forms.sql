-- Add contact_id column to wedding_forms table
-- Migration: add_contact_id_to_wedding_forms.sql

-- Add the contact_id column
ALTER TABLE wedding_forms
ADD COLUMN contact_id INT NULL AFTER lead_id;

-- Add foreign key constraint
ALTER TABLE wedding_forms
ADD CONSTRAINT fk_wedding_forms_contact
  FOREIGN KEY (contact_id) REFERENCES contacts(contact_id)
  ON DELETE SET NULL;

-- Add index for better query performance
CREATE INDEX idx_contact_id ON wedding_forms(contact_id);

-- Optional: Migrate existing data from lead_id to contact_id if needed
-- This would require a custom data migration script based on your needs
