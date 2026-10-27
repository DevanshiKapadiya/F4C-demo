-- Run once on the database before using the updated Contact Enquiry module.

ALTER TABLE contact_enquiry
  ADD COLUMN enquiry_type ENUM('General', 'Partnership', 'Platform Support') NOT NULL DEFAULT 'General' AFTER phone,
  ADD COLUMN enquiry_status TINYINT NOT NULL DEFAULT 0 COMMENT '0 = New, 1 = Viewed, 2 = Closed' AFTER message,
  ADD COLUMN closed_at DATETIME NULL AFTER enquiry_status,
  ADD COLUMN closed_by INT NULL AFTER closed_at,
  ADD COLUMN confirmation_sent TINYINT NOT NULL DEFAULT 0 AFTER closed_by;

-- Existing rows: old "Inactive" (0) becomes Closed, everything else becomes Viewed.
UPDATE contact_enquiry SET enquiry_status = IF(status = 0, 2, 1);

CREATE TABLE IF NOT EXISTS audit_log (
  audit_log_id INT NOT NULL AUTO_INCREMENT,
  admin_id INT NULL,
  module VARCHAR(50) NOT NULL,
  action VARCHAR(50) NOT NULL,
  record_id INT NULL,
  old_value VARCHAR(255) NULL,
  new_value VARCHAR(255) NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (audit_log_id),
  KEY idx_audit_module_record (module, record_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8;
