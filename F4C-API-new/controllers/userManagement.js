const bcrypt = require('bcrypt');
const db = require('../db/db');

/* ============================================================
   ALLOWED SORT COLUMNS – whitelist to prevent SQL injection
   ============================================================ */
const allowedSortColumns = {
  user_id: 'u.user_id',
  position: 'u.position',
  name: 'u.fname',
  fname: 'u.fname',
  email: 'u.email',
  location: 'u.city_town',
  city_town: 'u.city_town',
  created_at: 'u.created_at',
  preferred_session_type: 'u.preferred_session_type'
};


/* ============================================================
   HELPER – ensure preferred_session_type column exists
   ============================================================ */
function ensureSessionTypeColumn(callback) {
  const checkSQL = `
    SELECT COUNT(*) AS cnt
    FROM INFORMATION_SCHEMA.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = 'user'
      AND COLUMN_NAME  = 'preferred_session_type'
  `;
  db.query(checkSQL, [], (err, rows) => {
    if (err) return callback(err);
    if (rows[0].cnt === 0) {
      const alterSQL = `
        ALTER TABLE \`user\`
        ADD COLUMN \`preferred_session_type\`
          ENUM('online','in-person','either') NULL DEFAULT NULL
      `;
      db.query(alterSQL, [], (alterErr) => callback(alterErr));
    } else {
      callback(null);
    }
  });
}

/* ============================================================
   LIST  –  POST /admin/api/userList
   ============================================================ */
exports.userList = (req, res) => {
  const page = Math.max(1, Number(req.body.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(req.body.limit) || 10));
  const offset = (page - 1) * limit;

  const search = String(req.body.search || '').trim();
  const order = allowedSortColumns[req.body.order] || 'u.position';

  const direction = allowedSortColumns[req.body.order]
    ? (String(req.body.desc) === 'true' ? 'DESC' : 'ASC')
    : 'ASC';

  /* optional filter */
  const sessionType = req.body.session_type || '';
  const statusFilter = req.body.status;

  const where = [];
  const params = [];

  if (search) {
    where.push(`(
      u.fname LIKE ?
      OR u.lname LIKE ?
      OR CONCAT(u.fname, ' ', u.lname) LIKE ?
      OR u.email LIKE ?
      OR u.city_town LIKE ?
    )`);
    const term = `%${search}%`;
    params.push(term, term, term, term, term);
  }

  if (sessionType && sessionType !== 'all') {
    where.push(`u.preferred_session_type = ?`);
    params.push(sessionType);
  }

  if (
    statusFilter !== undefined &&
    statusFilter !== null &&
    statusFilter !== '' &&
    statusFilter !== 'all'
  ) {
    if (!['0', '1'].includes(String(statusFilter))) {
      return res.status(400).json({
        status: false,
        message: 'Invalid status filter'
      });
    }

    where.push('u.status = ?');
    params.push(Number(statusFilter));
  }

  const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';


  ensureSessionTypeColumn((colErr) => {
    if (colErr) {
      console.error('Column check error:', colErr);
      return res.status(500).json({ status: false, message: 'Database setup error' });
    }

    const countSQL = `SELECT COUNT(*) AS total FROM \`user\` u ${whereSQL}`;

    db.query(countSQL, params, (countErr, countRows) => {
      if (countErr) {
        console.error('User count error:', countErr);
        return res.status(500).json({ status: false, message: 'Unable to count users' });
      }

      const total = Number(countRows[0]?.total || 0);

      const listSQL = `
    SELECT
    u.user_id,
    u.fname,
    u.lname,
    CONCAT(u.fname, ' ', u.lname) AS name,
    u.email,
    u.city_town,
    u.country,
    c.name AS country_name,
    u.preferred_session_type,
    u.created_at,
    u.status,
    u.position
  FROM \`user\` u
LEFT JOIN \`countries\` c ON c.id = u.country
${whereSQL}
ORDER BY ${order} ${direction}, u.user_id ASC
LIMIT ? OFFSET ?
`;

      db.query(listSQL, [...params, limit, offset], (listErr, rows) => {
        if (listErr) {
          console.error('User list error:', listErr);
          return res.status(500).json({ status: false, message: 'Unable to fetch users' });
        }

        return res.json({
          status: true,
          message: 'Users fetched successfully',
          data: {
            data: rows,
            pagination: {
              currentPage: page,
              limit,
              totalRecords: total,
              totalPages: Math.ceil(total / limit) || 1
            }
          }
        });
      });
      //console.log('USER LIST SQL:', listSQL);
    });
  });
};

/* ============================================================
   DETAILS  –  POST /admin/api/userDetails
   ============================================================ */
