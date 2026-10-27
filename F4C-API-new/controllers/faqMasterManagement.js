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

const parseIds = (value) =>
  String(value || '')
    .split(/\s*,\s*/)
    .map(Number)
    .filter((id) => Number.isInteger(id) && id > 0);

const parsePaging = (query) => {
  const page = Math.max(1, parseInt(query.page) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 10));
  return { page, limit, offset: (page - 1) * limit };
};

/*
  Insert a row at the end of the manual order. `position` is UNIQUE, so if two inserts race
  for the same value the statement is simply retried.
*/
const insertAtEnd = async (table, columns, values) => {
  const sql = `INSERT INTO ${table} (${columns.join(', ')}, position)
               SELECT ${columns.map(() => '?').join(', ')}, COALESCE(MAX(position), 0) + 1 FROM ${table}`;
  for (let attempt = 1; ; attempt++) {
    try {
      return await queryPromise(sql, values);
    } catch (err) {
      if (err.code !== 'ER_DUP_ENTRY' || attempt >= 5) throw err;
    }
  }
};

/*
  Drag & drop: `newIds` are the rows of the current page in their new order. They are re-assigned to the
  position slots they already occupied. `position` is UNIQUE, so every row is first moved out of the way
  and then written back as 1..N (no two rows ever share a value). Returns false for unknown / duplicate ids.
*/
const reorderRows = async (table, idColumn, newIds) => {
  if (newIds.length === 0 || new Set(newIds).size !== newIds.length) return false;

  const allRows = await queryPromise(`SELECT ${idColumn} AS id FROM ${table} ORDER BY position ASC, ${idColumn} ASC`);
  const allIds = allRows.map((row) => row.id);
  const slots = allIds.map((id, index) => (newIds.includes(id) ? index : -1)).filter((index) => index >= 0);
  if (slots.length !== newIds.length) return false;

  const finalOrder = [...allIds];
  slots.forEach((slot, i) => {
    finalOrder[slot] = newIds[i];
  });

  await queryPromise(`UPDATE ${table} SET position = position + 1000000`);
  for (let i = 0; i < finalOrder.length; i++) {
    await queryPromise(`UPDATE ${table} SET position = ? WHERE ${idColumn} = ?`, [i + 1, finalOrder[i]]);
  }
  return true;
};

const serverError = (res) => res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
const fail = (res, message) => res.status(200).json(service.serviceResponse(false, '000', message));

