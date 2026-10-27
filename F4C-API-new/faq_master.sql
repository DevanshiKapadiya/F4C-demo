-- Run once: FAQ Master = FAQ Category + FAQ (linked by category_id).

CREATE TABLE IF NOT EXISTS faq_category (
  faq_category_id INT NOT NULL AUTO_INCREMENT,
  title VARCHAR(150) NOT NULL,
  position INT NOT NULL,
  status TINYINT NOT NULL DEFAULT 1 COMMENT '1 = Active, 0 = Inactive',
  created_at DATETIME NOT NULL,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (faq_category_id),
  UNIQUE KEY unique_faq_category_title (title),
  UNIQUE KEY unique_faq_category_position (position)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- Existing FAQs need a category, so start with a default one.
INSERT INTO faq_category (title, position, status, created_at) VALUES ('General', 1, 1, NOW());

ALTER TABLE faq ADD COLUMN category_id INT NULL AFTER faq_id;
UPDATE faq SET category_id = (SELECT faq_category_id FROM faq_category WHERE title = 'General');
ALTER TABLE faq MODIFY category_id INT NOT NULL;

-- Cascade delete: deleting a category automatically deletes all its FAQs.
ALTER TABLE faq ADD CONSTRAINT fk_faq_category FOREIGN KEY (category_id) REFERENCES faq_category (faq_category_id) ON DELETE CASCADE ON UPDATE CASCADE;

-- Every FAQ has its own position.
ALTER TABLE faq ADD UNIQUE KEY unique_faq_position (position);

ALTER TABLE faq MODIFY status INT NOT NULL DEFAULT 1 COMMENT '1 = Active, 0 = Inactive';
