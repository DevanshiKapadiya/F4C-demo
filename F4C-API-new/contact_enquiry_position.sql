-- Run once: manual drag & drop ordering for Contact Enquiries.
ALTER TABLE contact_enquiry ADD COLUMN position INT NOT NULL DEFAULT 0;

-- Seed existing rows so the newest enquiry is first (1, 2, 3 ...).
SET @pos := 0;
UPDATE contact_enquiry SET position = (@pos := @pos + 1) ORDER BY created_at DESC, contact_enquiry_id DESC;

-- Every enquiry must have its own position.
ALTER TABLE contact_enquiry ADD UNIQUE KEY unique_contact_enquiry_position (position);
