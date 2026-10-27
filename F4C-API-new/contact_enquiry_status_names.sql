-- Run once: store readable values in the database instead of 0 / 1 / 2.

-- enquiry_status: 0 -> New, 1 -> Viewed, 2 -> Closed
ALTER TABLE contact_enquiry MODIFY enquiry_status VARCHAR(10) NOT NULL DEFAULT 'New';
UPDATE contact_enquiry SET enquiry_status = CASE enquiry_status WHEN '0' THEN 'New' WHEN '1' THEN 'Viewed' WHEN '2' THEN 'Closed' ELSE enquiry_status END;
ALTER TABLE contact_enquiry MODIFY enquiry_status ENUM('New', 'Viewed', 'Closed') NOT NULL DEFAULT 'New';

-- confirmation_sent: 0 -> No, 1 -> Yes
ALTER TABLE contact_enquiry MODIFY confirmation_sent VARCHAR(3) NOT NULL DEFAULT 'No';
UPDATE contact_enquiry SET confirmation_sent = IF(confirmation_sent = '1', 'Yes', 'No');
ALTER TABLE contact_enquiry MODIFY confirmation_sent ENUM('No', 'Yes') NOT NULL DEFAULT 'No';

-- Old Active/Inactive flag (1 / 0). Its meaning now lives in enquiry_status, so remove the confusing duplicate.
ALTER TABLE contact_enquiry DROP COLUMN status;