exports.userDetails = (req, res) => {
  const userId = Number(req.body.user_id);
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return res.status(400).json({ status: false, message: 'Valid user_id is required' });
  }

  ensureSessionTypeColumn((colErr) => {
    if (colErr) {
      console.error('Column check error:', colErr);
      return res.status(500).json({ status: false, message: 'Database setup error' });
    }

    const sql = `
  SELECT
    u.user_id,
    u.fname,
    u.lname,
    CONCAT(u.fname, ' ', u.lname) AS name,
    u.email,
    u.city_town,
    u.country,
    c.name AS country_name,
    u.postal_code,
    u.preferred_session_type,
    u.created_at,
    u.status
  FROM \`user\` u
  LEFT JOIN \`countries\` c ON c.id = u.country
  WHERE u.user_id = ?
  LIMIT 1
`;
    db.query(sql, [userId], (err, rows) => {
      if (err) {
        console.error('User details error:', err);
        return res.status(500).json({ status: false, message: 'Unable to fetch user details' });
      }
      if (!rows.length) {
        return res.status(404).json({ status: false, message: 'User not found' });
      }
      return res.json({ status: true, data: rows[0] });
    });
  });
};

/* ============================================================
   CREATE  –  POST /admin/api/createUser
   ============================================================ */
exports.createUser = async (req, res) => {
  try {
    const {
      fname,
      lname,
      email,
      preferred_session_type,
      city_town,
      country,
      password,
      status
    } = req.body;

    // Validate required fields
    if (typeof fname !== 'string' || !fname.trim()) {
      return res.status(400).json({
        status: false,
        message: 'First name is required'
      });
    }

    if (typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({
        status: false,
        message: 'Email is required'
      });
    }

    if (typeof password !== 'string' || !password.trim()) {
      return res.status(400).json({
        status: false,
        message: 'Password is required'
      });
    }

    const countryId = Number(country);

    if (!Number.isSafeInteger(countryId) || countryId <= 0) {
      return res.status(400).json({
        status: false,
        message: 'Please select a valid country'
      });
    }

    const validSessionTypes = [
      'online',
      'in-person',
      'either'
    ];

    if (
      preferred_session_type &&
      !validSessionTypes.includes(preferred_session_type)
    ) {
      return res.status(400).json({
        status: false,
        message: 'Invalid preferred session type'
      });
    }

    const query = (sql, values = []) =>
      new Promise((resolve, reject) => {
        db.query(sql, values, (err, result) => {
          if (err) {
            console.error('Create user SQL error:', err);
            return reject(err);
          }

          resolve(result);
        });
      });

    // Check duplicate email
    const existingUsers = await query(
      'SELECT user_id FROM `user` WHERE email = ? LIMIT 1',
      [email.trim()]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        status: false,
        message: 'Email already exists'
      });
    }

    // Check country exists
    const countries = await query(
      'SELECT id FROM countries WHERE id = ? LIMIT 1',
      [countryId]
    );

    if (countries.length === 0) {
      return res.status(400).json({
        status: false,
        message: 'Selected country does not exist'
      });
    }

    // Ensure session type column exists
    await new Promise((resolve, reject) => {
      ensureSessionTypeColumn((err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const insertSQL = `
            INSERT INTO \`user\`
            (
                fname,
                lname,
                email,
                preferred_session_type,
                city_town,
                country,
                password,
                status,
                created_at
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())
        `;

    const values = [
      fname.trim(),
      (lname || '').trim(),
      email.trim(),
      preferred_session_type || null,
      (city_town || '').trim(),
      countryId,
      hashedPassword,
      status !== undefined ? Number(status) : 1
    ];

    const result = await query(insertSQL, values);

    return res.status(201).json({
      status: true,
      message: 'User created successfully',
      data: {
        user_id: result.insertId
      }
    });

  } catch (error) {
    console.error('Create user error:', error);

    return res.status(500).json({
      status: false,
      message: 'Unable to create user'
    });
  }
};

/* ============================================================
   UPDATE  –  POST /admin/api/updateUser
   ============================================================ */
exports.updateUser = (req, res) => {
  const userId = Number(req.body.user_id);
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return res.status(400).json({ status: false, message: 'Valid user_id is required' });
  }

  const { fname, lname, email, preferred_session_type, city_town, country, status } = req.body;

  if (!fname || !fname.trim()) {
    return res.status(400).json({ status: false, message: 'First name is required' });
  }
  if (!email || !email.trim()) {
    return res.status(400).json({ status: false, message: 'Email is required' });
  }

  /* Check for duplicate email on another user */
  db.query(
    'SELECT user_id FROM `user` WHERE email = ? AND user_id != ? LIMIT 1',
    [email.trim(), userId],
    (dupErr, dupRows) => {
      if (dupErr) {
        console.error('Duplicate check error:', dupErr);
        return res.status(500).json({ status: false, message: 'Database error' });
      }
      if (dupRows.length) {
        return res.json({ status: false, message: 'Email already in use by another user' });
      }

      ensureSessionTypeColumn((colErr) => {
        if (colErr) {
          console.error('Column check error:', colErr);
          return res.status(500).json({ status: false, message: 'Database setup error' });
        }

        const updateSQL = `
          UPDATE \`user\`
          SET
            fname                  = ?,
            lname                  = ?,
            email                  = ?,
            preferred_session_type = ?,
            city_town              = ?,
            country = ?,
            status                 = ?
          WHERE user_id = ?
        `;

        const values = [
          fname.trim(),
          (lname || '').trim(),
          email.trim(),
          preferred_session_type || null,
          (city_town || '').trim(),
          Number(country),
          Number(status),
          userId
        ];

        db.query(updateSQL, values, (updateErr, result) => {
          if (updateErr) {
            console.error('Update user error:', updateErr);
            return res.status(500).json({ status: false, message: 'Unable to update user' });
          }
          if (result.affectedRows === 0) {
            return res.status(404).json({ status: false, message: 'User not found' });
          }
          return res.json({ status: true, message: 'User updated successfully' });
        });
      });
    }
  );
};

/* ============================================================
   DELETE  –  POST /admin/api/deleteUser
   ============================================================ */
exports.deleteUser = (req, res) => {
  const rawIds = String(req.body.user_ids || '');
  if (!rawIds.trim()) {
    return res.status(400).json({ status: false, message: 'user_ids is required' });
  }

  /* Safely parse the comma-separated IDs */
  const ids = rawIds
    .split(',')
    .map((id) => Number(id.trim()))
    .filter((id) => Number.isSafeInteger(id) && id > 0);

  if (!ids.length) {
    return res.status(400).json({ status: false, message: 'No valid user IDs provided' });
  }

  const placeholders = ids.map(() => '?').join(', ');
  const deleteSQL = `DELETE FROM \`user\` WHERE user_id IN (${placeholders})`;

  db.query(deleteSQL, ids, (err, result) => {
    if (err) {
      console.error('Delete user error:', err);
      return res.status(500).json({ status: false, message: 'Unable to delete user(s)' });
    }
    return res.json({
      status: true,
      message: `${result.affectedRows} user(s) deleted successfully`
    });
  });
};

/* ============================================================
   ACTIVE  –  POST /admin/api/activeUser
   ============================================================ */
exports.activeUser = (req, res) => {
  const rawIds = String(req.body.user_ids || '');
  if (!rawIds.trim()) {
    return res.status(400).json({ status: false, message: 'user_ids is required' });
  }

  const ids = rawIds
    .split(',')
    .map((id) => Number(id.trim()))
    .filter((id) => Number.isSafeInteger(id) && id > 0);

  if (!ids.length) {
    return res.status(400).json({ status: false, message: 'No valid user IDs provided' });
  }

  const placeholders = ids.map(() => '?').join(', ');
  const sql = `UPDATE \`user\` SET status = 1 WHERE user_id IN (${placeholders})`;

  db.query(sql, ids, (err, result) => {
    if (err) {
      console.error('Active user error:', err);
      return res.status(500).json({ status: false, message: 'Unable to activate user(s)' });
    }
    return res.json({
      status: true,
      message: `${result.affectedRows} user(s) activated successfully`
    });
  });
};

/* ============================================================
   INACTIVE  –  POST /admin/api/inactiveUser
   ============================================================ */
exports.inactiveUser = (req, res) => {
  const rawIds = String(req.body.user_ids || '');
  if (!rawIds.trim()) {
    return res.status(400).json({ status: false, message: 'user_ids is required' });
  }

  const ids = rawIds
    .split(',')
    .map((id) => Number(id.trim()))
    .filter((id) => Number.isSafeInteger(id) && id > 0);

  if (!ids.length) {
    return res.status(400).json({ status: false, message: 'No valid user IDs provided' });
  }

  const placeholders = ids.map(() => '?').join(', ');
  const sql = `UPDATE \`user\` SET status = 0 WHERE user_id IN (${placeholders})`;

  db.query(sql, ids, (err, result) => {
    if (err) {
      console.error('Inactive user error:', err);
      return res.status(500).json({ status: false, message: 'Unable to deactivate user(s)' });
    }
    return res.json({
      status: true,
      message: `${result.affectedRows} user(s) deactivated successfully`
    });
  });
};

/* ============================================================
   COUNTRY LIST – POST /admin/api/countryList
   ============================================================ */

exports.countryList = (req, res) => {
  const sql = `
        SELECT id, name
        FROM \`countries\`
        ORDER BY name ASC
    `;

  db.query(sql, [], (err, rows) => {
    if (err) {
      console.error('Country list error:', err);

      return res.status(500).json({
        status: false,
        message: 'Unable to fetch countries'
      });
    }

    return res.status(200).json({
      status: true,
      message: 'Countries fetched successfully',
      data: rows
    });
  });
};


// ============================================
// UPDATE USER POSITIONS
// POST /admin/api/updateUserPosition
// ============================================

exports.updateUserPosition = (req, res) => {
  let users = req.body.users;

  if (typeof users === 'string') {
    try {
      users = JSON.parse(users);
    } catch {
      return res.status(400).json({
        status: false,
        message: 'Invalid users JSON'
      });
    }
  }

  if (!Array.isArray(users) || users.length === 0) {
    return res.status(400).json({
      status: false,
      message: 'Users array is required'
    });
  }

  const updates = users.map((user) => ({
    user_id: Number(user.user_id),
    position: Number(user.position)
  }));

  const ids = updates.map((user) => user.user_id);
  const positions = updates.map((user) => user.position);

  if (
    ids.some((id) => !Number.isSafeInteger(id) || id <= 0) ||
    positions.some((pos) => !Number.isSafeInteger(pos) || pos <= 0) ||
    new Set(ids).size !== ids.length ||
    new Set(positions).size !== positions.length
  ) {
    return res.status(400).json({
      status: false,
      message: 'Invalid or duplicate IDs or positions'
    });
  }

  db.getConnection((connectionError, connection) => {
    if (connectionError) {
      console.error(connectionError);

      return res.status(500).json({
        status: false,
        message: 'Database connection failed'
      });
    }

    const fail = (error, statusCode = 500) => {
      console.error('Position update failed:', error);

      connection.rollback(() => {
        connection.release();

        return res.status(statusCode).json({
          status: false,
          message:
            statusCode === 409
              ? 'User positions changed. Refresh and try again.'
              : 'Unable to update user positions'
        });
      });
    };

    connection.beginTransaction((transactionError) => {
      if (transactionError) {
        return fail(transactionError);
      }

      // Lock the user table rows to serialize reordering requests.
      connection.query(
        'SELECT user_id, position FROM `user` ORDER BY user_id FOR UPDATE',
        (selectError, allRows) => {
          if (selectError) return fail(selectError);

          const selectedRows = allRows.filter((row) =>
            ids.includes(Number(row.user_id))
          );

          if (selectedRows.length !== updates.length) {
            return fail(new Error('Some users were not found'), 409);
          }

          // Reordering must reuse the positions already owned
          // by the selected users, without affecting other users.
          const currentPositions = selectedRows
            .map((row) => Number(row.position))
            .sort((a, b) => a - b);

          const requestedPositions = [...positions].sort(
            (a, b) => a - b
          );

          if (
            currentPositions.some(
              (position, index) =>
                position !== requestedPositions[index]
            )
          ) {
            return fail(
              new Error('Requested positions do not match current positions'),
              409
            );
          }

          const maxPosition = Math.max(
            0,
            ...allRows.map((row) => Number(row.position) || 0)
          );

          if (maxPosition + updates.length > 2147483647) {
            return fail(new Error('Position limit exceeded'));
          }

          // Step 1: Move selected users to unused temporary positions.
          const temporaryUpdates = updates.map((user, index) => ({
            user_id: user.user_id,
            position: maxPosition + index + 1
          }));

          const runUpdates = (items, index, done) => {
            if (index >= items.length) {
              return done();
            }

            const user = items[index];

            connection.query(
              'UPDATE `user` SET position = ? WHERE user_id = ?',
              [user.position, user.user_id],
              (updateError) => {
                if (updateError) return done(updateError);

                runUpdates(items, index + 1, done);
              }
            );
          };

          runUpdates(temporaryUpdates, 0, (tempError) => {
            if (tempError) return fail(tempError);

            // Step 2: Assign the final positions.
            runUpdates(updates, 0, (updateError) => {
              if (updateError) return fail(updateError);

              connection.commit((commitError) => {
                if (commitError) return fail(commitError);

                connection.release();

                return res.status(200).json({
                  status: true,
                  message: 'User order saved successfully'
                });
              });
            });
          });
        }
      );
    });
  });
};