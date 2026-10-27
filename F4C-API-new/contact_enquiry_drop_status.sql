-- Run once: Contact Enquiry no longer has a status (New / Viewed / Closed).
ALTER TABLE contact_enquiry DROP COLUMN enquiry_status;
