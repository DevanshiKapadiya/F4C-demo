-- Run once: the Close / Reopen workflow and confirmation tracking were removed from Contact Enquiry.
ALTER TABLE contact_enquiry
  DROP COLUMN closed_at,
  DROP COLUMN closed_by,
  DROP COLUMN confirmation_sent;
