-- Run once on the database before using drag & drop ordering for Resources.
ALTER TABLE resources ADD COLUMN position INT NOT NULL DEFAULT 0;

-- Seed existing rows with their current order (oldest first).
SET @pos := 0;
UPDATE resources SET position = (@pos := @pos + 1) ORDER BY created_at ASC, resource_id ASC;
