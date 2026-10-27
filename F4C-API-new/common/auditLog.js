const db = require('../db/db');

/* Records an admin action. Never throws: a logging problem must not break the action itself. */
const record = ({ adminId, module, action, recordId = null, oldValue = null, newValue = null }) => {
  try {
    db.query(
      'INSERT INTO audit_log (admin_id, module, action, record_id, old_value, new_value, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
      [adminId ? Number(adminId) : null, module, action, recordId, oldValue, newValue],
      (err) => {
        if (err) {
          console.error('auditLog error:', err.sqlMessage || err.message);
        }
      }
    );
  } catch (err) {
    console.error('auditLog error:', err.message);
  }
};

module.exports = { record };
