const service = require('../common/service');
const db = require('../db/db');
const { _ } = require('lodash');
const errorMessages = require('../common/errorMessages');

const queryPromise = (sql, values = []) => {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

/* Allowed sorting whitelist to prevent SQL injection */
const allowedSortColumns = {
  resource_id: 'r.resource_id',
  position: 'r.position',
  title: 'r.title',
  author: 'author',
  author_name: 'author',
  reading_time: 'r.reading_time',
  status: 'r.status',
  created_at: 'r.created_at',
  updated_at: 'r.updated_at'
};

const resourceManagement = {
  /* ============================================================
     LIST - POST /admin/api/resourceList
     ============================================================ */
  resourceList: async (req, res) => {
    try {
      const q = { ...req.query, ...req.body };
      const orderKey = q.order || 'created_at';
      const order = allowedSortColumns[orderKey] || 'r.created_at';
      const desc = q.desc === 'true' || q.desc === true || q.desc === 'desc' || q.desc === 'DESC';
      const dir = desc ? 'DESC' : 'ASC';

      const search = (q.search || '').trim();
      const status = q.status !== undefined && q.status !== null ? String(q.status).trim() : 'all';
      const authorType = (q.author_type || q.authorType || 'all').toLowerCase().trim();
      const topic = q.topic !== undefined && q.topic !== null ? String(q.topic).trim() : 'all';

      const page = Math.max(1, parseInt(q.page, 10) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(q.limit, 10) || 10));
      const offset = (page - 1) * limit;

      const whereConditions = [];
      const whereParams = [];

      // Search by title or short_description
      if (search) {
        whereConditions.push('(r.title LIKE ? OR r.short_description LIKE ?)');
        whereParams.push(`%${search}%`, `%${search}%`);
      }

      // Filter by status (1 = Active, 0 = Inactive)
      if (status !== 'all' && status !== '') {
        whereConditions.push('r.status = ?');
        whereParams.push(Number(status));
      }

      // Filter by author type (admin vs counsellor)
      if (authorType === 'admin') {
        whereConditions.push('r.admin_id IS NOT NULL');
      } else if (authorType === 'counsellor') {
        whereConditions.push('r.counsellor_id IS NOT NULL');
      }

      // Filter by topic (counselling_area_id)
      if (topic !== 'all' && topic !== '') {
        whereConditions.push('(rca.counselling_area_id = ? OR FIND_IN_SET(?, r.tags) > 0)');
        whereParams.push(Number(topic), String(topic));
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      // Count query
      const countSql = `
        SELECT COUNT(DISTINCT r.resource_id) AS total
        FROM resources AS r
        LEFT JOIN admins AS a ON a.admin_id = r.admin_id
        LEFT JOIN counsellor AS c ON c.c_id = r.counsellor_id
        LEFT JOIN resource_counselling_area AS rca ON rca.resource_id = r.resource_id
        ${whereClause}
      `;

      const countResult = await queryPromise(countSql, whereParams);
      const total = countResult[0]?.total || 0;
      const totalPages = Math.ceil(total / limit);

      // Data query
      const dataSql = `
        SELECT 
          r.resource_id,
          r.position,
          r.title,
          r.short_description,
          r.description,
          r.image,
          r.alt_text,
          r.reading_time,
          r.tags,
          r.status,
          r.admin_id,
          r.counsellor_id,
          r.created_at,
          r.updated_at,
          IF(r.admin_id IS NOT NULL, 'Admin', 
            TRIM(CONCAT(COALESCE(c.title, ''), ' ', COALESCE(c.fname, ''), ' ', COALESCE(c.lname, '')))
          ) AS author,
          IF(r.admin_id IS NOT NULL, 'Admin', 'Counsellor') AS author_type,
          GROUP_CONCAT(DISTINCT ca.counselling_area ORDER BY ca.counselling_area SEPARATOR ', ') AS topic,
          GROUP_CONCAT(DISTINCT ca.counselling_area_id) AS topic_ids
        FROM resources AS r
        LEFT JOIN admins AS a ON a.admin_id = r.admin_id
        LEFT JOIN counsellor AS c ON c.c_id = r.counsellor_id
        LEFT JOIN resource_counselling_area AS rca ON rca.resource_id = r.resource_id
        LEFT JOIN counselling_area AS ca ON (ca.counselling_area_id = rca.counselling_area_id OR FIND_IN_SET(ca.counselling_area_id, r.tags) > 0)
        ${whereClause}
        GROUP BY r.resource_id
        ORDER BY ${order} ${dir}, r.resource_id ASC
        LIMIT ? OFFSET ?
      `;

      const rows = await queryPromise(dataSql, [...whereParams, limit, offset]);

      const formattedData = rows.map((item) => {
        let imageUrl = '';
        if (item.image) {
          if (item.image.startsWith('http://') || item.image.startsWith('https://')) {
            imageUrl = item.image;
          } else {
            imageUrl = `${req.protocol}://${req.get('host')}/uploads/resource_images/${item.image}`;
          }
        }
        return {
          ...item,
          author: item.author && item.author.trim() ? item.author.trim() : (item.admin_id ? 'Admin' : 'Counsellor'),
          image: imageUrl,
          alt_text: item.alt_text || ''
        };
      });

      return res.status(200).json(
        service.serviceResponse(true, '000', errorMessages.success, {
          data: formattedData,
          pagination: {
            totalRecords: total,
            totalPages,
            currentPage: page,
            limit
          }
        })
      );
    } catch (err) {
      console.error('resourceList error:', err);
      return res.status(200).json(service.serviceResponse(false, '333', err.message || errorMessages.serverError));
    }
  },

  /* ============================================================
     DETAILS - POST /admin/api/resourceDetails
     ============================================================ */
  resourceDetails: async (req, res) => {
    try {
      const resource_id = Number(req.body.resource_id || req.query.resource_id);
      if (!resource_id) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const sql = `
        SELECT 
          r.*,
          IF(r.admin_id IS NOT NULL, 'Admin', 
            TRIM(CONCAT(COALESCE(c.title, ''), ' ', COALESCE(c.fname, ''), ' ', COALESCE(c.lname, '')))
          ) AS author,
          IF(r.admin_id IS NOT NULL, 'Admin', 'Counsellor') AS author_type,
          GROUP_CONCAT(DISTINCT ca.counselling_area ORDER BY ca.counselling_area SEPARATOR ', ') AS topic,
          GROUP_CONCAT(DISTINCT ca.counselling_area_id) AS topic_ids
        FROM resources AS r
        LEFT JOIN admins AS a ON a.admin_id = r.admin_id
        LEFT JOIN counsellor AS c ON c.c_id = r.counsellor_id
        LEFT JOIN resource_counselling_area AS rca ON rca.resource_id = r.resource_id
        LEFT JOIN counselling_area AS ca ON (ca.counselling_area_id = rca.counselling_area_id OR FIND_IN_SET(ca.counselling_area_id, r.tags) > 0)
        WHERE r.resource_id = ?
        GROUP BY r.resource_id
      `;

      const rows = await queryPromise(sql, [resource_id]);
      if (!rows.length) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.noRecordFoundError));
      }

      const item = rows[0];
      let imageUrl = '';
      if (item.image) {
        if (item.image.startsWith('http://') || item.image.startsWith('https://')) {
          imageUrl = item.image;
        } else {
          imageUrl = `${req.protocol}://${req.get('host')}/uploads/resource_images/${item.image}`;
        }
      }

      return res.status(200).json(
        service.serviceResponse(true, '000', errorMessages.success, {
          ...item,
          image: imageUrl
        })
      );
    } catch (err) {
      console.error('resourceDetails error:', err);
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  /* ============================================================
     ADD - POST /admin/api/addResource
     ============================================================ */
  addResource: async (req, res) => {
    try {
      const params = await service.trimObject(
        _.pick(req.body, [
          'title',
          'short_description',
          'description',
          'reading_time',
          'tags',
          'topic',
          'admin_id',
          'status',
          'alt_text',
          'title_colour'
        ])
      );

      if (
        _.isEmpty(params.title) ||
        _.isEmpty(params.short_description) ||
        _.isEmpty(params.description) ||
        _.isEmpty(params.reading_time)
      ) {
        service.deleteUploadedFiles(req.files);
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      // Handle image (optional)
      const isAltTextOnly = req.body.image_type === 'alt_text' || req.body.remove_image === '1' || req.body.remove_image === 'true';
      if (isAltTextOnly) {
        service.deleteUploadedFiles(req.files);
        params.image = null;
      } else if (req.files && req.files.image && req.files.image.length > 0) {
        params.image = req.files.image[0].filename;
      } else if (req.body.image && typeof req.body.image === 'string' && req.body.image.trim() !== '' && req.body.image !== 'null' && req.body.image !== 'undefined') {
        params.image = req.body.image.trim();
      } else {
        params.image = null;
      }

      const tagsVal = params.tags || params.topic || '';
      const tagsArray = Array.isArray(tagsVal)
        ? tagsVal
        : String(tagsVal).split(',').map((t) => t.trim()).filter(Boolean);
      const tagsString = tagsArray.join(',');

      const admin_id = req.user?.admin_id || params.admin_id || 1;

      // Duplicate title check
      const dupCheck = await queryPromise('SELECT resource_id FROM resources WHERE title = ?', [params.title]);
      if (dupCheck.length > 0) {
        service.deleteUploadedFiles(req.files);
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.sameRecordAlreadyExistError));
      }

      /* New resources go to the end of the manual order */
      const maxPos = await queryPromise('SELECT COALESCE(MAX(position), 0) AS max_position FROM resources');
      const nextPosition = (maxPos[0]?.max_position || 0) + 1;

      const insertSql = `
        INSERT INTO resources (
          title, short_description, description, reading_time,
          tags, status, admin_id, counsellor_id, image, alt_text, position, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, NULL, ?, ?, ?, NOW())
      `;

      const insertResult = await queryPromise(insertSql, [
        params.title,
        params.short_description,
        params.description,
        Number(params.reading_time) || 1,
        tagsString,
        params.status !== undefined ? Number(params.status) : 1,
        admin_id,
        params.image,
        params.alt_text || '',
        nextPosition
      ]);

      const resource_id = insertResult.insertId;

      // Sync resource_counselling_area
      if (tagsArray.length > 0) {
        const areaValues = tagsArray.map((ca_id) => [resource_id, Number(ca_id)]);
        for (const [rId, cId] of areaValues) {
          if (cId) {
            await queryPromise(
              'INSERT INTO resource_counselling_area (resource_id, counselling_area_id) VALUES (?, ?)',
              [rId, cId]
            );
          }
        }
      }

      const imagePath = params.image ? `${req.protocol}://${req.get('host')}/uploads/resource_images/${params.image}` : '';

      return res.status(200).json(
        service.serviceResponse(true, '000', 'Resource added successfully', {
          resource_id,
          title: params.title,
          image: imagePath,
          short_description: params.short_description,
          description: params.description,
          reading_time: params.reading_time,
          tags: tagsString,
          alt_text: params.alt_text,
          title_colour: params.title_colour,
          status: params.status !== undefined ? Number(params.status) : 1,
          admin_id
        })
      );
    } catch (err) {
      console.error('addResource error:', err);
      return res.status(200).json(service.serviceResponse(false, '333', err.message || errorMessages.serverError));
    }
  },

  /* ============================================================
     UPDATE - POST /admin/api/updateResource
     ============================================================ */
  updateResource: async (req, res) => {
    try {
      const params = await service.trimObject(
        _.pick(req.body, [
          'resource_id',
          'title',
          'short_description',
          'description',
          'reading_time',
          'tags',
          'topic',
          'admin_id',
          'status',
          'alt_text',
          'title_colour'
        ])
      );

      const resource_id = Number(params.resource_id);
      if (!resource_id) {
        service.deleteUploadedFiles(req.files);
        return res.status(200).json(service.serviceResponse(false, '000', 'Resource ID is required'));
      }

      if (
        _.isEmpty(params.title) ||
        _.isEmpty(params.short_description) ||
        _.isEmpty(params.description) ||
        _.isEmpty(params.reading_time)
      ) {
        service.deleteUploadedFiles(req.files);
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      // Check duplicate title with other resources
      const dupCheck = await queryPromise(
        'SELECT resource_id FROM resources WHERE title = ? AND resource_id != ?',
        [params.title, resource_id]
      );
      if (dupCheck.length > 0) {
        service.deleteUploadedFiles(req.files);
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.sameRecordAlreadyExistError));
      }

      const tagsVal = params.tags || params.topic || '';
      const tagsArray = Array.isArray(tagsVal)
        ? tagsVal
        : String(tagsVal).split(',').map((t) => t.trim()).filter(Boolean);
      const tagsString = tagsArray.join(',');

      // If new image uploaded
      let newImage = null;
      if (req.files && req.files.image && req.files.image.length > 0) {
        newImage = req.files.image[0].filename;
      }

      const removeImage = req.body.remove_image === '1' || req.body.remove_image === 'true' || req.body.image_type === 'alt_text';
      if (removeImage && req.files) {
        service.deleteUploadedFiles(req.files);
        newImage = null;
      }

      const altText = params.alt_text !== undefined ? params.alt_text : '';

      let updateSql = '';
      let updateParams = [];

      if (newImage) {
        updateSql = `
          UPDATE resources 
          SET title = ?, short_description = ?, description = ?, reading_time = ?,
              tags = ?, status = ?, image = ?, alt_text = ?, updated_at = NOW()
          WHERE resource_id = ?
        `;
        updateParams = [
          params.title,
          params.short_description,
          params.description,
          Number(params.reading_time) || 1,
          tagsString,
          params.status !== undefined ? Number(params.status) : 1,
          newImage,
          altText,
          resource_id
        ];
      } else if (removeImage) {
        updateSql = `
          UPDATE resources 
          SET title = ?, short_description = ?, description = ?, reading_time = ?,
              tags = ?, status = ?, image = NULL, alt_text = ?, updated_at = NOW()
          WHERE resource_id = ?
        `;
        updateParams = [
          params.title,
          params.short_description,
          params.description,
          Number(params.reading_time) || 1,
          tagsString,
          params.status !== undefined ? Number(params.status) : 1,
          altText,
          resource_id
        ];
      } else {
        updateSql = `
          UPDATE resources 
          SET title = ?, short_description = ?, description = ?, reading_time = ?,
              tags = ?, status = ?, alt_text = ?, updated_at = NOW()
          WHERE resource_id = ?
        `;
        updateParams = [
          params.title,
          params.short_description,
          params.description,
          Number(params.reading_time) || 1,
          tagsString,
          params.status !== undefined ? Number(params.status) : 1,
          altText,
          resource_id
        ];
      }

      await queryPromise(updateSql, updateParams);

      // Re-sync resource_counselling_area
      await queryPromise('DELETE FROM resource_counselling_area WHERE resource_id = ?', [resource_id]);
      if (tagsArray.length > 0) {
        for (const ca_id of tagsArray) {
          if (Number(ca_id)) {
            await queryPromise(
              'INSERT INTO resource_counselling_area (resource_id, counselling_area_id) VALUES (?, ?)',
              [resource_id, Number(ca_id)]
            );
          }
        }
      }

      return res.status(200).json(
        service.serviceResponse(true, '000', 'Resource updated successfully', {
          resource_id,
          title: params.title
        })
      );
    } catch (err) {
      console.error('updateResource error:', err);
      return res.status(200).json(service.serviceResponse(false, '333', err.message || errorMessages.serverError));
    }
  },

  /* ============================================================
     DELETE - POST /admin/api/deleteResource
     ============================================================ */
  deleteResource: async (req, res) => {
    try {
      const rawIds = req.body.resource_ids || req.body.resource_id;
      if (!rawIds) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const idArray = (Array.isArray(rawIds) ? rawIds : String(rawIds).split(/[\s,]+/))
        .map((id) => Number(id))
        .filter(Boolean);

      if (idArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      // Check if any belong to a counsellor and notify them
      for (const resId of idArray) {
        const rows = await queryPromise(
          'SELECT counsellor_id, title FROM resources WHERE resource_id = ? AND counsellor_id IS NOT NULL',
          [resId]
        );
        if (rows.length > 0) {
          const { counsellor_id, title } = rows[0];
          await queryPromise(
            `INSERT INTO counsellor_notification (counsellor_id, resource_id, title, message, reason, created_at)
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [
              counsellor_id,
              resId,
              'Your resource was deleted',
              `Your resource "${title}" was removed by the administrator.`,
              req.body.reason || 'Resource removed by administrator'
            ]
          );
        }
      }

      for (const resId of idArray) {
        await queryPromise('DELETE FROM resource_counselling_area WHERE resource_id = ?', [resId]);
        await queryPromise('DELETE FROM resources WHERE resource_id = ?', [resId]);
      }

      return res.status(200).json(service.serviceResponse(true, '000', 'Resource(s) deleted successfully'));
    } catch (err) {
      console.error('deleteResource error:', err);
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  /* ============================================================
     REORDER - POST /admin/api/updateResourcePosition
     resource_ids: ids of the rows on the current page, in their new order.
     They are re-assigned to the same position slots they occupied before.
     ============================================================ */
  updateResourcePosition: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['resource_ids']));
      if (_.isEmpty(params.resource_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const newIds = String(params.resource_ids)
        .split(/\s*,\s*/)
        .map(Number)
        .filter(Boolean);
      if (newIds.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const allRows = await queryPromise('SELECT resource_id FROM resources ORDER BY position ASC, resource_id ASC');
      const allIds = allRows.map((row) => row.resource_id);
      const slots = allIds.map((id, index) => (newIds.includes(id) ? index : -1)).filter((index) => index >= 0);

      if (slots.length !== newIds.length) {
        return res.status(200).json(service.serviceResponse(false, '000', 'Invalid IDs in request.'));
      }

      /* Put the page's rows into the slots they already occupied, in their new order */
      const finalOrder = [...allIds];
      slots.forEach((slot, i) => {
        finalOrder[slot] = newIds[i];
      });

      /* position has a UNIQUE index: move everything out of the way first so no two rows ever share a value */
      await queryPromise('UPDATE resources SET position = position + 1000000');
      for (let i = 0; i < finalOrder.length; i++) {
        await queryPromise('UPDATE resources SET position = ? WHERE resource_id = ?', [i + 1, finalOrder[i]]);
      }

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      console.error('updateResourcePosition error:', err);
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  /* ============================================================
     ACTIVE - POST /admin/api/activeResource
     ============================================================ */
  activeResource: async (req, res) => {
    try {
      const rawIds = req.body.resource_ids || req.body.resource_id;
      if (!rawIds) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const idArray = (Array.isArray(rawIds) ? rawIds : String(rawIds).split(/[\s,]+/))
        .map((id) => Number(id))
        .filter(Boolean);

      if (idArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      for (const resId of idArray) {
        await queryPromise('UPDATE resources SET status = 1 WHERE resource_id = ?', [resId]);
      }

      return res.status(200).json(service.serviceResponse(true, '000', 'Resource(s) activated successfully'));
    } catch (err) {
      console.error('activeResource error:', err);
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  /* ============================================================
     INACTIVE - POST /admin/api/inactiveResource
     ============================================================ */
  inactiveResource: async (req, res) => {
    try {
      const rawIds = req.body.resource_ids || req.body.resource_id;
      const reason = req.body.reason || 'Resource was set to Inactive by Admin';

      if (!rawIds) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const idArray = (Array.isArray(rawIds) ? rawIds : String(rawIds).split(/[\s,]+/))
        .map((id) => Number(id))
        .filter(Boolean);

      if (idArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      for (const resId of idArray) {
        await queryPromise('UPDATE resources SET status = 0 WHERE resource_id = ?', [resId]);

        // Send in-app notification to counsellor if Resource belongs to counsellor
        const rows = await queryPromise(
          'SELECT counsellor_id, title FROM resources WHERE resource_id = ? AND counsellor_id IS NOT NULL',
          [resId]
        );
        if (rows.length > 0) {
          const { counsellor_id, title } = rows[0];
          await queryPromise(
            `INSERT INTO counsellor_notification (counsellor_id, resource_id, title, message, reason, created_at)
             VALUES (?, ?, ?, ?, ?, NOW())`,
            [
              counsellor_id,
              resId,
              'Your Resource was hidden',
              `Your Resource "${title}" was set to Inactive. Reason: ${reason}`,
              reason
            ]
          );
        }
      }

      return res.status(200).json(service.serviceResponse(true, '000', 'Resource(s) deactivated successfully'));
    } catch (err) {
      console.error('inactiveResource error:', err);
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  }
};

module.exports = resourceManagement;