const faqMasterManagement = {
  /* ============================================================
     FAQ CATEGORY
     ============================================================ */
  faqCategoryList: async (req, res) => {
    try {
      const sortable = {
        faq_category_id: 'c.faq_category_id',
        position: 'c.position',
        title: 'c.title',
        status: 'c.status',
        faq_count: 'faq_count',
        created_at: 'c.created_at'
      };
      const order = sortable[req.query.order] || 'c.position';
      const dir = req.query.desc === 'true' ? 'DESC' : 'ASC';
      const search = (req.query.search || '').trim();
      const status = req.query.status !== undefined ? String(req.query.status) : 'all';
      const { page, limit, offset } = parsePaging(req.query);

      const where = [];
      const params = [];
      if (search) {
        where.push('c.title LIKE ?');
        params.push(`%${search}%`);
      }
      if (['0', '1'].includes(status)) {
        where.push('c.status = ?');
        params.push(Number(status));
      }
      const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

      const count = await queryPromise(`SELECT COUNT(*) AS total FROM faq_category c ${whereClause}`, params);
      const total = count[0].total;

      const rows = await queryPromise(
        `SELECT c.*, (SELECT COUNT(*) FROM faq f WHERE f.category_id = c.faq_category_id) AS faq_count
         FROM faq_category c ${whereClause}
         ORDER BY ${order} ${dir}, c.faq_category_id ASC LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      return res.status(200).json(
        service.serviceResponse(true, '000', errorMessages.success, {
          data: rows,
          pagination: { totalRecords: total, totalPages: Math.ceil(total / limit), currentPage: page, limit }
        })
      );
    } catch (err) {
      console.error('faqCategoryList error:', err);
      return serverError(res);
    }
  },

  /* Categories for the FAQ form dropdown and filter with linked FAQ count */
  faqCategoryOptions: async (req, res) => {
    try {
      const rows = await queryPromise(
        `SELECT c.faq_category_id, c.title, c.status,
                (SELECT COUNT(*) FROM faq f WHERE f.category_id = c.faq_category_id) AS faq_count
         FROM faq_category c
         ORDER BY c.position ASC, c.faq_category_id ASC`
      );
      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success, rows));
    } catch (err) {
      console.error('faqCategoryOptions error:', err);
      return serverError(res);
    }
  },

  createFaqCategory: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['title', 'status']));
      if (_.isEmpty(params.title) || !['0', '1'].includes(String(params.status))) {
        return fail(res, errorMessages.missingParamError);
      }
      if (params.title.length > 150) return fail(res, 'Title must be 150 characters or less.');

      const dup = await queryPromise('SELECT faq_category_id FROM faq_category WHERE title = ?', [params.title]);
      if (dup.length > 0) return fail(res, errorMessages.sameRecordAlreadyExistError);

      const result = await insertAtEnd('faq_category', ['title', 'status', 'created_at'], [params.title, Number(params.status), new Date()]);
      return res.status(200).json(
        service.serviceResponse(true, '000', errorMessages.success, { faq_category_id: result.insertId, title: params.title })
      );
    } catch (err) {
      console.error('createFaqCategory error:', err);
      return serverError(res);
    }
  },

  updateFaqCategory: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['faq_category_id', 'title', 'status']));
      if (_.isEmpty(params.faq_category_id) || _.isEmpty(params.title) || !['0', '1'].includes(String(params.status))) {
        return fail(res, errorMessages.missingParamError);
      }
      if (params.title.length > 150) return fail(res, 'Title must be 150 characters or less.');

      const dup = await queryPromise('SELECT faq_category_id FROM faq_category WHERE title = ? AND faq_category_id != ?', [
        params.title,
        params.faq_category_id
      ]);
      if (dup.length > 0) return fail(res, errorMessages.sameRecordAlreadyExistError);

      const result = await queryPromise('UPDATE faq_category SET title = ?, status = ? WHERE faq_category_id = ?', [
        params.title,
        Number(params.status),
        params.faq_category_id
      ]);
      if (result.affectedRows === 0) return fail(res, errorMessages.invalidIdError);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success, { faq_category_id: params.faq_category_id }));
    } catch (err) {
      console.error('updateFaqCategory error:', err);
      return serverError(res);
    }
  },

  deleteFaqCategory: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['faq_category_ids']));
      const ids = parseIds(params.faq_category_ids);
      if (ids.length === 0) return fail(res, errorMessages.missingParamError);

      /* Cascade delete all FAQs that belong to these categories */
      await queryPromise('DELETE FROM faq WHERE category_id IN (?)', [ids]);

      /* Delete the category rows */
      await queryPromise('DELETE FROM faq_category WHERE faq_category_id IN (?)', [ids]);
      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      console.error('deleteFaqCategory error:', err);
      return serverError(res);
    }
  },

  activeFaqCategory: async (req, res) => {
    try {
      const ids = parseIds(_.get(req.body, 'faq_category_ids'));
      if (ids.length === 0) return fail(res, errorMessages.missingParamError);
      await queryPromise('UPDATE faq_category SET status = 1 WHERE faq_category_id IN (?)', [ids]);
      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      console.error('activeFaqCategory error:', err);
      return serverError(res);
    }
  },

  inactiveFaqCategory: async (req, res) => {
    try {
      const ids = parseIds(_.get(req.body, 'faq_category_ids'));
      if (ids.length === 0) return fail(res, errorMessages.missingParamError);
      await queryPromise('UPDATE faq_category SET status = 0 WHERE faq_category_id IN (?)', [ids]);
      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      console.error('inactiveFaqCategory error:', err);
      return serverError(res);
    }
  },

  updateFaqCategoryPosition: async (req, res) => {
    try {
      const ok = await reorderRows('faq_category', 'faq_category_id', parseIds(_.get(req.body, 'faq_category_ids')));
      if (!ok) return fail(res, errorMessages.invalidIdError);
      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      console.error('updateFaqCategoryPosition error:', err);
      return serverError(res);
    }
  },

  /* ============================================================
     FAQ  (each FAQ belongs to a category through category_id)
     ============================================================ */
  faqList: async (req, res) => {
    try {
      const sortable = {
        faq_id: 'f.faq_id',
        position: 'f.position',
        question: 'f.question',
        category_title: 'c.title',
        status: 'f.status',
        created_at: 'f.created_at'
      };
      const order = sortable[req.query.order] || 'f.position';
      const dir = req.query.desc === 'true' ? 'DESC' : 'ASC';
      const search = (req.query.search || '').trim();
      const status = req.query.status !== undefined ? String(req.query.status) : 'all';
      const categoryId = parseInt(req.query.category_id) || 0;
      const { page, limit, offset } = parsePaging(req.query);

      const where = [];
      const params = [];
      if (search) {
        where.push('(f.question LIKE ? OR f.answer LIKE ? OR c.title LIKE ?)');
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
      if (['0', '1'].includes(status)) {
        where.push('f.status = ?');
        params.push(Number(status));
      }
      if (categoryId) {
        where.push('f.category_id = ?');
        params.push(categoryId);
      }
      const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';
      const from = 'FROM faq f JOIN faq_category c ON c.faq_category_id = f.category_id';

      const count = await queryPromise(`SELECT COUNT(*) AS total ${from} ${whereClause}`, params);
      const total = count[0].total;

      const rows = await queryPromise(
        `SELECT f.*, c.title AS category_title, c.status AS category_status ${from} ${whereClause}
         ORDER BY ${order} ${dir}, f.faq_id ASC LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      return res.status(200).json(
        service.serviceResponse(true, '000', errorMessages.success, {
          data: rows,
          pagination: { totalRecords: total, totalPages: Math.ceil(total / limit), currentPage: page, limit }
        })
      );
    } catch (err) {
      console.error('faqList error:', err);
      return serverError(res);
    }
  },

  createFaq: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['category_id', 'question', 'answer', 'status']));
      if (
        _.isEmpty(String(params.category_id || '')) ||
        _.isEmpty(params.question) ||
        _.isEmpty(params.answer) ||
        !['0', '1'].includes(String(params.status))
      ) {
        return fail(res, errorMessages.missingParamError);
      }
      if (params.question.length > 255) return fail(res, 'Question must be 255 characters or less.');

      const category = await queryPromise('SELECT faq_category_id FROM faq_category WHERE faq_category_id = ?', [params.category_id]);
      if (category.length === 0) return fail(res, 'Please select a valid FAQ category.');

      const result = await insertAtEnd(
        'faq',
        ['category_id', 'question', 'answer', 'status', 'created_at'],
        [params.category_id, params.question, params.answer, Number(params.status), new Date()]
      );
      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success, { faq_id: result.insertId }));
    } catch (err) {
      console.error('createFaq error:', err);
      return serverError(res);
    }
  },

  updateFaq: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['faq_id', 'category_id', 'question', 'answer', 'status']));
      if (
        _.isEmpty(String(params.faq_id || '')) ||
        _.isEmpty(String(params.category_id || '')) ||
        _.isEmpty(params.question) ||
        _.isEmpty(params.answer) ||
        !['0', '1'].includes(String(params.status))
      ) {
        return fail(res, errorMessages.missingParamError);
      }
      if (params.question.length > 255) return fail(res, 'Question must be 255 characters or less.');

      const category = await queryPromise('SELECT faq_category_id FROM faq_category WHERE faq_category_id = ?', [params.category_id]);
      if (category.length === 0) return fail(res, 'Please select a valid FAQ category.');

      const result = await queryPromise('UPDATE faq SET category_id = ?, question = ?, answer = ?, status = ? WHERE faq_id = ?', [
        params.category_id,
        params.question,
        params.answer,
        Number(params.status),
        params.faq_id
      ]);
      if (result.affectedRows === 0) return fail(res, errorMessages.invalidIdError);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success, { faq_id: params.faq_id }));
    } catch (err) {
      console.error('updateFaq error:', err);
      return serverError(res);
    }
  },

  deleteFaq: async (req, res) => {
    try {
      const ids = parseIds(_.get(req.body, 'faq_ids'));
      if (ids.length === 0) return fail(res, errorMessages.missingParamError);
      await queryPromise('DELETE FROM faq WHERE faq_id IN (?)', [ids]);
      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      console.error('deleteFaq error:', err);
      return serverError(res);
    }
  },

  activeFaq: async (req, res) => {
    try {
      const ids = parseIds(_.get(req.body, 'faq_ids'));
      if (ids.length === 0) return fail(res, errorMessages.missingParamError);
      await queryPromise('UPDATE faq SET status = 1 WHERE faq_id IN (?)', [ids]);
      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      console.error('activeFaq error:', err);
      return serverError(res);
    }
  },

  inactiveFaq: async (req, res) => {
    try {
      const ids = parseIds(_.get(req.body, 'faq_ids'));
      if (ids.length === 0) return fail(res, errorMessages.missingParamError);
      await queryPromise('UPDATE faq SET status = 0 WHERE faq_id IN (?)', [ids]);
      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      console.error('inactiveFaq error:', err);
      return serverError(res);
    }
  },

  updateFaqPosition: async (req, res) => {
    try {
      const ok = await reorderRows('faq', 'faq_id', parseIds(_.get(req.body, 'faq_ids')));
      if (!ok) return fail(res, errorMessages.invalidIdError);
      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      console.error('updateFaqPosition error:', err);
      return serverError(res);
    }
  }
};

module.exports = faqMasterManagement;
