const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const service = require('../common/service');
const db = require('../db/db');
const { _ } = require('lodash');
const errorMessages = require('../common/errorMessages');

const queryPromise = async (sql, values) => {
  return new Promise((resolve, reject) => {
    db.query(sql, values, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

module.exports = {
  /* Admin Login API Start */
  login: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['email', 'password']));

      if (_.isEmpty(params.email) || _.isEmpty(params.password)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }
      if (!service.validateEmail(params.email)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidEmailError));
      }

      db.query('SELECT * FROM admins WHERE email = ?', [params.email], (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }
        if (results.length === 0) {
          return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidLoginDetailsError));
        }

        const admin = results[0];

        if (admin.status === 0) {
          return res.status(200).json(service.serviceResponse(false, '000', errorMessages.accountNotActiveError));
        }

        bcrypt.compare(params.password, admin.password, (err, isMatch) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err));
          }
          if (!isMatch) {
            return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidLoginDetailsError));
          }

          const token = jwt.sign({ admin_id: admin.admin_id }, process.env.JWT_SECRET, {
            expiresIn: '2h'
          });

          db.query('UPDATE admins SET token = ? WHERE admin_id = ?', [token, admin.admin_id], (err, results) => {
            if (err) {
              return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
            }

            return res.status(200).json(
              service.serviceResponse(true, '000', errorMessages.success, {
                admin_id: admin.admin_id,
                name: admin.name,
                username: admin.username,
                email: admin.email,
                token: token
              })
            );
          });
        });
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  adminsList: async (req, res) => {
    try {
      /* Fetch updated paginated data */
      const order = req.query.order || 'created_at';
      const desc = req.query.desc;
      const dir = desc === 'true' ? 'DESC' : 'ASC';
      const search = req.query.search || '';
      const status = req.query.status || 'all';

      const page = parseInt(req.query.page) || 1; /* Default to page 1 */
      const limit = parseInt(req.query.limit) || 10; /* Default to 10 items per page */
      const offset = (page - 1) * limit;

      /* Construct query dynamically */
      let whereConditions = [];

      /* Add search condition */
      if (search) {
        whereConditions.push(`(name LIKE '%${search}%' OR email LIKE '%${search}%' OR username LIKE '%${search}%')`);
      }

      /* Add status filter */
      if (status !== 'all') {
        whereConditions.push(`status = '${status}'`);
      }

      /* Combine where clause */
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      /* Construct query dynamically */
      dataQuery = `SELECT * FROM admins ${whereClause} ORDER BY ${order} ${dir} LIMIT ? OFFSET ?`;
      countQuery = `SELECT COUNT(*) AS total FROM admins ${whereClause}`;

      /* Execute the count query */
      db.query(countQuery, (err, countResult) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        /* Execute the data query */
        db.query(dataQuery, [limit, offset], (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          /* Return the paginated data along with metadata */
          return res.status(200).json(
            service.serviceResponse(true, '000', errorMessages.success, {
              data: results,
              pagination: {
                totalRecords: total,
                totalPages,
                currentPage: page,
                limit
              }
            })
          );
        });
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  createAdmin: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['name', 'username', 'email', 'password', 'status']));

      if (
        _.isEmpty(params.name) ||
        _.isEmpty(params.username) ||
        _.isEmpty(params.email) ||
        _.isEmpty(params.password) ||
        _.isEmpty(params.status)
      ) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      if (!service.validateEmail(params.email)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidEmailError));
      }

      const password = await service.hashPassword(params.password);

      db.query('SELECT * FROM admins WHERE email = ? OR username = ?', [params.email, params.username], (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }
        if (results.length >= 1) {
          return res.status(200).json(service.serviceResponse(false, '000', errorMessages.emailOrUsernameAlreadyRegisteredError));
        } else {
          db.query(
            'INSERT INTO admins (name, username, email, password, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [params.name, params.username, params.email, password, params.status, new Date()],
            (err, results) => {
              if (err) {
                return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
              }
              return res.status(200).json(
                service.serviceResponse(true, '000', errorMessages.success, {
                  admin_id: results.insertId,
                  name: params.name,
                  username: params.username,
                  email: params.email,
                  status: params.status
                })
              );
            }
          );
        }
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateAdmin: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['admin_id', 'name', 'username', 'email', 'status']));

      if (
        _.isEmpty(params.admin_id) ||
        _.isEmpty(params.name) ||
        _.isEmpty(params.username) ||
        _.isEmpty(params.email) ||
        _.isEmpty(params.status)
      ) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      if (!service.validateEmail(params.email)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidEmailError));
      }

      db.query(
        'SELECT * FROM admins WHERE (email = ? OR username = ?) AND admin_id != ?',
        [params.email, params.username, params.admin_id],
        (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          if (results.length >= 1) {
            return res.status(200).json(service.serviceResponse(false, '000', errorMessages.emailOrUsernameAlreadyRegisteredError));
          } else {
            db.query(
              'UPDATE admins SET name = ?, username = ?, email = ?, status = ? WHERE admin_id = ?',
              [params.name, params.username, params.email, params.status, params.admin_id],
              (err, results) => {
                if (err) {
                  return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
                }
                return res.status(200).json(
                  service.serviceResponse(true, '000', errorMessages.success, {
                    admin_id: params.admin_id,
                    name: params.name,
                    username: params.username,
                    email: params.email,
                    status: params.status
                  })
                );
              }
            );
          }
        }
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  deleteAdmin: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['admin_ids']));

      if (_.isEmpty(params.admin_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const adminIdsArray = params.admin_ids.split(/\s*,\s*/);

      if (!Array.isArray(adminIdsArray) || adminIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const deleteQueries = [];
      deleteQueries.push(
        adminIdsArray.map((admin_id, index) => {
          return db.query('DELETE FROM admins WHERE admin_id = ?', [admin_id]);
        })
      );

      await Promise.all(deleteQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  activeAdmin: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['admin_ids']));

      if (_.isEmpty(params.admin_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const adminIdsArray = params.admin_ids.split(/\s*,\s*/);

      if (!Array.isArray(adminIdsArray) || adminIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        adminIdsArray.map((admin_id, index) => {
          return db.query('UPDATE admins SET status = ? WHERE admin_id = ?', [1, admin_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  inactiveAdmin: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['admin_ids']));

      if (_.isEmpty(params.admin_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const adminIdsArray = params.admin_ids.split(/\s*,\s*/);

      if (!Array.isArray(adminIdsArray) || adminIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        adminIdsArray.map((admin_id, index) => {
          return db.query('UPDATE admins SET status = ? WHERE admin_id = ?', [0, admin_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  changePasswordAdmin: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['admin_id', 'current_password', 'new_password']));

      if (_.isEmpty(params.admin_id) || _.isEmpty(params.current_password) || _.isEmpty(params.new_password)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const new_password = await service.hashPassword(params.new_password);

      db.query('SELECT * FROM admins WHERE admin_id = ?', [params.admin_id], (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }
        if (results.length === 0) {
          return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
        }

        const admin = results[0];

        bcrypt.compare(params.current_password, admin.password, (err, isMatch) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err));
          }
          if (!isMatch) {
            return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidCurrentPasswordError));
          } else {
            db.query('UPDATE admins SET password = ? WHERE admin_id = ?', [new_password, params.admin_id], (err, results) => {
              if (err) {
                return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
              }

              return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
            });
          }
        });
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  /* adminDetails: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ["admin_id"]));

      if (_.isEmpty(params.admin_id)) {
        return res
          .status(200)
          .json(
            service.serviceResponse(false, "000", errorMessages.missingParamError)
          );
      }

      db.query(
        "SELECT admin_id, name, username, email, status, created_at, updated_at FROM admins WHERE admin_id = ?",
        [params.admin_id],
        (err, results) => {
          if (err) {
            return res
              .status(200)
              .json(service.serviceResponse(false, "000", err.sqlMessage));
          }
          if (results.length === 0) {
            return res
              .status(200)
              .json(
                service.serviceResponse(
                  false,
                  "000",
                  errorMessages.invalidIdError
                )
              );
          }

          return res
            .status(200)
            .json(service.serviceResponse(true, "000", errorMessages.success, results[0]));
        }
      );
    } catch (err) {
      return res
        .status(200)
        .json(
          service.serviceResponse(
            false,
            "333",
            errorMessages.serverError
          )
        );
    }
  }, */
  /* Admin Login API End */

  /* FAQ API now lives in controllers/faqMasterManagement.js */

  /* Que API Start */
  faqList1: async (req, res) => {
    try {
      /* Fetch updated paginated data */
      const order = req.query.order || "position";
      const desc = req.query.desc;
      const dir = desc === "true" ? "DESC" : "ASC";
      const search = req.query.search || "";
      const status = req.query.status || "all";

      const page = parseInt(req.query.page) || 1; /* Default to page 1 */
      const limit =
        parseInt(req.query.limit) || 10; /* Default to 10 items per page */
      const offset = (page - 1) * limit;

      /* Construct query dynamically */
      let whereConditions = [];

      /* Add search condition */
      if (search) {
        whereConditions.push(
          `(question LIKE '%${search}%' OR answer LIKE '%${search}%')`
        );
      }

      /* Add status filter */
      if (status !== "all") {
        whereConditions.push(`status = '${status}'`);
      }

      /* Combine where clause */
      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      /* Construct query dynamically */
      dataQuery = `SELECT * FROM que ${whereClause} ORDER BY ${order} ${dir}, que_id ${dir} LIMIT ? OFFSET ?`;
      countQuery = `SELECT COUNT(*) AS total FROM que ${whereClause}`;

      /* Execute the count query */
      db.query(countQuery, (err, countResult) => {
        if (err) {
          return res
            .status(200)
            .json(service.serviceResponse(false, "000", err.sqlMessage));
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        /* Execute the data query */
        db.query(dataQuery, [limit, offset], (err, results) => {
          if (err) {
            return res
              .status(200)
              .json(service.serviceResponse(false, "000", err.sqlMessage));
          }

          /* Return the paginated data along with metadata */
          return res.status(200).json(
            service.serviceResponse(true, "000", errorMessages.success, {
              data: results,
              pagination: {
                totalRecords: total,
                totalPages,
                currentPage: page,
                limit,
              },
            })
          );
        });
      });
    } catch (err) {
      return res
        .status(200)
        .json(service.serviceResponse(false, "333", errorMessages.serverError));
    }
  },

  createFaqs: async (req, res) => {
    try {
      const params = await service.trimObject(
        _.pick(req.body, ["question", "answer", "status"])
      );

      if (
        _.isEmpty(params.question) ||
        _.isEmpty(params.answer) ||
        _.isEmpty(params.status)
      ) {
        return res
          .status(200)
          .json(
            service.serviceResponse(
              false,
              "000",
              errorMessages.missingParamError
            )
          );
      }

      db.query(
        "INSERT INTO que (question, answer, status, created_at) VALUES (?, ?, ?, ?)",
        [params.question, params.answer, params.status, new Date()],
        (err, results) => {
          if (err) {
            return res
              .status(200)
              .json(service.serviceResponse(false, "000", err.sqlMessage));
          }
          return res.status(200).json(
            service.serviceResponse(true, "000", errorMessages.success, {
              que_id: results.insertId,
              question: params.question,
              answer: params.answer,
              status: params.status,
            })
          );
        }
      );
    } catch (err) {
      return res
        .status(200)
        .json(service.serviceResponse(false, "333", errorMessages.serverError));
    }
  },

  updateFaqs: async (req, res) => {
    try {
      const params = await service.trimObject(
        _.pick(req.body, ["que_id", "question", "answer", "status"])
      );

      if (
        _.isEmpty(params.que_id) ||
        _.isEmpty(params.question) ||
        _.isEmpty(params.answer) ||
        _.isEmpty(params.status)
      ) {
        return res
          .status(200)
          .json(
            service.serviceResponse(
              false,
              "000",
              errorMessages.missingParamError
            )
          );
      }

      db.query(
        "UPDATE que SET question = ?, answer = ?, status = ? WHERE que_id = ?",
        [params.question, params.answer, params.status, params.que_id],
        (err, results) => {
          if (err) {
            return res
              .status(200)
              .json(service.serviceResponse(false, "000", err.sqlMessage));
          }
          return res.status(200).json(
            service.serviceResponse(true, "000", errorMessages.success, {
              que_id: params.que_id,
              question: params.question,
              answer: params.answer,
              status: params.status,
            })
          );
        }
      );
    } catch (err) {
      return res
        .status(200)
        .json(service.serviceResponse(false, "333", errorMessages.serverError));
    }
  },

  deleteFaqs: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ["que_ids"]));

      if (_.isEmpty(params.que_ids)) {
        return res
          .status(200)
          .json(
            service.serviceResponse(
              false,
              "000",
              errorMessages.missingParamError
            )
          );
      }

      const faqIdsArray = params.que_ids.split(/\s*,\s*/);

      if (!Array.isArray(faqIdsArray) || faqIdsArray.length === 0) {
        return res
          .status(200)
          .json(
            service.serviceResponse(false, "000", errorMessages.invalidIdError)
          );
      }

      const deleteQueries = [];
      deleteQueries.push(
        faqIdsArray.map((que_id, index) => {
          return db.query("DELETE FROM que WHERE que_id = ?", [que_id]);
        })
      );

      await Promise.all(deleteQueries);

      return res
        .status(200)
        .json(service.serviceResponse(true, "000", errorMessages.success));
    } catch (err) {
      return res
        .status(200)
        .json(service.serviceResponse(false, "333", errorMessages.serverError));
    }
  },

  activeFaqs: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ["que_ids"]));

      if (_.isEmpty(params.que_ids)) {
        return res
          .status(200)
          .json(
            service.serviceResponse(
              false,
              "000",
              errorMessages.missingParamError
            )
          );
      }

      const faqIdsArray = params.que_ids.split(/\s*,\s*/);

      if (!Array.isArray(faqIdsArray) || faqIdsArray.length === 0) {
        return res
          .status(200)
          .json(
            service.serviceResponse(false, "000", errorMessages.invalidIdError)
          );
      }

      const updateQueries = [];
      updateQueries.push(
        faqIdsArray.map((que_id, index) => {
          return db.query("UPDATE que SET status = ? WHERE que_id = ?", [
            1,
            que_id,
          ]);
        })
      );

      await Promise.all(updateQueries);

      return res
        .status(200)
        .json(service.serviceResponse(true, "000", errorMessages.success));
    } catch (err) {
      return res
        .status(200)
        .json(service.serviceResponse(false, "333", errorMessages.serverError));
    }
  },

  inactiveFaqs: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ["que_ids"]));

      if (_.isEmpty(params.que_ids)) {
        return res
          .status(200)
          .json(
            service.serviceResponse(
              false,
              "000",
              errorMessages.missingParamError
            )
          );
      }

      const faqIdsArray = params.que_ids.split(/\s*,\s*/);

      if (!Array.isArray(faqIdsArray) || faqIdsArray.length === 0) {
        return res
          .status(200)
          .json(
            service.serviceResponse(false, "000", errorMessages.invalidIdError)
          );
      }

      const updateQueries = [];
      updateQueries.push(
        faqIdsArray.map((que_id, index) => {
          return db.query("UPDATE que SET status = ? WHERE que_id = ?", [
            0,
            que_id,
          ]);
        })
      );

      await Promise.all(updateQueries);

      return res
        .status(200)
        .json(service.serviceResponse(true, "000", errorMessages.success));
    } catch (err) {
      return res
        .status(200)
        .json(service.serviceResponse(false, "333", errorMessages.serverError));
    }
  },

  updateFaqPositions: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ["que_ids"]));
      if (_.isEmpty(params.que_ids)) {
        return res
          .status(200)
          .json(
            service.serviceResponse(
              false,
              "000",
              errorMessages.missingParamError
            )
          );
      }

      const faqIdsArray = params.que_ids.split(/\s*,\s*/);
      if (!Array.isArray(faqIdsArray) || faqIdsArray.length === 0) {
        return res
          .status(200)
          .json(
            service.serviceResponse(false, "000", errorMessages.invalidIdError)
          );
      }

      /* Fetch ALL rows sorted by position */
      const allRows = await queryPromise(
        "SELECT que_id, position FROM que ORDER BY position"
      );

      /* Create a map of faq_id -> position */
      const positionMap = new Map(
        allRows.map((row) => [row.que_id, row.position])
      );

      /* Extract only the moved IDs and adjust their positions globally */
      const movedRows = faqIdsArray
        .map((id) => ({ id, position: positionMap.get(Number(id)) }))
        .filter((row) => row.position !== undefined);

      if (movedRows.length === 0) {
        return res
          .status(200)
          .json(
            service.serviceResponse(false, "000", "Invalid IDs in request.")
          );
      }

      /* Remove moved rows from the original list */
      const remainingRows = allRows.filter(
        (row) => !faqIdsArray.includes(String(row.que_id))
      );

      /* Reconstruct the ordered list */
      let newOrder = [...remainingRows];

      /* Find where to insert moved rows */
      const startPosition =
        movedRows[0].position; /* Get the first item's original position */
      newOrder.splice(
        startPosition - 1,
        0,
        ...movedRows
      ); /* Insert at correct place */

      /* Reassign positions sequentially */
      const updateQueries = newOrder.map((row, index) =>
        queryPromise("UPDATE que SET position = ? WHERE que_id = ?", [
          index + 1,
          row.id,
        ])
      );

      await Promise.all(updateQueries);

      /* Fetch updated paginated data */
      const { limit = 10, page = 1 } = req.body;
      const offset = (page - 1) * limit;
      const results = await queryPromise(
        "SELECT * FROM que ORDER BY position LIMIT ? OFFSET ?",
        [limit, offset]
      );

      const countResult = await queryPromise(
        "SELECT COUNT(*) AS total FROM que"
      );
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      return res.status(200).json(
        service.serviceResponse(true, "000", errorMessages.success, {
          data: results,
          pagination: {
            currentPage: page,
            limit,
            totalPages,
            totalRecords: total,
          },
        })
      );
    } catch (err) {
      return res
        .status(500)
        .json(service.serviceResponse(false, "333", errorMessages.serverError));
    }
  },
  /* Que API End */

  /* Teams API Start */
  teamList1: async (req, res) => {
    try {
      /* Fetch updated paginated data */
      const order = req.query.order || "position";
      const desc = req.query.desc;
      const dir = desc === "true" ? "DESC" : "ASC";
      const search = req.query.search || "";
      const status = req.query.status || "all";

      const page = parseInt(req.query.page) || 1; /* Default to page 1 */
      const limit =
        parseInt(req.query.limit) || 10; /* Default to 10 items per page */
      const offset = (page - 1) * limit;

      /* Construct query dynamically */
      let whereConditions = [];

      /* Add search condition */
      if (search) {
        whereConditions.push(
          `(name LIKE '%${search}%' OR designation LIKE '%${search}%')`
        );
      }

      /* Add status filter */
      if (status !== "all") {
        whereConditions.push(`status = '${status}'`);
      }

      /* Combine where clause */
      const whereClause =
        whereConditions.length > 0
          ? `WHERE ${whereConditions.join(" AND ")}`
          : "";

      /* Construct query dynamically */
      dataQuery = `SELECT * FROM teams ${whereClause} ORDER BY ${order} ${dir}, team_id1 ${dir} LIMIT ? OFFSET ?`;
      countQuery = `SELECT COUNT(*) AS total FROM teams ${whereClause}`;

      /* Execute the count query */
      db.query(countQuery, (err, countResult) => {
        if (err) {
          return res
            .status(200)
            .json(service.serviceResponse(false, "000", err.sqlMessage));
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        /* Execute the data query */
        db.query(dataQuery, [limit, offset], (err, results) => {
          if (err) {
            return res
              .status(200)
              .json(service.serviceResponse(false, "000", err.sqlMessage));
          }
          const resObj = results.map((item) => ({
            ...item,
            profile_pic: `${req.protocol}://${req.get("host")}/uploads/teams/${item.profile_pic
              }`,
          }));

          return res.status(200).json(
            service.serviceResponse(true, "000", errorMessages.success, {
              data: resObj,
              pagination: {
                totalRecords: total,
                totalPages,
                currentPage: page,
                limit,
              },
            })
          );
        });
      });
    } catch (err) {
      return res
        .status(200)
        .json(service.serviceResponse(false, "333", errorMessages.serverError));
    }
  },

  addTeams: async (req, res) => {
    try {
      const params = await service.trimObject(
        _.pick(req.body, ["name", "designation", "description", "status"])
      );

      if (
        _.isEmpty(params.name) ||
        _.isEmpty(params.designation) ||
        _.isEmpty(params.description) ||
        _.isEmpty(params.status)
      ) {
        service.deleteUploadedFiles(req.files);
        return res
          .status(200)
          .json(
            service.serviceResponse(
              false,
              "000",
              errorMessages.missingParamError
            )
          );
      }

      /* Check if logo1 was uploaded */
      if (req.files.profile_pic) {
        const profile_pic = req.files.profile_pic[0];
        params["profile_pic"] = profile_pic.filename;
      } else {
        return res
          .status(200)
          .json(
            service.serviceResponse(
              false,
              "000",
              errorMessages.missingParamError
            )
          );
      }

      db.query(
        "INSERT INTO teams (profile_pic, name, designation, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?)",
        [
          params.profile_pic,
          params.name,
          params.designation,
          params.description,
          params.status,
          new Date(),
        ],
        (err, results) => {
          if (err) {
            return res
              .status(200)
              .json(service.serviceResponse(false, "000", err.sqlMessage));
          }

          const imagePath = `${req.protocol}://${req.get(
            "host"
          )}/uploads/team/${params.profile_pic}`;
          return res.status(200).json(
            service.serviceResponse(true, "000", errorMessages.success, {
              team_id1: results.insertId,
              profile_pic: imagePath,
              name: params.name,
              designation: params.designation,
              description: params.description,
              status: params.status,
            })
          );
        }
      );
    } catch (err) {
      return res
        .status(200)
        .json(service.serviceResponse(false, "333", errorMessages.serverError));
    }
  },

  updateTeams: async (req, res) => {
    try {
      const params = await service.trimObject(
        _.pick(req.body, [
          "team_id1",
          "name",
          "designation",
          "description",
          "status",
        ])
      );

      if (
        _.isEmpty(params.team_id1) ||
        _.isEmpty(params.name) ||
        _.isEmpty(params.designation) ||
        _.isEmpty(params.description) ||
        _.isEmpty(params.status)
      ) {
        service.deleteUploadedFiles(req.files);
        return res
          .status(200)
          .json(
            service.serviceResponse(
              false,
              "000",
              errorMessages.missingParamError
            )
          );
      }

      /* Check if logo1 was uploaded */
      if (req.files.profile_pic) {
        const profile_pic = req.files.profile_pic[0];
        params["profile_pic"] = profile_pic.filename;
      }

      if (params.profile_pic) {
        db.query(
          "UPDATE teams SET profile_pic = ?, name = ?, designation = ?, description = ?, status = ? WHERE team_id1 = ?",
          [
            params.profile_pic,
            params.name,
            params.designation,
            params.description,
            params.status,
            params.team_id1,
          ],
          (err, results) => {
            if (err) {
              return res
                .status(200)
                .json(service.serviceResponse(false, "000", err.sqlMessage));
            }

            const imagePath = `${req.protocol}://${req.get(
              "host"
            )}/uploads/team/${params.profile_pic}`;
            return res.status(200).json(
              service.serviceResponse(true, "000", errorMessages.success, {
                team_id1: params.team_id1,
                profile_pic: imagePath,
                name: params.name,
                designation: params.designation,
                description: params.description,
                status: params.status,
              })
            );
          }
        );
      } else {
        db.query(
          "UPDATE teams SET name = ?, designation = ?, description = ?, status = ? WHERE team_id1 = ?",
          [
            params.name,
            params.designation,
            params.description,
            params.status,
            params.team_id1,
          ],
          (err, results) => {
            if (err) {
              return res
                .status(200)
                .json(service.serviceResponse(false, "000", err.sqlMessage));
            }
            return res.status(200).json(
              service.serviceResponse(true, "000", errorMessages.success, {
                team_id1: params.team_id1,
                name: params.name,
                designation: params.designation,
                description: params.description,
                status: params.status,
              })
            );
          }
        );
      }
    } catch (err) {
      return res
        .status(200)
        .json(service.serviceResponse(false, "333", errorMessages.serverError));
    }
  },

  deleteTeams: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ["team_id1s"]));

      if (_.isEmpty(params.team_id1s)) {
        return res
          .status(200)
          .json(
            service.serviceResponse(
              false,
              "000",
              errorMessages.missingParamError
            )
          );
      }

      const teamIdsArray = params.team_id1s.split(/\s*,\s*/);

      if (!Array.isArray(teamIdsArray) || teamIdsArray.length === 0) {
        return res
          .status(200)
          .json(
            service.serviceResponse(false, "000", errorMessages.invalidIdError)
          );
      }

      const deleteQueries = [];
      deleteQueries.push(
        teamIdsArray.map((team_id1, index) => {
          return db.query("DELETE FROM teams WHERE team_id1 = ?", [team_id1]);
        })
      );
      await Promise.all(deleteQueries);

      return res
        .status(200)
        .json(service.serviceResponse(true, "000", errorMessages.success));
    } catch (err) {
      return res
        .status(200)
        .json(service.serviceResponse(false, "333", errorMessages.serverError));
    }
  },

  activeTeams: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ["team_id1s"]));

      if (_.isEmpty(params.team_id1s)) {
        return res
          .status(200)
          .json(
            service.serviceResponse(
              false,
              "000",
              errorMessages.missingParamError
            )
          );
      }

      const teamIdsArray = params.team_id1s.split(/\s*,\s*/);

      if (!Array.isArray(teamIdsArray) || teamIdsArray.length === 0) {
        return res
          .status(200)
          .json(
            service.serviceResponse(false, "000", errorMessages.invalidIdError)
          );
      }

      const updateQueries = [];
      updateQueries.push(
        teamIdsArray.map((team_id1, index) => {
          return db.query("UPDATE teams SET status = ? WHERE team_id1 = ?", [
            1,
            team_id1,
          ]);
        })
      );

      await Promise.all(updateQueries);

      return res
        .status(200)
        .json(service.serviceResponse(true, "000", errorMessages.success));
    } catch (err) {
      return res
        .status(200)
        .json(service.serviceResponse(false, "333", errorMessages.serverError));
    }
  },

  inactiveTeams: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ["team_id1s"]));

      if (_.isEmpty(params.team_id1s)) {
        return res
          .status(200)
          .json(
            service.serviceResponse(
              false,
              "000",
              errorMessages.missingParamError
            )
          );
      }

      const teamIdsArray = params.team_id1s.split(/\s*,\s*/);

      if (!Array.isArray(teamIdsArray) || teamIdsArray.length === 0) {
        return res
          .status(200)
          .json(
            service.serviceResponse(false, "000", errorMessages.invalidIdError)
          );
      }

      const updateQueries = [];
      updateQueries.push(
        teamIdsArray.map((team_id1, index) => {
          return db.query("UPDATE teams SET status = ? WHERE team_id1 = ?", [
            0,
            team_id1,
          ]);
        })
      );

      await Promise.all(updateQueries);

      return res
        .status(200)
        .json(service.serviceResponse(true, "000", errorMessages.success));
    } catch (err) {
      return res
        .status(200)
        .json(service.serviceResponse(false, "333", errorMessages.serverError));
    }
  },

  updateTeamPositions: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ["team_id1s"]));

      if (_.isEmpty(params.team_id1s)) {
        return res
          .status(200)
          .json(
            service.serviceResponse(
              false,
              "000",
              errorMessages.missingParamError
            )
          );
      }

      const teamIdsArray = params.team_id1s.split(/\s*,\s*/);
      if (!Array.isArray(teamIdsArray) || teamIdsArray.length === 0) {
        return res
          .status(200)
          .json(
            service.serviceResponse(false, "000", errorMessages.invalidIdError)
          );
      }

      /* Fetch ALL rows sorted by position */
      const allRows = await queryPromise(
        "SELECT team_id1, position FROM teams ORDER BY position"
      );

      /* Create a map of team_id -> position */
      const positionMap = new Map(
        allRows.map((row) => [row.team_id1, row.position])
      );

      /* Extract only the moved IDs and adjust their positions globally */
      const movedRows = teamIdsArray
        .map((id) => ({ id, position: positionMap.get(Number(id)) }))
        .filter((row) => row.position !== undefined);

      if (movedRows.length === 0) {
        return res
          .status(200)
          .json(
            service.serviceResponse(false, "000", "Invalid IDs in request.")
          );
      }

      /* Remove moved rows from the original list */
      const remainingRows = allRows.filter(
        (row) => !teamIdsArray.includes(String(row.team_id1))
      );

      /* Reconstruct the ordered list */
      let newOrder = [...remainingRows];

      /* Find where to insert moved rows */
      const startPosition =
        movedRows[0].position; /* Get the first item's original position */
      newOrder.splice(
        startPosition - 1,
        0,
        ...movedRows
      ); /* Insert at correct place */

      /* Reassign positions sequentially */
      const updateQueries = newOrder.map((row, index) =>
        queryPromise("UPDATE teams SET position = ? WHERE team_id1 = ?", [
          index + 1,
          row.id,
        ])
      );

      await Promise.all(updateQueries);

      /* Fetch updated paginated data */
      const { limit = 10, page = 1 } = req.body;
      const offset = (page - 1) * limit;
      const results = await queryPromise(
        "SELECT * FROM teams ORDER BY position LIMIT ? OFFSET ?",
        [limit, offset]
      );

      const countResult = await queryPromise(
        "SELECT COUNT(*) AS total FROM teams"
      );
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      const resObj = results.map((item) => ({
        ...item,
        profile_pic: `${req.protocol}://${req.get("host")}/upload/teams/${item.profile_pic
          }`,
      }));

      return res.status(200).json(
        service.serviceResponse(true, "000", errorMessages.success, {
          data: resObj,
          pagination: {
            currentPage: page,
            limit,
            totalPages,
            totalRecords: total,
          },
        })
      );
    } catch (err) {
      return res
        .status(200)
        .json(service.serviceResponse(false, "333", errorMessages.serverError));
    }
  },
  /* Teams API End */



  /* Language API Start */
  languageList: async (req, res) => {
    try {
      /* Fetch updated paginated data */
      const order = req.query.order || 'position';
      const desc = req.query.desc;
      const dir = desc === 'true' ? 'DESC' : 'ASC';
      const search = req.query.search || '';
      const status = req.query.status || 'all';

      const page = parseInt(req.query.page) || 1; /* Default to page 1 */
      const limit = parseInt(req.query.limit) || 10; /* Default to 10 items per page */
      const offset = (page - 1) * limit;

      /* Construct query dynamically */
      let whereConditions = [];

      /* Add search condition */
      if (search) {
        whereConditions.push(`language LIKE '%${search}%'`);
      }

      /* Add status filter */
      if (status !== 'all') {
        whereConditions.push(`status = '${status}'`);
      }

      /* Combine where clause */
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      /* Construct query dynamically */
      dataQuery = `SELECT * FROM language ${whereClause} ORDER BY ${order} ${dir}, language_id ${dir} LIMIT ? OFFSET ?`;
      countQuery = `SELECT COUNT(*) AS total FROM language ${whereClause}`;

      /* Execute the count query */
      db.query(countQuery, (err, countResult) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        /* Execute the data query */
        db.query(dataQuery, [limit, offset], (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          /* Return the paginated data along with metadata */
          return res.status(200).json(
            service.serviceResponse(true, '000', errorMessages.success, {
              data: results,
              pagination: {
                totalRecords: total,
                totalPages,
                currentPage: page,
                limit
              }
            })
          );
        });
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  addLanguage: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['language', 'status']));

      if (_.isEmpty(params.language) || _.isEmpty(params.status)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      params.language = service.capitalizeFirstLetter(params.language);

      db.query('SELECT * FROM language WHERE language = ?', [params.language], (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        if (results.length >= 1) {
          return res.status(200).json(service.serviceResponse(false, '000', errorMessages.sameRecordAlreadyExistError));
        } else {
          db.query(
            'INSERT INTO language (language, status, created_at) VALUES (?, ?, ?)',
            [params.language, params.status, new Date()],
            (err, results) => {
              if (err) {
                return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
              }
              return res.status(200).json(
                service.serviceResponse(true, '000', errorMessages.success, {
                  language_id: results.insertId,
                  language: params.language,
                  status: params.status
                })
              );
            }
          );
        }
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateLanguage: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['language_id', 'language', 'status']));

      if (_.isEmpty(params.language_id) || _.isEmpty(params.language) || _.isEmpty(params.status)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      params.language = service.capitalizeFirstLetter(params.language);

      db.query('SELECT * FROM language WHERE language = ? AND language_id != ?', [params.language, params.language_id], (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        if (results.length >= 1) {
          return res.status(200).json(service.serviceResponse(false, '000', errorMessages.sameRecordAlreadyExistError));
        } else {
          db.query(
            'UPDATE language SET language = ?, status = ? WHERE language_id = ?',
            [params.language, params.status, params.language_id],
            (err, results) => {
              if (err) {
                return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
              }
              return res.status(200).json(
                service.serviceResponse(true, '000', errorMessages.success, {
                  language_id: params.language_id,
                  language: params.language,
                  status: params.status
                })
              );
            }
          );
        }
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  deleteLanguage: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['language_ids']));

      if (_.isEmpty(params.language_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const languageIdsArray = params.language_ids.split(/\s*,\s*/);

      if (!Array.isArray(languageIdsArray) || languageIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const deleteQueries = [];
      deleteQueries.push(
        languageIdsArray.map((language_id, index) => {
          return db.query('DELETE FROM language WHERE language_id = ?', [language_id]);
        })
      );

      await Promise.all(deleteQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  activeLanguage: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['language_ids']));

      if (_.isEmpty(params.language_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const languageIdsArray = params.language_ids.split(/\s*,\s*/);

      if (!Array.isArray(languageIdsArray) || languageIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        languageIdsArray.map((language_id, index) => {
          return db.query('UPDATE language SET status = ? WHERE language_id = ?', [1, language_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  inactiveLanguage: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['language_ids']));

      if (_.isEmpty(params.language_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const languageIdsArray = params.language_ids.split(/\s*,\s*/);

      if (!Array.isArray(languageIdsArray) || languageIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        languageIdsArray.map((language_id, index) => {
          return db.query('UPDATE language SET status = ? WHERE language_id = ?', [0, language_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateLanguagePosition: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['language_ids']));
      if (_.isEmpty(params.language_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const languageIdsArray = params.language_ids.split(/\s*,\s*/);
      if (!Array.isArray(languageIdsArray) || languageIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      /* Fetch ALL rows sorted by position */
      const allRows = await queryPromise('SELECT language_id, position FROM language ORDER BY position');

      /* Create a map of language_id -> position */
      const positionMap = new Map(allRows.map((row) => [row.language_id, row.position]));

      /* Extract only the moved IDs and adjust their positions globally */
      const movedRows = languageIdsArray
        .map((id) => ({ id, position: positionMap.get(Number(id)) }))
        .filter((row) => row.position !== undefined);

      if (movedRows.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', 'Invalid IDs in request.'));
      }

      /* Remove moved rows from the original list */
      const remainingRows = allRows.filter((row) => !languageIdsArray.includes(String(row.language_id)));

      /* Reconstruct the ordered list */
      let newOrder = [...remainingRows];

      /* Find where to insert moved rows */
      const startPosition = movedRows[0].position; /* Get the first item's original position */
      newOrder.splice(startPosition - 1, 0, ...movedRows); /* Insert at correct place */

      /* Reassign positions sequentially */
      const updateQueries = newOrder.map((row, index) =>
        queryPromise('UPDATE language SET position = ? WHERE language_id = ?', [index + 1, row.id])
      );

      await Promise.all(updateQueries);

      /* Fetch updated paginated data */
      const { limit = 10, page = 1 } = req.body;
      const offset = (page - 1) * limit;
      const results = await queryPromise('SELECT * FROM language ORDER BY position LIMIT ? OFFSET ?', [limit, offset]);

      const countResult = await queryPromise('SELECT COUNT(*) AS total FROM language');
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      return res.status(200).json(
        service.serviceResponse(true, '000', errorMessages.success, {
          data: results,
          pagination: {
            currentPage: page,
            limit,
            totalPages,
            totalRecords: total
          }
        })
      );
    } catch (err) {
      return res.status(500).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  /* Language API End */

  /* Client Type API Start */
  clientTypeList: async (req, res) => {
    try {
      /* Fetch updated paginated data */
      const order = req.query.order || 'position';
      const desc = req.query.desc;
      const dir = desc === 'true' ? 'DESC' : 'ASC';
      const search = req.query.search || '';
      const status = req.query.status || 'all';

      const page = parseInt(req.query.page) || 1; /* Default to page 1 */
      const limit = parseInt(req.query.limit) || 10; /* Default to 10 items per page */
      const offset = (page - 1) * limit;

      /* Construct query dynamically */
      let whereConditions = [];

      /* Add search condition */
      if (search) {
        whereConditions.push(`client_type LIKE '%${search}%'`);
      }

      /* Add status filter */
      if (status !== 'all') {
        whereConditions.push(`status = '${status}'`);
      }

      /* Combine where clause */
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      /* Construct query dynamically */
      dataQuery = `SELECT * FROM client_types ${whereClause} ORDER BY ${order} ${dir}, client_type_id ${dir} LIMIT ? OFFSET ?`;
      countQuery = `SELECT COUNT(*) AS total FROM client_types ${whereClause}`;

      /* Execute the count query */
      db.query(countQuery, (err, countResult) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        /* Execute the data query */
        db.query(dataQuery, [limit, offset], (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          /* Return the paginated data along with metadata */
          return res.status(200).json(
            service.serviceResponse(true, '000', errorMessages.success, {
              data: results,
              pagination: {
                totalRecords: total,
                totalPages,
                currentPage: page,
                limit
              }
            })
          );
        });
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  addClientType: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['client_type', 'status']));

      if (_.isEmpty(params.client_type) || _.isEmpty(params.status)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      params.client_type = service.capitalizeFirstLetter(params.client_type);

      db.query('SELECT * FROM client_types WHERE client_type = ?', [params.client_type], (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        if (results.length >= 1) {
          return res.status(200).json(service.serviceResponse(false, '000', errorMessages.sameRecordAlreadyExistError));
        } else {
          db.query(
            'INSERT INTO client_types (client_type, status, created_at) VALUES (?, ?, ?)',
            [params.client_type, params.status, new Date()],
            (err, results) => {
              if (err) {
                return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
              }
              return res.status(200).json(
                service.serviceResponse(true, '000', errorMessages.success, {
                  client_type_id: results.insertId,
                  client_type: params.client_type,
                  status: params.status
                })
              );
            }
          );
        }
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateClientType: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['client_type_id', 'client_type', 'status']));

      if (_.isEmpty(params.client_type_id) || _.isEmpty(params.client_type) || _.isEmpty(params.status)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      params.client_type = service.capitalizeFirstLetter(params.client_type);

      db.query(
        'SELECT * FROM client_types WHERE client_type = ? AND client_type_id != ?',
        [params.client_type, params.client_type_id],
        (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          if (results.length >= 1) {
            return res.status(200).json(service.serviceResponse(false, '000', errorMessages.sameRecordAlreadyExistError));
          } else {
            db.query(
              'UPDATE client_types SET client_type = ?, status = ? WHERE client_type_id = ?',
              [params.client_type, params.status, params.client_type_id],
              (err, results) => {
                if (err) {
                  return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
                }
                return res.status(200).json(
                  service.serviceResponse(true, '000', errorMessages.success, {
                    client_type_id: params.client_type_id,
                    client_type: params.client_type,
                    status: params.status
                  })
                );
              }
            );
          }
        }
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  deleteClientType: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['client_type_ids']));

      if (_.isEmpty(params.client_type_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const clientTypeIdsArray = params.client_type_ids.split(/\s*,\s*/);

      if (!Array.isArray(clientTypeIdsArray) || clientTypeIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const deleteQueries = [];
      deleteQueries.push(
        clientTypeIdsArray.map((client_type_id, index) => {
          return db.query('DELETE FROM client_types WHERE client_type_id = ?', [client_type_id]);
        })
      );

      await Promise.all(deleteQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  activeClientType: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['client_type_ids']));

      if (_.isEmpty(params.client_type_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const clientTypeIdsArray = params.client_type_ids.split(/\s*,\s*/);

      if (!Array.isArray(clientTypeIdsArray) || clientTypeIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        clientTypeIdsArray.map((client_type_id, index) => {
          return db.query('UPDATE client_types SET status = ? WHERE client_type_id = ?', [1, client_type_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  inactiveClientType: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['client_type_ids']));

      if (_.isEmpty(params.client_type_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const clientTypeIdsArray = params.client_type_ids.split(/\s*,\s*/);

      if (!Array.isArray(clientTypeIdsArray) || clientTypeIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        clientTypeIdsArray.map((client_type_id, index) => {
          return db.query('UPDATE client_types SET status = ? WHERE client_type_id = ?', [0, client_type_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateClientTypePosition: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['client_type_ids']));
      if (_.isEmpty(params.client_type_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const clientTypesIdsArray = params.client_type_ids.split(/\s*,\s*/);
      if (!Array.isArray(clientTypesIdsArray) || clientTypesIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      /* Fetch ALL rows sorted by position */
      const allRows = await queryPromise('SELECT client_type_id, position FROM client_types ORDER BY position');

      /* Create a map of client_type_id -> position */
      const positionMap = new Map(allRows.map((row) => [row.client_type_id, row.position]));

      /* Extract only the moved IDs and adjust their positions globally */
      const movedRows = clientTypesIdsArray
        .map((id) => ({ id, position: positionMap.get(Number(id)) }))
        .filter((row) => row.position !== undefined);

      if (movedRows.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', 'Invalid IDs in request.'));
      }

      /* Remove moved rows from the original list */
      const remainingRows = allRows.filter((row) => !clientTypesIdsArray.includes(String(row.client_type_id)));

      /* Reconstruct the ordered list */
      let newOrder = [...remainingRows];

      /* Find where to insert moved rows */
      const startPosition = movedRows[0].position; /* Get the first item's original position */
      newOrder.splice(startPosition - 1, 0, ...movedRows); /* Insert at correct place */

      /* Reassign positions sequentially */
      const updateQueries = newOrder.map((row, index) =>
        queryPromise('UPDATE client_types SET position = ? WHERE client_type_id = ?', [index + 1, row.id])
      );

      await Promise.all(updateQueries);

      /* Fetch updated paginated data */
      const { limit = 10, page = 1 } = req.body;
      const offset = (page - 1) * limit;
      const results = await queryPromise('SELECT * FROM client_types ORDER BY position LIMIT ? OFFSET ?', [limit, offset]);

      const countResult = await queryPromise('SELECT COUNT(*) AS total FROM client_types');
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      return res.status(200).json(
        service.serviceResponse(true, '000', errorMessages.success, {
          data: results,
          pagination: {
            currentPage: page,
            limit,
            totalPages,
            totalRecords: total
          }
        })
      );
    } catch (err) {
      return res.status(500).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  /* Client Type API End */

  /* Online Platform API Start */
  onlinePlatformList: async (req, res) => {
    try {
      /* Fetch updated paginated data */
      const order = req.query.order || 'position';
      const desc = req.query.desc;
      const dir = desc === 'true' ? 'DESC' : 'ASC';
      const search = req.query.search || '';
      const status = req.query.status || 'all';

      const page = parseInt(req.query.page) || 1; /* Default to page 1 */
      const limit = parseInt(req.query.limit) || 10; /* Default to 10 items per page */
      const offset = (page - 1) * limit;

      /* Construct query dynamically */
      let whereConditions = [];

      /* Add search condition */
      if (search) {
        whereConditions.push(`online_platform LIKE '%${search}%'`);
      }

      /* Add status filter */
      if (status !== 'all') {
        whereConditions.push(`status = '${status}'`);
      }

      /* Combine where clause */
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      /* Construct query dynamically */
      dataQuery = `SELECT * FROM online_platforms ${whereClause} ORDER BY ${order} ${dir}, online_platform_id ${dir} LIMIT ? OFFSET ?`;
      countQuery = `SELECT COUNT(*) AS total FROM online_platforms ${whereClause}`;

      /* Execute the count query */
      db.query(countQuery, (err, countResult) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        /* Execute the data query */
        db.query(dataQuery, [limit, offset], (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          /* Return the paginated data along with metadata */
          return res.status(200).json(
            service.serviceResponse(true, '000', errorMessages.success, {
              data: results,
              pagination: {
                totalRecords: total,
                totalPages,
                currentPage: page,
                limit
              }
            })
          );
        });
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  addOnlinePlatform: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['online_platform', 'status']));

      if (_.isEmpty(params.online_platform) || _.isEmpty(params.status)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      params.online_platform = service.capitalizeFirstLetter(params.online_platform);

      db.query('SELECT * FROM online_platforms WHERE online_platform = ?', [params.online_platform], (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        if (results.length >= 1) {
          return res.status(200).json(service.serviceResponse(false, '000', errorMessages.sameRecordAlreadyExistError));
        } else {
          db.query(
            'INSERT INTO online_platforms (online_platform, status, created_at) VALUES (?, ?, ?)',
            [params.online_platform, params.status, new Date()],
            (err, results) => {
              if (err) {
                return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
              }
              return res.status(200).json(
                service.serviceResponse(true, '000', errorMessages.success, {
                  online_platform_id: results.insertId,
                  online_platform: params.online_platform,
                  status: params.status
                })
              );
            }
          );
        }
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateOnlinePlatform: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['online_platform_id', 'online_platform', 'status']));

      if (_.isEmpty(params.online_platform_id) || _.isEmpty(params.online_platform) || _.isEmpty(params.status)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      params.online_platform = service.capitalizeFirstLetter(params.online_platform);

      db.query(
        'SELECT * FROM online_platforms WHERE online_platform = ? AND online_platform_id != ?',
        [params.online_platform, params.online_platform_id],
        (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          if (results.length >= 1) {
            return res.status(200).json(service.serviceResponse(false, '000', errorMessages.sameRecordAlreadyExistError));
          } else {
            db.query(
              'UPDATE online_platforms SET online_platform = ?, status = ? WHERE online_platform_id = ?',
              [params.online_platform, params.status, params.online_platform_id],
              (err, results) => {
                if (err) {
                  return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
                }
                return res.status(200).json(
                  service.serviceResponse(true, '000', errorMessages.success, {
                    online_platform_id: params.online_platform_id,
                    online_platform: params.online_platform,
                    status: params.status
                  })
                );
              }
            );
          }
        }
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  deleteOnlinePlatform: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['online_platform_ids']));

      if (_.isEmpty(params.online_platform_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const onlinePlatformIdsArray = params.online_platform_ids.split(/\s*,\s*/);

      if (!Array.isArray(onlinePlatformIdsArray) || onlinePlatformIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const deleteQueries = [];
      deleteQueries.push(
        onlinePlatformIdsArray.map((online_platform_id, index) => {
          return db.query('DELETE FROM online_platforms WHERE online_platform_id = ?', [online_platform_id]);
        })
      );

      await Promise.all(deleteQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  activeOnlinePlatform: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['online_platform_ids']));

      if (_.isEmpty(params.online_platform_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const onlinePlatformIdsArray = params.online_platform_ids.split(/\s*,\s*/);

      if (!Array.isArray(onlinePlatformIdsArray) || onlinePlatformIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        onlinePlatformIdsArray.map((online_platform_id, index) => {
          return db.query('UPDATE online_platforms SET status = ? WHERE online_platform_id = ?', [1, online_platform_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  inactiveOnlinePlatform: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['online_platform_ids']));

      if (_.isEmpty(params.online_platform_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const onlinePlatformIdsArray = params.online_platform_ids.split(/\s*,\s*/);

      if (!Array.isArray(onlinePlatformIdsArray) || onlinePlatformIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        onlinePlatformIdsArray.map((online_platform_id, index) => {
          return db.query('UPDATE online_platforms SET status = ? WHERE online_platform_id = ?', [0, online_platform_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateOnlinePlatformPosition: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['online_platform_ids']));

      if (_.isEmpty(params.online_platform_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const onlinePlatformIdsArray = params.online_platform_ids.split(/\s*,\s*/);
      if (!Array.isArray(onlinePlatformIdsArray) || onlinePlatformIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      /* Fetch ALL rows sorted by position */
      const allRows = await queryPromise('SELECT online_platform_id, position FROM online_platforms ORDER BY position');

      /* Create a map of online_platform_id -> position */
      const positionMap = new Map(allRows.map((row) => [row.online_platform_id, row.position]));

      /* Extract only the moved IDs and adjust their positions globally */
      const movedRows = onlinePlatformIdsArray
        .map((id) => ({ id, position: positionMap.get(Number(id)) }))
        .filter((row) => row.position !== undefined);

      if (movedRows.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', 'Invalid IDs in request.'));
      }

      /* Remove moved rows from the original list */
      const remainingRows = allRows.filter((row) => !onlinePlatformIdsArray.includes(String(row.online_platform_id)));

      /* Reconstruct the ordered list */
      let newOrder = [...remainingRows];

      /* Find where to insert moved rows */
      const startPosition = movedRows[0].position; /* Get the first item's original position */
      newOrder.splice(startPosition - 1, 0, ...movedRows); /* Insert at correct place */

      /* Reassign positions sequentially */
      const updateQueries = newOrder.map((row, index) =>
        queryPromise('UPDATE online_platforms SET position = ? WHERE online_platform_id = ?', [index + 1, row.id])
      );

      await Promise.all(updateQueries);

      /* Fetch updated paginated data */
      const { limit = 10, page = 1 } = req.body;
      const offset = (page - 1) * limit;
      const results = await queryPromise('SELECT * FROM online_platforms ORDER BY position LIMIT ? OFFSET ?', [limit, offset]);

      const countResult = await queryPromise('SELECT COUNT(*) AS total FROM online_platforms');
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      return res.status(200).json(
        service.serviceResponse(true, '000', errorMessages.success, {
          data: results,
          pagination: {
            currentPage: page,
            limit,
            totalPages,
            totalRecords: total
          }
        })
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  /* Online Platform API End */

  /* Site Settings API Start */
  updateSiteSettings: async (req, res) => {
    try {
      const params = await service.trimObject(
        _.pick(req.body, [
          'website_title',
          'email_receiver',
          'email_sender',
          'free_plan_duration_in_month',
          'footer_description',
          'address',
          'phone',
          'footer_email',
          'copyright_text',
          'facebook',
          'linkedin',
          'youtube',
          'twitter',
          'instagram'
        ])
      );

      if (
        _.isEmpty(params.website_title) ||
        _.isEmpty(params.email_receiver) ||
        _.isEmpty(params.email_sender) ||
        _.isEmpty(params.free_plan_duration_in_month) ||
        _.isEmpty(params.footer_description) ||
        _.isEmpty(params.address) ||
        _.isEmpty(params.phone) ||
        _.isEmpty(params.footer_email) ||
        _.isEmpty(params.copyright_text)
      ) {
        service.deleteUploadedFiles(req.files);
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      if (!service.validateEmail(params.email_receiver)) {
        service.deleteUploadedFiles(req.files);
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidEmailError));
      }

      if (!service.validateEmail(params.email_sender)) {
        service.deleteUploadedFiles(req.files);
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidEmailError));
      }

      if (!service.validateEmail(params.footer_email)) {
        service.deleteUploadedFiles(req.files);
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidEmailError));
      }

      /* Check if logo1 was uploaded */
      if (req.files.logo) {
        const logo = req.files.logo[0];
        params['logo'] = logo.filename;
      }

      /* Check if favicon was uploaded */
      if (req.files.favicon) {
        const favicon = req.files.favicon[0];
        params['favicon'] = favicon.filename;
      }

      /* Check if footer logo was uploaded */
      if (req.files.footer_logo) {
        const footer_logo = req.files.footer_logo[0];
        params['footer_logo'] = footer_logo.filename;
      }

      const updatePromises = [];
      updatePromises.push(
        Object.keys(params).map((key) => {
          return db.query('UPDATE site_setting SET value = ? WHERE `key` = ?', [params[key], key]);
        })
      );

      await Promise.all(updatePromises);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  getSiteSettings: async (req, res) => {
    try {
      db.query(
        "SELECT * FROM site_setting WHERE `key` IN ('logo', 'favicon', 'website_title', 'email_receiver', 'email_sender', 'free_plan_duration_in_month', 'footer_logo', 'footer_description', 'address', 'phone', 'footer_email', 'copyright_text', 'facebook', 'linkedin', 'youtube', 'twitter', 'instagram')",
        (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          const resObj = {};
          results.forEach((record) => {
            if (record.key == 'logo' || record.key == 'favicon' || record.key == 'footer_logo') {
              const imagePath = `${req.protocol}://${req.get('host')}/uploads/${record.value}`;
              resObj[record.key] = imagePath;
            } else {
              resObj[record.key] = record.value;
            }
          });

          return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success, resObj));
        }
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateSMTPSettings: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['smtp_email', 'smtp_password', 'smtp_host', 'smtp_port']));

      if (_.isEmpty(params.smtp_email) || _.isEmpty(params.smtp_password) || _.isEmpty(params.smtp_host) || _.isEmpty(params.smtp_port)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      if (!service.validateEmail(params.smtp_email)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidEmailError));
      }

      const updatePromises = [];
      updatePromises.push(
        Object.keys(params).map((key) => {
          return db.query('UPDATE site_setting SET value = ? WHERE `key` = ?', [params[key], key]);
        })
      );

      await Promise.all(updatePromises);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  getSMTPSettings: async (req, res) => {
    try {
      db.query("SELECT * FROM site_setting WHERE `key` IN ('smtp_email', 'smtp_password', 'smtp_host', 'smtp_port')", (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        const resObj = {};
        results.forEach((record) => {
          resObj[record.key] = record.value;
        });

        return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success, resObj));
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  /* Site Settings API End */

  /* Complaints Policy API Start */
  updateComplaintsPolicy: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['complaints_policy']));

      if (_.isEmpty(params.complaints_policy)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      db.query('UPDATE site_setting SET value = ? WHERE `key` = ?', [params.complaints_policy, 'complaints_policy'], (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success, params.complaints_policy));
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  getComplaintsPolicy: async (req, res) => {
    try {
      db.query('SELECT value FROM site_setting WHERE `key` = ?', ['complaints_policy'], (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }
        return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success, results[0].value));
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  /* Complaints Policy API End */

  /* Terms and Conditions API Start */
  updateTermsAndConditions: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['terms_and_conditions']));

      if (_.isEmpty(params.terms_and_conditions)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      db.query(
        'UPDATE site_setting SET value = ? WHERE `key` = ?',
        [params.terms_and_conditions, 'terms_and_conditions'],
        (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success, params.terms_and_conditions));
        }
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  getTermsAndConditions: async (req, res) => {
    try {
      db.query('SELECT value FROM site_setting WHERE `key` = ?', ['terms_and_conditions'], (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }
        return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success, results[0].value));
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  /* Terms and Conditions API End */

  /* ============================== POLICY API START ============================== */

  updatePolicy: async (req, res) => {
    try {
      // body se sirf polic_y lo + trim
      const params = await service.trimObject(_.pick(req.body, ['polic_y']));

      // validation
      if (!params.polic_y) {
        return res.status(200).json(
          service.serviceResponse(false, '000', errorMessages.missingParamError)
        );
      }

      // update query
      db.query(
        'UPDATE site_setting SET value = ? WHERE `key` = ?',
        [params.polic_y, 'polic_y'],
        (err, results) => {
          if (err) {
            return res.status(200).json(
              service.serviceResponse(false, '000', err.sqlMessage)
            );
          }

          return res.status(200).json(
            service.serviceResponse(
              true,
              '000',
              errorMessages.success,
              params.polic_y
            )
          );
        }
      );
    } catch (err) {
      return res.status(200).json(
        service.serviceResponse(false, '333', errorMessages.serverError)
      );
    }
  },

  getPolicy: async (req, res) => {
    try {
      db.query(
        'SELECT value FROM site_setting WHERE `key` = ?',
        ['polic_y'],
        (err, results) => {
          if (err) {
            return res.status(200).json(
              service.serviceResponse(false, '000', err.sqlMessage)
            );
          }

          // ✅ SAFETY CHECK (MOST IMPORTANT)
          if (!results || results.length === 0) {
            return res.status(200).json(
              service.serviceResponse(true, '000', errorMessages.success, '')
            );
          }

          return res.status(200).json(
            service.serviceResponse(
              true,
              '000',
              errorMessages.success,
              results[0].value
            )
          );
        }
      );
    } catch (err) {
      return res.status(200).json(
        service.serviceResponse(false, '333', errorMessages.serverError)
      );
    }
  },

  /* ============================== POLICY API END ============================== */

  /* Professional Body API Start */
  professionalBodyList: async (req, res) => {
    try {
      /* Fetch updated paginated data */
      const order = req.query.order || 'position';
      const desc = req.query.desc;
      const dir = desc === 'true' ? 'DESC' : 'ASC';
      const search = req.query.search || '';
      const status = req.query.status || 'all';

      const page = parseInt(req.query.page) || 1; /* Default to page 1 */
      const limit = parseInt(req.query.limit) || 10; /* Default to 10 items per page */
      const offset = (page - 1) * limit;

      /* Construct query dynamically */
      let whereConditions = [];

      /* Add search condition */
      if (search) {
        whereConditions.push(`professional_body LIKE '%${search}%'`);
      }

      /* Add status filter */
      if (status !== 'all') {
        whereConditions.push(`status = '${status}'`);
      }

      /* Combine where clause */
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      /* Construct query dynamically */
      dataQuery = `SELECT * FROM professional_bodies ${whereClause} ORDER BY ${order} ${dir}, professional_body_id ${dir} LIMIT ? OFFSET ?`;
      countQuery = `SELECT COUNT(*) AS total FROM professional_bodies ${whereClause}`;

      /* Execute the count query */
      db.query(countQuery, (err, countResult) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        /* Execute the data query */
        db.query(dataQuery, [limit, offset], (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          const resObj = results.map((item) => ({
            ...item,
            image: `${req.protocol}://${req.get('host')}/uploads/professional_body/${item.image}`
          }));

          return res.status(200).json(
            service.serviceResponse(true, '000', errorMessages.success, {
              data: resObj,
              pagination: {
                totalRecords: total,
                totalPages,
                currentPage: page,
                limit
              }
            })
          );
        });
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  addProfessionalBody: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['professional_body', 'status']));

      if (_.isEmpty(params.professional_body) || _.isEmpty(params.status)) {
        service.deleteUploadedFiles(req.files);
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      /* Check if image was uploaded */
      if (req.files && req.files.image && req.files.image.length > 0) {
        const image = req.files.image[0];
        params['image'] = image.filename;
      } else {
        params['image'] = null;
      }

      params.professional_body = service.capitalizeFirstLetter(params.professional_body);

      db.query('SELECT * FROM professional_bodies WHERE professional_body = ?', [params.professional_body], (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        if (results.length >= 1) {
          return res.status(200).json(service.serviceResponse(false, '000', errorMessages.sameRecordAlreadyExistError));
        } else {
          db.query(
            'INSERT INTO professional_bodies (professional_body, image, status, created_at) VALUES (?, ?, ?, ?)',
            [params.professional_body, params.image, params.status, new Date()],
            (err, results) => {
              if (err) {
                return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
              }

              const imagePath = `${req.protocol}://${req.get('host')}/uploads/professional_body/${params.image}`;
              return res.status(200).json(
                service.serviceResponse(true, '000', errorMessages.success, {
                  professional_body_id: results.insertId,
                  professional_body: params.professional_body,
                  image: imagePath,
                  status: params.status
                })
              );
            }
          );
        }
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateProfessionalBody: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['professional_body_id', 'professional_body', 'status']));

      if (_.isEmpty(params.professional_body_id) || _.isEmpty(params.professional_body) || _.isEmpty(params.status)) {
        service.deleteUploadedFiles(req.files);
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      /* Check if logo1 was uploaded */
      if (req.files.image) {
        const image = req.files.image[0];
        params['image'] = image.filename;
      }

      params.professional_body = service.capitalizeFirstLetter(params.professional_body);

      db.query(
        'SELECT * FROM professional_bodies WHERE professional_body = ? AND professional_body_id != ?',
        [params.professional_body, params.professional_body_id],
        (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          if (results.length >= 1) {
            return res.status(200).json(service.serviceResponse(false, '000', errorMessages.sameRecordAlreadyExistError));
          } else {
            if (params.image) {
              db.query(
                'UPDATE professional_bodies SET professional_body = ?, image = ?, status = ? WHERE professional_body_id = ?',
                [params.professional_body, params.image, params.status, params.professional_body_id],
                (err, results) => {
                  if (err) {
                    return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
                  }

                  const imagePath = `${req.protocol}://${req.get('host')}/uploads/professional_body/${params.image}`;
                  return res.status(200).json(
                    service.serviceResponse(true, '000', errorMessages.success, {
                      professional_body_id: params.professional_body_id,
                      professional_body: params.professional_body,
                      image: imagePath,
                      status: params.status
                    })
                  );
                }
              );
            } else {
              db.query(
                'UPDATE professional_bodies SET professional_body = ?, status = ? WHERE professional_body_id = ?',
                [params.professional_body, params.status, params.professional_body_id],
                (err, results) => {
                  if (err) {
                    return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
                  }
                  return res.status(200).json(
                    service.serviceResponse(true, '000', errorMessages.success, {
                      professional_body_id: params.professional_body_id,
                      professional_body: params.professional_body,
                      status: params.status
                    })
                  );
                }
              );
            }
          }
        }
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  deleteProfessionalBody: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['professional_body_ids']));

      if (_.isEmpty(params.professional_body_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const professionalBodyIdsArray = params.professional_body_ids.split(/\s*,\s*/);

      if (!Array.isArray(professionalBodyIdsArray) || professionalBodyIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const deleteQueries = [];
      deleteQueries.push(
        professionalBodyIdsArray.map((professional_body_id, index) => {
          return db.query('DELETE FROM professional_bodies WHERE professional_body_id = ?', [professional_body_id]);
        })
      );

      await Promise.all(deleteQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  activeProfessionalBody: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['professional_body_ids']));

      if (_.isEmpty(params.professional_body_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const professionalBodyIdsArray = params.professional_body_ids.split(/\s*,\s*/);

      if (!Array.isArray(professionalBodyIdsArray) || professionalBodyIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        professionalBodyIdsArray.map((professional_body_id, index) => {
          return db.query('UPDATE professional_bodies SET status = ? WHERE professional_body_id = ?', [1, professional_body_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  inactiveProfessionalBody: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['professional_body_ids']));

      if (_.isEmpty(params.professional_body_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const professionalBodyIdsArray = params.professional_body_ids.split(/\s*,\s*/);

      if (!Array.isArray(professionalBodyIdsArray) || professionalBodyIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        professionalBodyIdsArray.map((professional_body_id, index) => {
          return db.query('UPDATE professional_bodies SET status = ? WHERE professional_body_id = ?', [0, professional_body_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateProfessionalBodyPosition: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['professional_body_ids']));

      if (_.isEmpty(params.professional_body_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const professionalBodyIdsArray = params.professional_body_ids.split(/\s*,\s*/);
      if (!Array.isArray(professionalBodyIdsArray) || professionalBodyIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      /* Fetch ALL rows sorted by position */
      const allRows = await queryPromise('SELECT professional_body_id, position FROM professional_bodies ORDER BY position');

      /* Create a map of professional_body_id -> position */
      const positionMap = new Map(allRows.map((row) => [row.professional_body_id, row.position]));

      /* Extract only the moved IDs and adjust their positions globally */
      const movedRows = professionalBodyIdsArray
        .map((id) => ({ id, position: positionMap.get(Number(id)) }))
        .filter((row) => row.position !== undefined);

      if (movedRows.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', 'Invalid IDs in request.'));
      }

      /* Remove moved rows from the original list */
      const remainingRows = allRows.filter((row) => !professionalBodyIdsArray.includes(String(row.professional_body_id)));

      /* Reconstruct the ordered list */
      let newOrder = [...remainingRows];

      /* Find where to insert moved rows */
      const startPosition = movedRows[0].position; /* Get the first item's original position */
      newOrder.splice(startPosition - 1, 0, ...movedRows); /* Insert at correct place */

      /* Reassign positions sequentially */
      const updateQueries = newOrder.map((row, index) =>
        queryPromise('UPDATE professional_bodies SET position = ? WHERE professional_body_id = ?', [index + 1, row.id])
      );

      await Promise.all(updateQueries);

      /* Fetch updated paginated data */
      const { limit = 10, page = 1 } = req.body;
      const offset = (page - 1) * limit;
      const results = await queryPromise('SELECT * FROM professional_bodies ORDER BY position LIMIT ? OFFSET ?', [limit, offset]);

      const countResult = await queryPromise('SELECT COUNT(*) AS total FROM professional_bodies');
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      const resObj = results.map((item) => ({
        ...item,
        image: `${req.protocol}://${req.get('host')}/uploads/professional_body/${item.image}`
      }));

      return res.status(200).json(
        service.serviceResponse(true, '000', errorMessages.success, {
          data: resObj,
          pagination: {
            currentPage: page,
            limit,
            totalPages,
            totalRecords: total
          }
        })
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  /* Professional Body API End */

  /* Counselling Area API Start */
  counsellingAreaList: async (req, res) => {
    try {
      /* Fetch updated paginated data */
      const order = req.query.order || 'position';
      const desc = req.query.desc;
      const dir = desc === 'true' ? 'DESC' : 'ASC';
      const search = req.query.search || '';
      const status = req.query.status || 'all';

      const page = parseInt(req.query.page) || 1; /* Default to page 1 */
      const limit = parseInt(req.query.limit) || 10; /* Default to 10 items per page */
      const offset = (page - 1) * limit;

      /* Construct query dynamically */
      let whereConditions = [];

      /* Add search condition */
      if (search) {
        whereConditions.push(`counselling_area LIKE '%${search}%'`);
      }

      /* Add status filter */
      if (status !== 'all') {
        whereConditions.push(`status = '${status}'`);
      }

      /* Combine where clause */
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      /* Construct query dynamically */
      dataQuery = `SELECT * FROM counselling_area ${whereClause} ORDER BY ${order} ${dir}, counselling_area_id ${dir} LIMIT ? OFFSET ?`;
      countQuery = `SELECT COUNT(*) AS total FROM counselling_area ${whereClause}`;

      /* Execute the count query */
      db.query(countQuery, (err, countResult) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        /* Execute the data query */
        db.query(dataQuery, [limit, offset], (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          /* Return the paginated data along with metadata */
          return res.status(200).json(
            service.serviceResponse(true, '000', errorMessages.success, {
              data: results,
              pagination: {
                totalRecords: total,
                totalPages,
                currentPage: page,
                limit
              }
            })
          );
        });
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  addCounsellingArea: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['counselling_area', 'info_text', 'is_disabled', 'status']));

      if (_.isEmpty(params.counselling_area) || _.isEmpty(params.is_disabled) || _.isEmpty(params.status)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      params.counselling_area = service.capitalizeFirstLetter(params.counselling_area);

      db.query('SELECT * FROM counselling_area WHERE counselling_area = ?', [params.counselling_area], (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        if (results.length >= 1) {
          return res.status(200).json(service.serviceResponse(false, '000', errorMessages.sameRecordAlreadyExistError));
        } else {
          db.query(
            'INSERT INTO counselling_area (counselling_area, info_text, is_disabled, status, created_at) VALUES (?, ?, ?, ?, ?)',
            [params.counselling_area, params.info_text, params.is_disabled, params.status, new Date()],
            (err, results) => {
              if (err) {
                return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
              }
              return res.status(200).json(
                service.serviceResponse(true, '000', errorMessages.success, {
                  counselling_area_id: results.insertId,
                  counselling_area: params.counselling_area,
                  info_text: params.info_text,
                  is_disabled: params.is_disabled,
                  status: params.status
                })
              );
            }
          );
        }
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateCounsellingArea: async (req, res) => {
    try {
      const params = await service.trimObject(
        _.pick(req.body, ['counselling_area_id', 'counselling_area', 'info_text', 'is_disabled', 'status'])
      );

      if (
        _.isEmpty(params.counselling_area_id) ||
        _.isEmpty(params.counselling_area) ||
        _.isEmpty(params.is_disabled) ||
        _.isEmpty(params.status)
      ) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      params.counselling_area = service.capitalizeFirstLetter(params.counselling_area);

      db.query(
        'SELECT * FROM counselling_area WHERE counselling_area = ? AND counselling_area_id != ?',
        [params.counselling_area, params.counselling_area_id],
        (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          if (results.length >= 1) {
            return res.status(200).json(service.serviceResponse(false, '000', errorMessages.sameRecordAlreadyExistError));
          } else {
            db.query(
              'UPDATE counselling_area SET counselling_area = ?, info_text = ?, is_disabled = ?, status = ? WHERE counselling_area_id = ?',
              [params.counselling_area, params.info_text, params.is_disabled, params.status, params.counselling_area_id],
              (err, results) => {
                if (err) {
                  return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
                }
                return res.status(200).json(
                  service.serviceResponse(true, '000', errorMessages.success, {
                    counselling_area_id: params.counselling_area_id,
                    counselling_area: params.counselling_area,
                    info_text: params.info_text,
                    is_disabled: params.is_disabled,
                    status: params.status
                  })
                );
              }
            );
          }
        }
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  deleteCounsellingArea: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['counselling_area_ids']));

      if (_.isEmpty(params.counselling_area_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const counsellingAreaIdsArray = params.counselling_area_ids.split(/\s*,\s*/);

      if (!Array.isArray(counsellingAreaIdsArray) || counsellingAreaIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const deleteQueries = [];
      deleteQueries.push(
        counsellingAreaIdsArray.map((counselling_area_id, index) => {
          return db.query('DELETE FROM counselling_area WHERE counselling_area_id = ?', [counselling_area_id]);
        })
      );

      await Promise.all(deleteQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  activeCounsellingArea: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['counselling_area_ids']));

      if (_.isEmpty(params.counselling_area_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const counsellingAreaIdsArray = params.counselling_area_ids.split(/\s*,\s*/);

      if (!Array.isArray(counsellingAreaIdsArray) || counsellingAreaIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        counsellingAreaIdsArray.map((counselling_area_id, index) => {
          return db.query('UPDATE counselling_area SET status = ? WHERE counselling_area_id = ?', [1, counselling_area_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  inactiveCounsellingArea: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['counselling_area_ids']));

      if (_.isEmpty(params.counselling_area_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const counsellingAreaIdsArray = params.counselling_area_ids.split(/\s*,\s*/);

      if (!Array.isArray(counsellingAreaIdsArray) || counsellingAreaIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        counsellingAreaIdsArray.map((counselling_area_id, index) => {
          return db.query('UPDATE counselling_area SET status = ? WHERE counselling_area_id = ?', [0, counselling_area_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateCounsellingAreaPosition: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['counselling_area_ids']));

      if (_.isEmpty(params.counselling_area_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const counsellingAreaIdsArray = params.counselling_area_ids.split(/\s*,\s*/);
      if (!Array.isArray(counsellingAreaIdsArray) || counsellingAreaIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      /* Fetch ALL rows sorted by position */
      const allRows = await queryPromise('SELECT counselling_area_id, position FROM counselling_area ORDER BY position');

      /* Create a map of counselling_area_id -> position */
      const positionMap = new Map(allRows.map((row) => [row.counselling_area_id, row.position]));

      /* Extract only the moved IDs and adjust their positions globally */
      const movedRows = counsellingAreaIdsArray
        .map((id) => ({ id, position: positionMap.get(Number(id)) }))
        .filter((row) => row.position !== undefined);

      if (movedRows.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', 'Invalid IDs in request.'));
      }

      /* Remove moved rows from the original list */
      const remainingRows = allRows.filter((row) => !counsellingAreaIdsArray.includes(String(row.counselling_area_id)));

      /* Reconstruct the ordered list */
      let newOrder = [...remainingRows];

      /* Find where to insert moved rows */
      const startPosition = movedRows[0].position; /* Get the first item's original position */
      newOrder.splice(startPosition - 1, 0, ...movedRows); /* Insert at correct place */

      /* Reassign positions sequentially */
      const updateQueries = newOrder.map((row, index) =>
        queryPromise('UPDATE counselling_area SET position = ? WHERE counselling_area_id = ?', [index + 1, row.id])
      );

      await Promise.all(updateQueries);

      /* Fetch updated paginated data */
      const { limit = 10, page = 1 } = req.body;
      const offset = (page - 1) * limit;
      const results = await queryPromise('SELECT * FROM counselling_area ORDER BY position LIMIT ? OFFSET ?', [limit, offset]);

      const countResult = await queryPromise('SELECT COUNT(*) AS total FROM counselling_area');
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      return res.status(200).json(
        service.serviceResponse(true, '000', errorMessages.success, {
          data: results,
          pagination: {
            currentPage: page,
            limit,
            totalPages,
            totalRecords: total
          }
        })
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  /* Counselling Area API End */

  /* Contact Enquiry API Start */
  contactEnquiryList: async (req, res) => {
    try {
      const sortableColumns = ['contact_enquiry_id', 'position', 'name', 'email', 'enquiry_type', 'created_at'];
      const order = sortableColumns.includes(req.query.order) ? req.query.order : 'created_at';
      const dir = req.query.desc === 'false' ? 'ASC' : 'DESC';
      const search = (req.query.search || '').trim();
      const type = req.query.enquiry_type || 'all';
      const dateFrom = req.query.date_from || '';
      const dateTo = req.query.date_to || '';

      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
      const offset = (page - 1) * limit;

      const whereConditions = [];
      const whereParams = [];

      if (search) {
        whereConditions.push('(name LIKE ? OR email LIKE ? OR subject LIKE ?)');
        whereParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }
      if (['General', 'Partnership', 'Platform Support'].includes(type)) {
        whereConditions.push('enquiry_type = ?');
        whereParams.push(type);
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateFrom)) {
        whereConditions.push('created_at >= ?');
        whereParams.push(`${dateFrom} 00:00:00`);
      }
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateTo)) {
        whereConditions.push('created_at <= ?');
        whereParams.push(`${dateTo} 23:59:59`);
      }

      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      const countResult = await queryPromise(`SELECT COUNT(*) AS total FROM contact_enquiry ${whereClause}`, whereParams);
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      const results = await queryPromise(
        `SELECT * FROM contact_enquiry ${whereClause} ORDER BY ${order} ${dir}, contact_enquiry_id DESC LIMIT ? OFFSET ?`,
        [...whereParams, limit, offset]
      );

      return res.status(200).json(
        service.serviceResponse(true, '000', errorMessages.success, {
          data: results,
          pagination: {
            totalRecords: total,
            totalPages,
            currentPage: page,
            limit
          }
        })
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  /*
    Drag & drop order. contact_enquiry_ids = ids of the rows on the current page in their new order.
    They are re-assigned to the position slots they already occupied. `position` is UNIQUE, so every row is
    first moved out of the way and then written back as 1..N (no two rows ever share a value).
  */
  updateContactEnquiryPosition: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['contact_enquiry_ids']));
      if (_.isEmpty(params.contact_enquiry_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const newIds = String(params.contact_enquiry_ids)
        .split(/\s*,\s*/)
        .map(Number)
        .filter(Boolean);
      if (newIds.length === 0 || new Set(newIds).size !== newIds.length) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const allRows = await queryPromise('SELECT contact_enquiry_id FROM contact_enquiry ORDER BY position ASC, contact_enquiry_id ASC');
      const allIds = allRows.map((row) => row.contact_enquiry_id);
      const slots = allIds.map((id, index) => (newIds.includes(id) ? index : -1)).filter((index) => index >= 0);

      if (slots.length !== newIds.length) {
        return res.status(200).json(service.serviceResponse(false, '000', 'Invalid IDs in request.'));
      }

      const finalOrder = [...allIds];
      slots.forEach((slot, i) => {
        finalOrder[slot] = newIds[i];
      });

      await queryPromise('UPDATE contact_enquiry SET position = position + 1000000');
      for (let i = 0; i < finalOrder.length; i++) {
        await queryPromise('UPDATE contact_enquiry SET position = ? WHERE contact_enquiry_id = ?', [i + 1, finalOrder[i]]);
      }

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  deleteContactEnquiry: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['contact_enquiry_ids']));
      if (_.isEmpty(params.contact_enquiry_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const ids = String(params.contact_enquiry_ids)
        .split(/\s*,\s*/)
        .map(Number)
        .filter((id) => Number.isInteger(id) && id > 0);
      if (ids.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      await queryPromise('DELETE FROM contact_enquiry WHERE contact_enquiry_id IN (?)', [ids]);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  /* Contact Enquiry API End */

  /* CMS Pages API Start */
  updateCMSHome: async (req, res) => {
    try {
      const params = await service.trimObject(
        _.pick(req.body, [
          'banner_title',
          'banner_description',
          'about_short_description',
          'who_we_are_description',
          'home_affordable_for_all_title',
          'home_affordable_for_all_description'
        ])
      );

      if (
        _.isEmpty(params.banner_title) ||
        _.isEmpty(params.banner_description) ||
        _.isEmpty(params.about_short_description) ||
        _.isEmpty(params.who_we_are_description) ||
        _.isEmpty(params.home_affordable_for_all_title) ||
        _.isEmpty(params.home_affordable_for_all_description)
      ) {
        service.deleteUploadedFiles(req.files);
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      /* Check if banner image was uploaded */
      if (req.files.banner_image) {
        const banner_image = req.files.banner_image[0];
        params['banner_image'] = banner_image.filename;
      }

      /* Check if home about image was uploaded */
      if (req.files.home_who_we_are_image) {
        const home_who_we_are_image = req.files.home_who_we_are_image[0];
        params['home_who_we_are_image'] = home_who_we_are_image.filename;
      }

      /* Check if home about image was uploaded */
      if (req.files.home_affordable_for_all_image) {
        const home_affordable_for_all_image = req.files.home_affordable_for_all_image[0];
        params['home_affordable_for_all_image'] = home_affordable_for_all_image.filename;
      }

      const updatePromises = [];
      updatePromises.push(
        Object.keys(params).map((key) => {
          return db.query('UPDATE cms SET value = ? WHERE `key` = ?', [params[key], key]);
        })
      );

      await Promise.all(updatePromises);

      // 🔔 Update Notification
      // const io = getIO();
      //io.to(`web`).emit('home-update');

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      service.deleteUploadedFiles(req.files);
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  getCMSHome: async (req, res) => {
    try {
      db.query(
        "SELECT * FROM cms WHERE `key` IN ('banner_image', 'banner_title', 'banner_description', 'home_who_we_are_image', 'about_short_description', 'who_we_are_description', 'home_affordable_for_all_title', 'home_affordable_for_all_description', 'home_affordable_for_all_image')",
        (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          const resObj = {};
          results.forEach((record) => {
            if (record.key == 'banner_image' || record.key == 'home_who_we_are_image' || record.key == 'home_affordable_for_all_image') {
              const imagePath = `${req.protocol}://${req.get('host')}/uploads/cms_page/${record.value}`;
              resObj[record.key] = imagePath;
            } else {
              resObj[record.key] = record.value;
            }
          });

          return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success, resObj));
        }
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateCMSAbout: async (req, res) => {
    try {
      const params = await service.trimObject(
        _.pick(req.body, [
          'about_us',
          'who_we_are',
          'our_mission',
          'what_make_us_different_title_one',
          'what_make_us_different_description_one',
          'what_make_us_different_title_two',
          'what_make_us_different_description_two',
          'what_make_us_different_title_three',
          'what_make_us_different_description_three',
          'what_make_us_different_title_four',
          'what_make_us_different_description_four',
          'why_choose_first4counselling',
          'get_started_today'
        ])
      );

      if (
        _.isEmpty(params.about_us) ||
        _.isEmpty(params.who_we_are) ||
        _.isEmpty(params.our_mission) ||
        _.isEmpty(params.what_make_us_different_title_one) ||
        _.isEmpty(params.what_make_us_different_description_one) ||
        _.isEmpty(params.what_make_us_different_title_two) ||
        _.isEmpty(params.what_make_us_different_description_two) ||
        _.isEmpty(params.what_make_us_different_title_three) ||
        _.isEmpty(params.what_make_us_different_description_three) ||
        _.isEmpty(params.what_make_us_different_title_four) ||
        _.isEmpty(params.what_make_us_different_description_four) ||
        _.isEmpty(params.why_choose_first4counselling) ||
        _.isEmpty(params.get_started_today)
      ) {
        service.deleteUploadedFiles(req.files);
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      /* Check if banner image was uploaded */
      if (req.files.who_we_are_image) {
        const who_we_are_image = req.files.who_we_are_image[0];
        params['who_we_are_image'] = who_we_are_image.filename;
      }

      /* Check if home about image was uploaded */
      if (req.files.our_mission_image) {
        const our_mission_image = req.files.our_mission_image[0];
        params['our_mission_image'] = our_mission_image.filename;
      }

      /* Check if what make us different image one was uploaded */
      if (req.files.what_make_us_different_image_one) {
        const what_make_us_different_image_one = req.files.what_make_us_different_image_one[0];
        params['what_make_us_different_image_one'] = what_make_us_different_image_one.filename;
      }

      /* Check if what make us different image two was uploaded */
      if (req.files.what_make_us_different_image_two) {
        const what_make_us_different_image_two = req.files.what_make_us_different_image_two[0];
        params['what_make_us_different_image_two'] = what_make_us_different_image_two.filename;
      }

      /* Check if what make us different image three was uploaded */
      if (req.files.what_make_us_different_image_three) {
        const what_make_us_different_image_three = req.files.what_make_us_different_image_three[0];
        params['what_make_us_different_image_three'] = what_make_us_different_image_three.filename;
      }

      /* Check if what make us different image four was uploaded */
      if (req.files.what_make_us_different_image_four) {
        const what_make_us_different_image_four = req.files.what_make_us_different_image_four[0];
        params['what_make_us_different_image_four'] = what_make_us_different_image_four.filename;
      }

      const updatePromises = [];
      updatePromises.push(
        Object.keys(params).map((key) => {
          return db.query('UPDATE cms SET value = ? WHERE `key` = ?', [params[key], key]);
        })
      );

      await Promise.all(updatePromises);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      service.deleteUploadedFiles(req.files);
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  getCMSAbout: async (req, res) => {
    try {
      db.query(
        "SELECT * FROM cms WHERE `key` IN ('about_us', 'who_we_are', 'who_we_are_image', 'our_mission', 'our_mission_image', 'what_make_us_different_image_one', 'what_make_us_different_title_one', 'what_make_us_different_description_one', 'what_make_us_different_image_two', 'what_make_us_different_title_two', 'what_make_us_different_description_two', 'what_make_us_different_image_three', 'what_make_us_different_title_three', 'what_make_us_different_description_three', 'what_make_us_different_image_four', 'what_make_us_different_title_four', 'what_make_us_different_description_four', 'why_choose_first4counselling', 'get_started_today')",
        (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          const resObj = {};
          results.forEach((record) => {
            if (
              record.key == 'who_we_are_image' ||
              record.key == 'our_mission_image' ||
              record.key == 'what_make_us_different_image_one' ||
              record.key == 'what_make_us_different_image_two' ||
              record.key == 'what_make_us_different_image_three' ||
              record.key == 'what_make_us_different_image_four'
            ) {
              const imagePath = `${req.protocol}://${req.get('host')}/uploads/cms_page/${record.value}`;
              resObj[record.key] = imagePath;
            } else {
              resObj[record.key] = record.value;
            }
          });

          return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success, resObj));
        }
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateCMSAffordable4All: async (req, res) => {
    try {
      const params = await service.trimObject(
        _.pick(req.body, [
          'counselling_thats_affordable_4_all_description',
          'how_it_works_short_description',
          'step1_title',
          'step1_description',
          'step2_title',
          'step2_description',
          'step3_title',
          'step3_description',
          'step4_title',
          'step4_description',
          'why_choose_set_your_own_budget_title1',
          'why_choose_set_your_own_budget_description1',
          'why_choose_set_your_own_budget_title2',
          'why_choose_set_your_own_budget_description2',
          'why_choose_set_your_own_budget_title3',
          'why_choose_set_your_own_budget_description3',
          'why_choose_set_your_own_budget_title4',
          'why_choose_set_your_own_budget_description4',
          'our_commitment_to_affordable_counselling_description',
          'start_your_journey_today_description'
        ])
      );

      if (
        _.isEmpty(params.counselling_thats_affordable_4_all_description) ||
        _.isEmpty(params.how_it_works_short_description) ||
        _.isEmpty(params.step1_title) ||
        _.isEmpty(params.step1_description) ||
        _.isEmpty(params.step2_title) ||
        _.isEmpty(params.step2_description) ||
        _.isEmpty(params.step3_title) ||
        _.isEmpty(params.step3_description) ||
        _.isEmpty(params.step4_title) ||
        _.isEmpty(params.step4_description) ||
        _.isEmpty(params.why_choose_set_your_own_budget_title1) ||
        _.isEmpty(params.why_choose_set_your_own_budget_description1) ||
        _.isEmpty(params.why_choose_set_your_own_budget_title2) ||
        _.isEmpty(params.why_choose_set_your_own_budget_description2) ||
        _.isEmpty(params.why_choose_set_your_own_budget_title3) ||
        _.isEmpty(params.why_choose_set_your_own_budget_description3) ||
        _.isEmpty(params.why_choose_set_your_own_budget_title4) ||
        _.isEmpty(params.why_choose_set_your_own_budget_description4) ||
        _.isEmpty(params.our_commitment_to_affordable_counselling_description) ||
        _.isEmpty(params.start_your_journey_today_description)
      ) {
        service.deleteUploadedFiles(req.files);
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      /* Check if banner image was uploaded */
      if (req.files.why_choose_set_your_own_budget_image) {
        const why_choose_set_your_own_budget_image = req.files.why_choose_set_your_own_budget_image[0];
        params['why_choose_set_your_own_budget_image'] = why_choose_set_your_own_budget_image.filename;
      }

      const updatePromises = [];
      updatePromises.push(
        Object.keys(params).map((key) => {
          return db.query('UPDATE cms SET value = ? WHERE `key` = ?', [params[key], key]);
        })
      );

      await Promise.all(updatePromises);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  getCMSAffordable4All: async (req, res) => {
    try {
      db.query(
        "SELECT * FROM cms WHERE `key` IN ('counselling_thats_affordable_4_all_description', 'how_it_works_short_description', 'step1_title', 'step1_description', 'step2_title', 'step2_description', 'step3_title', 'step3_description', 'step4_title', 'step4_description', 'why_choose_set_your_own_budget_image', 'why_choose_set_your_own_budget_title1', 'why_choose_set_your_own_budget_description1', 'why_choose_set_your_own_budget_title2', 'why_choose_set_your_own_budget_description2', 'why_choose_set_your_own_budget_title3', 'why_choose_set_your_own_budget_description3', 'why_choose_set_your_own_budget_title4', 'why_choose_set_your_own_budget_description4', 'our_commitment_to_affordable_counselling_description', 'start_your_journey_today_description')",
        (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          const resObj = {};
          results.forEach((record) => {
            if (record.key == 'why_choose_set_your_own_budget_image') {
              const imagePath = `${req.protocol}://${req.get('host')}/uploads/cms_page/${record.value}`;
              resObj[record.key] = imagePath;
            } else {
              resObj[record.key] = record.value;
            }
          });

          return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success, resObj));
        }
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateCMSBecomeACounselor: async (req, res) => {
    try {
      const params = await service.trimObject(
        _.pick(req.body, [
          'become_a_counsellor_banner_title',
          'become_a_counsellor_banner_description',
          'why_join_f4c_description',
          'why_join_f4c_title1',
          'why_join_f4c_short_description1',
          'why_join_f4c_title2',
          'why_join_f4c_short_description2',
          'why_join_f4c_title3',
          'why_join_f4c_short_description3',
          'why_join_f4c_title4',
          'why_join_f4c_short_description4',
          'apply_to_be_counselor_description',
          'individual_description',
          'organization_description',
          'how_it_works_description',
          'how_it_works_title1',
          'how_it_works_short_description1',
          'how_it_works_title2',
          'how_it_works_short_description2',
          'how_it_works_title3',
          'how_it_works_short_description3',
          'how_it_works_title4',
          'how_it_works_short_description4',
          'begin_your_journey_now_description'
        ])
      );

      if (
        _.isEmpty(params.become_a_counsellor_banner_title) ||
        _.isEmpty(params.become_a_counsellor_banner_description) ||
        _.isEmpty(params.why_join_f4c_description) ||
        _.isEmpty(params.why_join_f4c_title1) ||
        _.isEmpty(params.why_join_f4c_short_description1) ||
        _.isEmpty(params.why_join_f4c_title2) ||
        _.isEmpty(params.why_join_f4c_short_description2) ||
        _.isEmpty(params.why_join_f4c_title3) ||
        _.isEmpty(params.why_join_f4c_short_description3) ||
        _.isEmpty(params.why_join_f4c_title4) ||
        _.isEmpty(params.why_join_f4c_short_description4) ||
        _.isEmpty(params.apply_to_be_counselor_description) ||
        _.isEmpty(params.individual_description) ||
        _.isEmpty(params.organization_description) ||
        _.isEmpty(params.how_it_works_description) ||
        _.isEmpty(params.how_it_works_title1) ||
        _.isEmpty(params.how_it_works_short_description1) ||
        _.isEmpty(params.how_it_works_title2) ||
        _.isEmpty(params.how_it_works_short_description2) ||
        _.isEmpty(params.how_it_works_title3) ||
        _.isEmpty(params.how_it_works_short_description3) ||
        _.isEmpty(params.how_it_works_title4) ||
        _.isEmpty(params.how_it_works_short_description4) ||
        _.isEmpty(params.begin_your_journey_now_description)
      ) {
        service.deleteUploadedFiles(req.files);
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      /* Check if banner image was uploaded */
      if (req.files.become_a_counsellor_banner_image) {
        const become_a_counsellor_banner_image = req.files.become_a_counsellor_banner_image[0];
        params['become_a_counsellor_banner_image'] = become_a_counsellor_banner_image.filename;
      }

      const updatePromises = [];
      updatePromises.push(
        Object.keys(params).map((key) => {
          return db.query('UPDATE cms SET value = ? WHERE `key` = ?', [params[key], key]);
        })
      );

      await Promise.all(updatePromises);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  getCMSBecomeACounselor: async (req, res) => {
    try {
      db.query(
        "SELECT * FROM cms WHERE `key` IN ('become_a_counsellor_banner_image', 'become_a_counsellor_banner_title', 'become_a_counsellor_banner_description', 'why_join_f4c_description', 'why_join_f4c_title1', 'why_join_f4c_short_description1', 'why_join_f4c_title2', 'why_join_f4c_short_description2', 'why_join_f4c_title3', 'why_join_f4c_short_description3', 'why_join_f4c_title4', 'why_join_f4c_short_description4', 'apply_to_be_counselor_description', 'individual_description', 'organization_description', 'how_it_works_description', 'how_it_works_title1', 'how_it_works_short_description1', 'how_it_works_title2', 'how_it_works_short_description2', 'how_it_works_title3', 'how_it_works_short_description3', 'how_it_works_title4', 'how_it_works_short_description4', 'begin_your_journey_now_description')",
        (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          const resObj = {};
          results.forEach((record) => {
            if (record.key == 'become_a_counsellor_banner_image') {
              const imagePath = `${req.protocol}://${req.get('host')}/uploads/cms_page/${record.value}`;
              resObj[record.key] = imagePath;
            } else {
              resObj[record.key] = record.value;
            }
          });

          return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success, resObj));
        }
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateCMSBenefitsOfCounselling: async (req, res) => {
    try {
      const params = await service.trimObject(
        _.pick(req.body, ['benefits_of_counselling_description', 'is_counselling_right_for_you_description'])
      );

      if (_.isEmpty(params.benefits_of_counselling_description) || _.isEmpty(params.is_counselling_right_for_you_description)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const updatePromises = [];
      updatePromises.push(
        Object.keys(params).map((key) => {
          return db.query('UPDATE cms SET value = ? WHERE `key` = ?', [params[key], key]);
        })
      );

      await Promise.all(updatePromises);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  getCMSBenefitsOfCounselling: async (req, res) => {
    try {
      db.query(
        "SELECT * FROM cms WHERE `key` IN ('benefits_of_counselling_description', 'is_counselling_right_for_you_description')",
        (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          const resObj = {};
          results.forEach((record) => {
            resObj[record.key] = record.value;
          });

          return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success, resObj));
        }
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  whyYouNeedCounsellingList: async (req, res) => {
    try {
      /* Fetch updated paginated data */
      const order = req.query.order || 'position';
      const desc = req.query.desc;
      const dir = desc === 'true' ? 'DESC' : 'ASC';
      const search = req.query.search || '';

      const page = parseInt(req.query.page) || 1; /* Default to page 1 */
      const limit = parseInt(req.query.limit) || 10; /* Default to 10 items per page */
      const offset = (page - 1) * limit;

      /* Construct query dynamically */
      var dataQuery = '';
      var countQuery = '';

      var searchIn = `WHERE (title LIKE '%${search}%' OR description LIKE '%${search}%')`;

      if (search) {
        dataQuery = `SELECT * FROM why_you_need_counselling ${searchIn} ORDER BY ${order} ${dir}, why_you_need_counselling_id ${dir} LIMIT ? OFFSET ?`;
        countQuery = `SELECT COUNT(*) AS total FROM why_you_need_counselling ${searchIn}`;
      } else {
        dataQuery = `SELECT * FROM why_you_need_counselling ORDER BY ${order} ${dir}, why_you_need_counselling_id ${dir} LIMIT ? OFFSET ?`;
        countQuery = `SELECT COUNT(*) AS total FROM why_you_need_counselling`;
      }

      /* Execute the count query */
      db.query(countQuery, (err, countResult) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        /* Execute the data query */
        db.query(dataQuery, [limit, offset], (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }
          const resObj = results.map((item) => ({
            ...item,
            image: `${req.protocol}://${req.get('host')}/uploads/why_you_need_counselling_images/${item.image}`
          }));

          return res.status(200).json(
            service.serviceResponse(true, '000', errorMessages.success, {
              data: resObj,
              pagination: {
                totalRecords: total,
                totalPages,
                currentPage: page,
                limit
              }
            })
          );
        });
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  addWhyYouNeedCounselling: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['title', 'description', 'status']));

      if (_.isEmpty(params.title) || _.isEmpty(params.description) || _.isEmpty(params.status)) {
        service.deleteUploadedFiles(req.files);
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      /* Check if image was uploaded */
      if (req.files && req.files.image && req.files.image.length > 0) {
        const image = req.files.image[0];
        params['image'] = image.filename;
      } else {
        params['image'] = null;
      }

      db.query(
        'INSERT INTO why_you_need_counselling (title, image, description, status, created_at) VALUES (?, ?, ?, ?, ?)',
        [params.title, params.image, params.description, params.status, new Date()],
        (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          const imagePath = `${req.protocol}://${req.get('host')}/uploads/why_you_need_counselling_images/${params.image}`;
          return res.status(200).json(
            service.serviceResponse(true, '000', errorMessages.success, {
              why_you_need_counselling_id: results.insertId,
              title: params.title,
              image: imagePath,
              description: params.description,
              status: params.status
            })
          );
        }
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateWhyYouNeedCounselling: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['why_you_need_counselling_id', 'title', 'description', 'status']));

      if (
        _.isEmpty(params.why_you_need_counselling_id) ||
        _.isEmpty(params.title) ||
        _.isEmpty(params.description) ||
        _.isEmpty(params.status)
      ) {
        service.deleteUploadedFiles(req.files);
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      /* Check if logo1 was uploaded */
      if (req.files.image) {
        const image = req.files.image[0];
        params['image'] = image.filename;
      }

      if (params.image) {
        db.query(
          'UPDATE why_you_need_counselling SET title = ?, image = ?, description = ?, status = ? WHERE why_you_need_counselling_id = ?',
          [params.title, params.image, params.description, params.status, params.why_you_need_counselling_id],
          (err, results) => {
            if (err) {
              return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
            }

            const imagePath = `${req.protocol}://${req.get('host')}/uploads/why_you_need_counselling_images/${params.image}`;
            return res.status(200).json(
              service.serviceResponse(true, '000', errorMessages.success, {
                why_you_need_counselling_id: params.why_you_need_counselling_id,
                title: params.title,
                image: imagePath,
                description: params.description,
                status: params.status
              })
            );
          }
        );
      } else {
        db.query(
          'UPDATE why_you_need_counselling SET title = ?, description = ?, status = ? WHERE why_you_need_counselling_id = ?',
          [params.title, params.description, params.status, params.why_you_need_counselling_id],
          (err, results) => {
            if (err) {
              return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
            }
            return res.status(200).json(
              service.serviceResponse(true, '000', errorMessages.success, {
                why_you_need_counselling_id: params.why_you_need_counselling_id,
                title: params.title,
                description: params.description,
                status: params.status
              })
            );
          }
        );
      }
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  deleteWhyYouNeedCounselling: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['why_you_need_counselling_ids']));

      if (_.isEmpty(params.why_you_need_counselling_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const WhyYouNeedCounsellingIdsArray = params.why_you_need_counselling_ids.split(/\s*,\s*/);

      if (!Array.isArray(WhyYouNeedCounsellingIdsArray) || WhyYouNeedCounsellingIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const deleteQueries = [];
      deleteQueries.push(
        WhyYouNeedCounsellingIdsArray.map((why_you_need_counselling_id, index) => {
          return db.query('DELETE FROM why_you_need_counselling WHERE why_you_need_counselling_id = ?', [why_you_need_counselling_id]);
        })
      );

      await Promise.all(deleteQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  activeWhyYouNeedCounselling: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['why_you_need_counselling_ids']));

      if (_.isEmpty(params.why_you_need_counselling_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const WhyYouNeedCounsellingIdsArray = params.why_you_need_counselling_ids.split(/\s*,\s*/);

      if (!Array.isArray(WhyYouNeedCounsellingIdsArray) || WhyYouNeedCounsellingIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        WhyYouNeedCounsellingIdsArray.map((why_you_need_counselling_id, index) => {
          return db.query('UPDATE why_you_need_counselling SET status = ? WHERE why_you_need_counselling_id = ?', [
            1,
            why_you_need_counselling_id
          ]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  inactiveWhyYouNeedCounselling: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['why_you_need_counselling_ids']));

      if (_.isEmpty(params.why_you_need_counselling_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const WhyYouNeedCounsellingIdsArray = params.why_you_need_counselling_ids.split(/\s*,\s*/);

      if (!Array.isArray(WhyYouNeedCounsellingIdsArray) || WhyYouNeedCounsellingIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        WhyYouNeedCounsellingIdsArray.map((why_you_need_counselling_id, index) => {
          return db.query('UPDATE why_you_need_counselling SET status = ? WHERE why_you_need_counselling_id = ?', [
            0,
            why_you_need_counselling_id
          ]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateWhyYouNeedCounsellingPosition: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['why_you_need_counselling_ids']));

      if (_.isEmpty(params.why_you_need_counselling_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const WhyYouNeedCounsellingIdsArray = params.why_you_need_counselling_ids.split(/\s*,\s*/);
      if (!Array.isArray(WhyYouNeedCounsellingIdsArray) || WhyYouNeedCounsellingIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      /* Fetch ALL rows sorted by position */
      const allRows = await queryPromise('SELECT why_you_need_counselling_id, position FROM why_you_need_counselling ORDER BY position');

      /* Create a map of why_you_need_counselling_id -> position */
      const positionMap = new Map(allRows.map((row) => [row.why_you_need_counselling_id, row.position]));

      /* Extract only the moved IDs and adjust their positions globally */
      const movedRows = WhyYouNeedCounsellingIdsArray.map((id) => ({
        id,
        position: positionMap.get(Number(id))
      })).filter((row) => row.position !== undefined);

      if (movedRows.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', 'Invalid IDs in request.'));
      }

      /* Remove moved rows from the original list */
      const remainingRows = allRows.filter((row) => !WhyYouNeedCounsellingIdsArray.includes(String(row.why_you_need_counselling_id)));

      /* Reconstruct the ordered list */
      let newOrder = [...remainingRows];

      /* Find where to insert moved rows */
      const startPosition = movedRows[0].position; /* Get the first item's original position */
      newOrder.splice(startPosition - 1, 0, ...movedRows); /* Insert at correct place */

      /* Reassign positions sequentially */
      const updateQueries = newOrder.map((row, index) =>
        queryPromise('UPDATE why_you_need_counselling SET position = ? WHERE why_you_need_counselling_id = ?', [index + 1, row.id])
      );

      await Promise.all(updateQueries);

      /* Fetch updated paginated data */
      const { limit = 10, page = 1 } = req.body;
      const offset = (page - 1) * limit;
      const results = await queryPromise('SELECT * FROM why_you_need_counselling ORDER BY position LIMIT ? OFFSET ?', [limit, offset]);

      const countResult = await queryPromise('SELECT COUNT(*) AS total FROM why_you_need_counselling');
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      const resObj = results.map((item) => ({
        ...item,
        image: `${req.protocol}://${req.get('host')}/uploads/why_you_need_counselling_images/${item.image}`
      }));

      return res.status(200).json(
        service.serviceResponse(true, '000', errorMessages.success, {
          data: resObj,
          pagination: {
            currentPage: page,
            limit,
            totalPages,
            totalRecords: total
          }
        })
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  benefitsOfEngagingInCounsellingList: async (req, res) => {
    try {
      /* Fetch updated paginated data */
      const order = req.query.order || 'position';
      const desc = req.query.desc;
      const dir = desc === 'true' ? 'DESC' : 'ASC';
      const search = req.query.search || '';

      const page = parseInt(req.query.page) || 1; /* Default to page 1 */
      const limit = parseInt(req.query.limit) || 10; /* Default to 10 items per page */
      const offset = (page - 1) * limit;

      /* Construct query dynamically */
      var dataQuery = '';
      var countQuery = '';

      var searchIn = `WHERE (title LIKE '%${search}%' OR description LIKE '%${search}%')`;

      if (search) {
        dataQuery = `SELECT * FROM benefits_of_engaging_in_counselling ${searchIn} ORDER BY ${order} ${dir}, benefits_of_engaging_in_counselling_id ${dir} LIMIT ? OFFSET ?`;
        countQuery = `SELECT COUNT(*) AS total FROM benefits_of_engaging_in_counselling ${searchIn}`;
      } else {
        dataQuery = `SELECT * FROM benefits_of_engaging_in_counselling ORDER BY ${order} ${dir}, benefits_of_engaging_in_counselling_id ${dir} LIMIT ? OFFSET ?`;
        countQuery = `SELECT COUNT(*) AS total FROM benefits_of_engaging_in_counselling`;
      }

      /* Execute the count query */
      db.query(countQuery, (err, countResult) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        /* Execute the data query */
        db.query(dataQuery, [limit, offset], (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          /* Return the paginated data along with metadata */
          return res.status(200).json(
            service.serviceResponse(true, '000', errorMessages.success, {
              data: results,
              pagination: {
                totalRecords: total,
                totalPages,
                currentPage: page,
                limit
              }
            })
          );
        });
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  addBenefitsOfEngagingInCounselling: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['title', 'description', 'status']));

      if (_.isEmpty(params.title) || _.isEmpty(params.description) || _.isEmpty(params.status)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      db.query(
        'INSERT INTO benefits_of_engaging_in_counselling (title, description, status, created_at) VALUES (?, ?, ?, ?)',
        [params.title, params.description, params.status, new Date()],
        (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          return res.status(200).json(
            service.serviceResponse(true, '000', errorMessages.success, {
              benefits_of_engaging_in_counselling_id: results.insertId,
              title: params.title,
              description: params.description,
              status: params.status
            })
          );
        }
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateBenefitsOfEngagingInCounselling: async (req, res) => {
    try {
      const params = await service.trimObject(
        _.pick(req.body, ['benefits_of_engaging_in_counselling_id', 'title', 'description', 'status'])
      );

      if (
        _.isEmpty(params.benefits_of_engaging_in_counselling_id) ||
        _.isEmpty(params.title) ||
        _.isEmpty(params.description) ||
        _.isEmpty(params.status)
      ) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }
      db.query(
        'UPDATE benefits_of_engaging_in_counselling SET title = ?, description = ?, status = ? WHERE benefits_of_engaging_in_counselling_id = ?',
        [params.title, params.description, params.status, params.benefits_of_engaging_in_counselling_id],
        (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }
          return res.status(200).json(
            service.serviceResponse(true, '000', errorMessages.success, {
              benefits_of_engaging_in_counselling_id: params.benefits_of_engaging_in_counselling_id,
              title: params.title,
              description: params.description,
              status: params.status
            })
          );
        }
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  deleteBenefitsOfEngagingInCounselling: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['benefits_of_engaging_in_counselling_ids']));

      if (_.isEmpty(params.benefits_of_engaging_in_counselling_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const BenefitsOfEngagingInCounsellingIdsArray = params.benefits_of_engaging_in_counselling_ids.split(/\s*,\s*/);

      if (!Array.isArray(BenefitsOfEngagingInCounsellingIdsArray) || BenefitsOfEngagingInCounsellingIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const deleteQueries = [];
      deleteQueries.push(
        BenefitsOfEngagingInCounsellingIdsArray.map((benefits_of_engaging_in_counselling_id, index) => {
          return db.query('DELETE FROM benefits_of_engaging_in_counselling WHERE benefits_of_engaging_in_counselling_id = ?', [
            benefits_of_engaging_in_counselling_id
          ]);
        })
      );

      await Promise.all(deleteQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  activeBenefitsOfEngagingInCounselling: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['benefits_of_engaging_in_counselling_ids']));

      if (_.isEmpty(params.benefits_of_engaging_in_counselling_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const BenefitsOfEngagingInCounsellingIdsArray = params.benefits_of_engaging_in_counselling_ids.split(/\s*,\s*/);

      if (!Array.isArray(BenefitsOfEngagingInCounsellingIdsArray) || BenefitsOfEngagingInCounsellingIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        BenefitsOfEngagingInCounsellingIdsArray.map((benefits_of_engaging_in_counselling_id, index) => {
          return db.query('UPDATE benefits_of_engaging_in_counselling SET status = ? WHERE benefits_of_engaging_in_counselling_id = ?', [
            1,
            benefits_of_engaging_in_counselling_id
          ]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  inactiveBenefitsOfEngagingInCounselling: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['benefits_of_engaging_in_counselling_ids']));

      if (_.isEmpty(params.benefits_of_engaging_in_counselling_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const BenefitsOfEngagingInCounsellingIdsArray = params.benefits_of_engaging_in_counselling_ids.split(/\s*,\s*/);

      if (!Array.isArray(BenefitsOfEngagingInCounsellingIdsArray) || BenefitsOfEngagingInCounsellingIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        BenefitsOfEngagingInCounsellingIdsArray.map((benefits_of_engaging_in_counselling_id, index) => {
          return db.query('UPDATE benefits_of_engaging_in_counselling SET status = ? WHERE benefits_of_engaging_in_counselling_id = ?', [
            0,
            benefits_of_engaging_in_counselling_id
          ]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateBenefitsOfEngagingInCounsellingPosition: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['benefits_of_engaging_in_counselling_ids']));

      if (_.isEmpty(params.benefits_of_engaging_in_counselling_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const BenefitsOfEngagingInCounsellingIdsArray = params.benefits_of_engaging_in_counselling_ids.split(/\s*,\s*/);
      if (!Array.isArray(BenefitsOfEngagingInCounsellingIdsArray) || BenefitsOfEngagingInCounsellingIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      /* Fetch ALL rows sorted by position */
      const allRows = await queryPromise(
        'SELECT benefits_of_engaging_in_counselling_id, position FROM benefits_of_engaging_in_counselling ORDER BY position'
      );

      /* Create a map of benefits_of_engaging_in_counselling_id -> position */
      const positionMap = new Map(allRows.map((row) => [row.benefits_of_engaging_in_counselling_id, row.position]));

      /* Extract only the moved IDs and adjust their positions globally */
      const movedRows = BenefitsOfEngagingInCounsellingIdsArray.map((id) => ({
        id,
        position: positionMap.get(Number(id))
      })).filter((row) => row.position !== undefined);

      if (movedRows.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', 'Invalid IDs in request.'));
      }

      /* Remove moved rows from the original list */
      const remainingRows = allRows.filter(
        (row) => !BenefitsOfEngagingInCounsellingIdsArray.includes(String(row.benefits_of_engaging_in_counselling_id))
      );

      /* Reconstruct the ordered list */
      let newOrder = [...remainingRows];

      /* Find where to insert moved rows */
      const startPosition = movedRows[0].position; /* Get the first item's original position */
      newOrder.splice(startPosition - 1, 0, ...movedRows); /* Insert at correct place */

      /* Reassign positions sequentially */
      const updateQueries = newOrder.map((row, index) =>
        queryPromise('UPDATE benefits_of_engaging_in_counselling SET position = ? WHERE benefits_of_engaging_in_counselling_id = ?', [
          index + 1,
          row.id
        ])
      );

      await Promise.all(updateQueries);

      /* Fetch updated paginated data */
      const { limit = 10, page = 1 } = req.body;
      const offset = (page - 1) * limit;
      const results = await queryPromise('SELECT * FROM benefits_of_engaging_in_counselling ORDER BY position LIMIT ? OFFSET ?', [
        limit,
        offset
      ]);

      const countResult = await queryPromise('SELECT COUNT(*) AS total FROM benefits_of_engaging_in_counselling');
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      return res.status(200).json(
        service.serviceResponse(true, '000', errorMessages.success, {
          data: results,
          pagination: {
            currentPage: page,
            limit,
            totalPages,
            totalRecords: total
          }
        })
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  /* CMS Pages API End */

  /* Team API Start */
  teamList: async (req, res) => {
    try {
      /* Fetch updated paginated data */
      const order = req.query.order || 'position';
      const desc = req.query.desc;
      const dir = desc === 'true' ? 'DESC' : 'ASC';
      const search = req.query.search || '';
      const status = req.query.status || 'all';

      const page = parseInt(req.query.page) || 1; /* Default to page 1 */
      const limit = parseInt(req.query.limit) || 10; /* Default to 10 items per page */
      const offset = (page - 1) * limit;

      /* Construct query dynamically */
      let whereConditions = [];

      /* Add search condition */
      if (search) {
        whereConditions.push(`(name LIKE '%${search}%' OR designation LIKE '%${search}%')`);
      }

      /* Add status filter */
      if (status !== 'all') {
        whereConditions.push(`status = '${status}'`);
      }

      /* Combine where clause */
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      /* Construct query dynamically */
      dataQuery = `SELECT * FROM team ${whereClause} ORDER BY ${order} ${dir}, team_id ${dir} LIMIT ? OFFSET ?`;
      countQuery = `SELECT COUNT(*) AS total FROM team ${whereClause}`;

      /* Execute the count query */
      db.query(countQuery, (err, countResult) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        /* Execute the data query */
        db.query(dataQuery, [limit, offset], (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }
          const resObj = results.map((item) => ({
            ...item,
            profile_pic: `${req.protocol}://${req.get('host')}/uploads/team/${item.profile_pic}`
          }));

          return res.status(200).json(
            service.serviceResponse(true, '000', errorMessages.success, {
              data: resObj,
              pagination: {
                totalRecords: total,
                totalPages,
                currentPage: page,
                limit
              }
            })
          );
        });
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  addTeam: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['name', 'designation', 'description', 'status']));

      if (_.isEmpty(params.name) || _.isEmpty(params.designation) || _.isEmpty(params.description) || _.isEmpty(params.status)) {
        service.deleteUploadedFiles(req.files);
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      /* Check if logo1 was uploaded */
      if (req.files.profile_pic) {
        const profile_pic = req.files.profile_pic[0];
        params['profile_pic'] = profile_pic.filename;
      } else {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      db.query(
        'INSERT INTO team (profile_pic, name, designation, description, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [params.profile_pic, params.name, params.designation, params.description, params.status, new Date()],
        (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          const imagePath = `${req.protocol}://${req.get('host')}/uploads/team/${params.profile_pic}`;
          return res.status(200).json(
            service.serviceResponse(true, '000', errorMessages.success, {
              team_id: results.insertId,
              profile_pic: imagePath,
              name: params.name,
              designation: params.designation,
              description: params.description,
              status: params.status
            })
          );
        }
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateTeam: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['team_id', 'name', 'designation', 'description', 'status']));

      if (
        _.isEmpty(params.team_id) ||
        _.isEmpty(params.name) ||
        _.isEmpty(params.designation) ||
        _.isEmpty(params.description) ||
        _.isEmpty(params.status)
      ) {
        service.deleteUploadedFiles(req.files);
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      /* Check if logo1 was uploaded */
      if (req.files.profile_pic) {
        const profile_pic = req.files.profile_pic[0];
        params['profile_pic'] = profile_pic.filename;
      }

      if (params.profile_pic) {
        db.query(
          'UPDATE team SET profile_pic = ?, name = ?, designation = ?, description = ?, status = ? WHERE team_id = ?',
          [params.profile_pic, params.name, params.designation, params.description, params.status, params.team_id],
          (err, results) => {
            if (err) {
              return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
            }

            const imagePath = `${req.protocol}://${req.get('host')}/uploads/team/${params.profile_pic}`;
            return res.status(200).json(
              service.serviceResponse(true, '000', errorMessages.success, {
                team_id: params.team_id,
                profile_pic: imagePath,
                name: params.name,
                designation: params.designation,
                description: params.description,
                status: params.status
              })
            );
          }
        );
      } else {
        db.query(
          'UPDATE team SET name = ?, designation = ?, description = ?, status = ? WHERE team_id = ?',
          [params.name, params.designation, params.description, params.status, params.team_id],
          (err, results) => {
            if (err) {
              return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
            }
            return res.status(200).json(
              service.serviceResponse(true, '000', errorMessages.success, {
                team_id: params.team_id,
                name: params.name,
                designation: params.designation,
                description: params.description,
                status: params.status
              })
            );
          }
        );
      }
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  deleteTeam: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['team_ids']));

      if (_.isEmpty(params.team_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const teamIdsArray = params.team_ids.split(/\s*,\s*/);

      if (!Array.isArray(teamIdsArray) || teamIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const deleteQueries = [];
      deleteQueries.push(
        teamIdsArray.map((team_id, index) => {
          return db.query('DELETE FROM team WHERE team_id = ?', [team_id]);
        })
      );

      await Promise.all(deleteQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  activeTeam: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['team_ids']));

      if (_.isEmpty(params.team_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const teamIdsArray = params.team_ids.split(/\s*,\s*/);

      if (!Array.isArray(teamIdsArray) || teamIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        teamIdsArray.map((team_id, index) => {
          return db.query('UPDATE team SET status = ? WHERE team_id = ?', [1, team_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  inactiveTeam: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['team_ids']));

      if (_.isEmpty(params.team_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const teamIdsArray = params.team_ids.split(/\s*,\s*/);

      if (!Array.isArray(teamIdsArray) || teamIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        teamIdsArray.map((team_id, index) => {
          return db.query('UPDATE team SET status = ? WHERE team_id = ?', [0, team_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateTeamPosition: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['team_ids']));

      if (_.isEmpty(params.team_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const teamIdsArray = params.team_ids.split(/\s*,\s*/);
      if (!Array.isArray(teamIdsArray) || teamIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      /* Fetch ALL rows sorted by position */
      const allRows = await queryPromise('SELECT team_id, position FROM team ORDER BY position');

      /* Create a map of team_id -> position */
      const positionMap = new Map(allRows.map((row) => [row.team_id, row.position]));

      /* Extract only the moved IDs and adjust their positions globally */
      const movedRows = teamIdsArray
        .map((id) => ({ id, position: positionMap.get(Number(id)) }))
        .filter((row) => row.position !== undefined);

      if (movedRows.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', 'Invalid IDs in request.'));
      }

      /* Remove moved rows from the original list */
      const remainingRows = allRows.filter((row) => !teamIdsArray.includes(String(row.team_id)));

      /* Reconstruct the ordered list */
      let newOrder = [...remainingRows];

      /* Find where to insert moved rows */
      const startPosition = movedRows[0].position; /* Get the first item's original position */
      newOrder.splice(startPosition - 1, 0, ...movedRows); /* Insert at correct place */

      /* Reassign positions sequentially */
      const updateQueries = newOrder.map((row, index) =>
        queryPromise('UPDATE team SET position = ? WHERE team_id = ?', [index + 1, row.id])
      );

      await Promise.all(updateQueries);

      /* Fetch updated paginated data */
      const { limit = 10, page = 1 } = req.body;
      const offset = (page - 1) * limit;
      const results = await queryPromise('SELECT * FROM team ORDER BY position LIMIT ? OFFSET ?', [limit, offset]);

      const countResult = await queryPromise('SELECT COUNT(*) AS total FROM team');
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      const resObj = results.map((item) => ({
        ...item,
        profile_pic: `${req.protocol}://${req.get('host')}/uploads/team/${item.profile_pic}`
      }));

      return res.status(200).json(
        service.serviceResponse(true, '000', errorMessages.success, {
          data: resObj,
          pagination: {
            currentPage: page,
            limit,
            totalPages,
            totalRecords: total
          }
        })
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  /* Team API End */

  /* Session Types API Start */
  sessionTypesList: async (req, res) => {
    try {
      /* Fetch updated paginated data */
      const order = req.query.order || 'position';
      const desc = req.query.desc;
      const dir = desc === 'true' ? 'DESC' : 'ASC';
      const search = req.query.search || '';
      const status = req.query.status || 'all';

      const page = parseInt(req.query.page) || 1; /* Default to page 1 */
      const limit = parseInt(req.query.limit) || 10; /* Default to 10 items per page */
      const offset = (page - 1) * limit;

      /* Construct query dynamically */
      let whereConditions = [];

      /* Add search condition */
      if (search) {
        whereConditions.push(`session_type LIKE '%${search}%'`);
      }

      /* Add status filter */
      if (status !== 'all') {
        whereConditions.push(`status = '${status}'`);
      }

      /* Combine where clause */
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      dataQuery = `SELECT * FROM session_types ${whereClause} ORDER BY ${order} ${dir}, session_type_id ${dir} LIMIT ? OFFSET ?`;
      countQuery = `SELECT COUNT(*) AS total FROM session_types ${whereClause}`;

      /* Execute the count query */
      db.query(countQuery, (err, countResult) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        /* Execute the data query */
        db.query(dataQuery, [limit, offset], (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          /* Return the paginated data along with metadata */
          return res.status(200).json(
            service.serviceResponse(true, '000', errorMessages.success, {
              data: results,
              pagination: {
                totalRecords: total,
                totalPages,
                currentPage: page,
                limit
              }
            })
          );
        });
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  addSessionTypes: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['session_type', 'status']));

      if (_.isEmpty(params.session_type) || _.isEmpty(params.status)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      params.session_type = service.capitalizeFirstLetter(params.session_type);

      db.query('SELECT * FROM session_types WHERE session_type = ?', [params.session_type], (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        if (results.length >= 1) {
          return res.status(200).json(service.serviceResponse(false, '000', errorMessages.sameRecordAlreadyExistError));
        } else {
          db.query(
            'INSERT INTO session_types (session_type, status, created_at) VALUES (?, ?, ?)',
            [params.session_type, params.status, new Date()],
            (err, results) => {
              if (err) {
                return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
              }

              return res.status(200).json(
                service.serviceResponse(true, '000', errorMessages.success, {
                  session_type_id: results.insertId,
                  session_type: params.session_type,
                  status: params.status
                })
              );
            }
          );
        }
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateSessionTypes: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['session_type_id', 'session_type', 'status']));

      if (_.isEmpty(params.session_type_id) || _.isEmpty(params.session_type) || _.isEmpty(params.status)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      params.session_type = service.capitalizeFirstLetter(params.session_type);

      db.query(
        'SELECT * FROM session_types WHERE session_type = ? AND session_type_id != ?',
        [params.session_type, params.session_type_id],
        (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          if (results.length >= 1) {
            return res.status(200).json(service.serviceResponse(false, '000', errorMessages.sameRecordAlreadyExistError));
          } else {
            db.query(
              'UPDATE session_types SET session_type = ?, status = ? WHERE session_type_id = ?',
              [params.session_type, params.status, params.session_type_id],
              (err, results) => {
                if (err) {
                  return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
                }

                return res.status(200).json(
                  service.serviceResponse(true, '000', errorMessages.success, {
                    session_type_id: params.session_type_id,
                    session_type: params.session_type,
                    status: params.status
                  })
                );
              }
            );
          }
        }
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  deleteSessionTypes: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['session_type_ids']));

      if (_.isEmpty(params.session_type_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const sessionTypeIdsArray = params.session_type_ids.split(/\s*,\s*/);

      if (!Array.isArray(sessionTypeIdsArray) || sessionTypeIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const deleteQueries = [];
      deleteQueries.push(
        sessionTypeIdsArray.map((session_type_id, index) => {
          return db.query('DELETE FROM session_types WHERE session_type_id = ?', [session_type_id]);
        })
      );

      await Promise.all(deleteQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  activeSessionTypes: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['session_type_ids']));

      if (_.isEmpty(params.session_type_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const sessionTypeIdsArray = params.session_type_ids.split(/\s*,\s*/);

      if (!Array.isArray(sessionTypeIdsArray) || sessionTypeIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        sessionTypeIdsArray.map((session_type_id, index) => {
          return db.query('UPDATE session_types SET status = ? WHERE session_type_id = ?', [1, session_type_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  inactiveSessionTypes: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['session_type_ids']));

      if (_.isEmpty(params.session_type_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const sessionTypeIdsArray = params.session_type_ids.split(/\s*,\s*/);

      if (!Array.isArray(sessionTypeIdsArray) || sessionTypeIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        sessionTypeIdsArray.map((session_type_id, index) => {
          return db.query('UPDATE session_types SET status = ? WHERE session_type_id = ?', [0, session_type_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateSessionTypesPosition: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['session_type_ids']));

      if (_.isEmpty(params.session_type_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const sessionTypeIdsArray = params.session_type_ids.split(/\s*,\s*/);
      if (!Array.isArray(sessionTypeIdsArray) || sessionTypeIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      /* Fetch ALL rows sorted by position */
      const allRows = await queryPromise('SELECT session_type_id, position FROM session_types ORDER BY position');

      /* Create a map of session_type_id -> position */
      const positionMap = new Map(allRows.map((row) => [row.session_type_id, row.position]));

      /* Extract only the moved IDs and adjust their positions globally */
      const movedRows = sessionTypeIdsArray
        .map((id) => ({ id, position: positionMap.get(Number(id)) }))
        .filter((row) => row.position !== undefined);

      if (movedRows.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', 'Invalid IDs in request.'));
      }

      /* Remove moved rows from the original list */
      const remainingRows = allRows.filter((row) => !sessionTypeIdsArray.includes(String(row.session_type_id)));

      /* Reconstruct the ordered list */
      let newOrder = [...remainingRows];

      /* Find where to insert moved rows */
      const startPosition = movedRows[0].position; /* Get the first item's original position */
      newOrder.splice(startPosition - 1, 0, ...movedRows); /* Insert at correct place */

      /* Reassign positions sequentially */
      const updateQueries = newOrder.map((row, index) =>
        queryPromise('UPDATE session_types SET position = ? WHERE session_type_id = ?', [index + 1, row.id])
      );

      await Promise.all(updateQueries);

      /* Fetch updated paginated data */
      const { limit = 10, page = 1 } = req.body;
      const offset = (page - 1) * limit;
      const results = await queryPromise('SELECT * FROM session_types ORDER BY position LIMIT ? OFFSET ?', [limit, offset]);

      const countResult = await queryPromise('SELECT COUNT(*) AS total FROM session_types');
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      return res.status(200).json(
        service.serviceResponse(true, '000', errorMessages.success, {
          data: results,
          pagination: {
            currentPage: page,
            limit,
            totalPages,
            totalRecords: total
          }
        })
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  /* Session Types API End */

  /* Profile Status API Start */
  profileStatusList: async (req, res) => {
    try {
      /* Fetch updated paginated data */
      const order = req.query.order || 'position';
      const desc = req.query.desc;
      const dir = desc === 'true' ? 'DESC' : 'ASC';
      const search = req.query.search || '';
      const status = req.query.status || 'all';

      const page = parseInt(req.query.page) || 1; /* Default to page 1 */
      const limit = parseInt(req.query.limit) || 10; /* Default to 10 items per page */
      const offset = (page - 1) * limit;

      /* Construct query dynamically */
      let whereConditions = [];

      /* Add search condition */
      if (search) {
        whereConditions.push(`title LIKE '%${search}%'`);
      }

      /* Add status filter */
      if (status !== 'all') {
        whereConditions.push(`status = '${status}'`);
      }

      /* Combine where clause */
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      /* Construct query dynamically */
      dataQuery = `SELECT * FROM profile_status ${whereClause} ORDER BY ${order} ${dir}, profile_status_id ${dir} LIMIT ? OFFSET ?`;
      countQuery = `SELECT COUNT(*) AS total FROM profile_status ${whereClause}`;

      /* Execute the count query */
      db.query(countQuery, (err, countResult) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        /* Execute the data query */
        db.query(dataQuery, [limit, offset], (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          /* Return the paginated data along with metadata */
          return res.status(200).json(
            service.serviceResponse(true, '000', errorMessages.success, {
              data: results,
              pagination: {
                totalRecords: total,
                totalPages,
                currentPage: page,
                limit
              }
            })
          );
        });
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  addProfileStatus: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['title', 'info_text', 'status']));

      if (_.isEmpty(params.title) || _.isEmpty(params.status)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      params.title = service.capitalizeFirstLetter(params.title);

      db.query('SELECT * FROM profile_status WHERE title = ?', [params.title], (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        if (results.length >= 1) {
          return res.status(200).json(service.serviceResponse(false, '000', errorMessages.sameRecordAlreadyExistError));
        } else {
          db.query(
            'INSERT INTO profile_status (title, info_text, status, created_at) VALUES (?, ?, ?, ?)',
            [params.title, params.info_text, params.status, new Date()],
            (err, results) => {
              if (err) {
                return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
              }

              return res.status(200).json(
                service.serviceResponse(true, '000', errorMessages.success, {
                  profile_status_id: results.insertId,
                  title: params.title,
                  info_text: params.info_text,
                  status: params.status
                })
              );
            }
          );
        }
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateProfileStatus: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['profile_status_id', 'title', 'info_text', 'status']));

      if (_.isEmpty(params.profile_status_id) || _.isEmpty(params.title) || _.isEmpty(params.status)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      params.title = service.capitalizeFirstLetter(params.title);

      db.query(
        'SELECT * FROM profile_status WHERE title = ? AND profile_status_id != ?',
        [params.title, params.profile_status_id],
        (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          if (results.length >= 1) {
            return res.status(200).json(service.serviceResponse(false, '000', errorMessages.sameRecordAlreadyExistError));
          } else {
            db.query(
              'UPDATE profile_status SET title = ?, info_text = ?, status = ? WHERE profile_status_id = ?',
              [params.title, params.info_text, params.status, params.profile_status_id],
              (err, results) => {
                if (err) {
                  return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
                }

                return res.status(200).json(
                  service.serviceResponse(true, '000', errorMessages.success, {
                    profile_status_id: params.profile_status_id,
                    title: params.title,
                    info_text: params.info_text,
                    status: params.status
                  })
                );
              }
            );
          }
        }
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  deleteProfileStatus: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['profile_status_ids']));

      if (_.isEmpty(params.profile_status_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const profileStatusIdsArray = params.profile_status_ids.split(/\s*,\s*/);

      if (!Array.isArray(profileStatusIdsArray) || profileStatusIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const deleteQueries = [];
      deleteQueries.push(
        profileStatusIdsArray.map((profile_status_id, index) => {
          return db.query('DELETE FROM profile_status WHERE profile_status_id = ?', [profile_status_id]);
        })
      );

      await Promise.all(deleteQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  activeProfileStatus: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['profile_status_ids']));

      if (_.isEmpty(params.profile_status_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const profileStatusIdsArray = params.profile_status_ids.split(/\s*,\s*/);

      if (!Array.isArray(profileStatusIdsArray) || profileStatusIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        profileStatusIdsArray.map((profile_status_id, index) => {
          return db.query('UPDATE profile_status SET status = ? WHERE profile_status_id = ?', [1, profile_status_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  inactiveProfileStatus: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['profile_status_ids']));

      if (_.isEmpty(params.profile_status_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const profileStatusIdsArray = params.profile_status_ids.split(/\s*,\s*/);

      if (!Array.isArray(profileStatusIdsArray) || profileStatusIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        profileStatusIdsArray.map((profile_status_id, index) => {
          return db.query('UPDATE profile_status SET status = ? WHERE profile_status_id = ?', [0, profile_status_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateProfileStatusPosition: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['profile_status_ids']));

      if (_.isEmpty(params.profile_status_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const profileStatusIdsArray = params.profile_status_ids.split(/\s*,\s*/);
      if (!Array.isArray(profileStatusIdsArray) || profileStatusIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      /* Fetch ALL rows sorted by position */
      const allRows = await queryPromise('SELECT profile_status_id, position FROM profile_status ORDER BY position');

      /* Create a map of profile_status_id -> position */
      const positionMap = new Map(allRows.map((row) => [row.profile_status_id, row.position]));

      /* Extract only the moved IDs and adjust their positions globally */
      const movedRows = profileStatusIdsArray
        .map((id) => ({ id, position: positionMap.get(Number(id)) }))
        .filter((row) => row.position !== undefined);

      if (movedRows.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', 'Invalid IDs in request.'));
      }

      /* Remove moved rows from the original list */
      const remainingRows = allRows.filter((row) => !profileStatusIdsArray.includes(String(row.profile_status_id)));

      /* Reconstruct the ordered list */
      let newOrder = [...remainingRows];

      /* Find where to insert moved rows */
      const startPosition = movedRows[0].position; /* Get the first item's original position */
      newOrder.splice(startPosition - 1, 0, ...movedRows); /* Insert at correct place */

      /* Reassign positions sequentially */
      const updateQueries = newOrder.map((row, index) =>
        queryPromise('UPDATE profile_status SET position = ? WHERE profile_status_id = ?', [index + 1, row.id])
      );

      await Promise.all(updateQueries);

      /* Fetch updated paginated data */
      const { limit = 10, page = 1 } = req.body;
      const offset = (page - 1) * limit;
      const results = await queryPromise('SELECT * FROM profile_status ORDER BY position LIMIT ? OFFSET ?', [limit, offset]);

      const countResult = await queryPromise('SELECT COUNT(*) AS total FROM profile_status');
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      return res.status(200).json(
        service.serviceResponse(true, '000', errorMessages.success, {
          data: results,
          pagination: {
            currentPage: page,
            limit,
            totalPages,
            totalRecords: total
          }
        })
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  /* Profile Status API End */

  /* Therapy Category API Start */
  therapyCategoryList: async (req, res) => {
    try {
      /* Fetch updated paginated data */
      const order = req.query.order || 'position';
      const desc = req.query.desc;
      const dir = desc === 'true' ? 'DESC' : 'ASC';
      const search = req.query.search || '';
      const status = req.query.status || 'all';

      const page = parseInt(req.query.page) || 1; /* Default to page 1 */
      const limit = parseInt(req.query.limit) || 10; /* Default to 10 items per page */
      const offset = (page - 1) * limit;

      /* Construct query dynamically */
      let whereConditions = [];

      /* Add search condition */
      if (search) {
        whereConditions.push(`therapy_category LIKE '%${search}%'`);
      }

      /* Add status filter */
      if (status !== 'all') {
        whereConditions.push(`status = '${status}'`);
      }

      /* Combine where clause */
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      /* Construct query dynamically */
      dataQuery = `SELECT * FROM therapy_category ${whereClause} ORDER BY ${order} ${dir}, therapy_category_id ${dir} LIMIT ? OFFSET ?`;
      countQuery = `SELECT COUNT(*) AS total FROM therapy_category ${whereClause}`;

      /* Execute the count query */
      db.query(countQuery, (err, countResult) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        /* Execute the data query */
        db.query(dataQuery, [limit, offset], (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          /* Return the paginated data along with metadata */
          return res.status(200).json(
            service.serviceResponse(true, '000', errorMessages.success, {
              data: results,
              pagination: {
                totalRecords: total,
                totalPages,
                currentPage: page,
                limit
              }
            })
          );
        });
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  addTherapyCategory: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['therapy_category', 'info_text', 'is_disabled', 'status']));

      if (_.isEmpty(params.therapy_category) || _.isEmpty(params.is_disabled) || _.isEmpty(params.status)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      params.therapy_category = service.capitalizeFirstLetter(params.therapy_category);

      db.query('SELECT * FROM therapy_category WHERE therapy_category = ?', [params.therapy_category], (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        if (results.length >= 1) {
          return res.status(200).json(service.serviceResponse(false, '000', errorMessages.sameRecordAlreadyExistError));
        } else {
          db.query(
            'INSERT INTO therapy_category (therapy_category, info_text, is_disabled, status, created_at) VALUES (?, ?, ?, ?, ?)',
            [params.therapy_category, params.info_text, params.is_disabled, params.status, new Date()],
            (err, results) => {
              if (err) {
                return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
              }
              return res.status(200).json(
                service.serviceResponse(true, '000', errorMessages.success, {
                  therapy_category_id: results.insertId,
                  therapy_category: params.therapy_category,
                  info_text: params.info_text,
                  is_disabled: params.is_disabled,
                  status: params.status
                })
              );
            }
          );
        }
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateTherapyCategory: async (req, res) => {
    try {
      const params = await service.trimObject(
        _.pick(req.body, ['therapy_category_id', 'therapy_category', 'info_text', 'is_disabled', 'status'])
      );

      if (
        _.isEmpty(params.therapy_category_id) ||
        _.isEmpty(params.therapy_category) ||
        _.isEmpty(params.is_disabled) ||
        _.isEmpty(params.status)
      ) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      params.therapy_category = service.capitalizeFirstLetter(params.therapy_category);

      db.query(
        'SELECT * FROM therapy_category WHERE therapy_category = ? AND therapy_category_id != ?',
        [params.therapy_category, params.therapy_category_id],
        (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          if (results.length >= 1) {
            return res.status(200).json(service.serviceResponse(false, '000', errorMessages.sameRecordAlreadyExistError));
          } else {
            db.query(
              'UPDATE therapy_category SET therapy_category = ?, info_text = ?, is_disabled = ?, status = ? WHERE therapy_category_id = ?',
              [params.therapy_category, params.info_text, params.is_disabled, params.status, params.therapy_category_id],
              (err, results) => {
                if (err) {
                  return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
                }
                return res.status(200).json(
                  service.serviceResponse(true, '000', errorMessages.success, {
                    therapy_category_id: params.therapy_category_id,
                    therapy_category: params.therapy_category,
                    info_text: params.info_text,
                    is_disabled: params.is_disabled,
                    status: params.status
                  })
                );
              }
            );
          }
        }
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  deleteTherapyCategory: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['therapy_category_ids']));

      if (_.isEmpty(params.therapy_category_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const therapyCategoryIdsArray = params.therapy_category_ids.split(/\s*,\s*/);

      if (!Array.isArray(therapyCategoryIdsArray) || therapyCategoryIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const deleteQueries = [];
      deleteQueries.push(
        therapyCategoryIdsArray.map((therapy_category_id, index) => {
          return db.query('DELETE FROM therapy_category WHERE therapy_category_id = ?', [therapy_category_id]);
        })
      );

      await Promise.all(deleteQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  activeTherapyCategory: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['therapy_category_ids']));

      if (_.isEmpty(params.therapy_category_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const therapyCategoryIdsArray = params.therapy_category_ids.split(/\s*,\s*/);

      if (!Array.isArray(therapyCategoryIdsArray) || therapyCategoryIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        therapyCategoryIdsArray.map((therapy_category_id, index) => {
          return db.query('UPDATE therapy_category SET status = ? WHERE therapy_category_id = ?', [1, therapy_category_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  inactiveTherapyCategory: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['therapy_category_ids']));

      if (_.isEmpty(params.therapy_category_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const therapyCategoryIdsArray = params.therapy_category_ids.split(/\s*,\s*/);

      if (!Array.isArray(therapyCategoryIdsArray) || therapyCategoryIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        therapyCategoryIdsArray.map((therapy_category_id, index) => {
          return db.query('UPDATE therapy_category SET status = ? WHERE therapy_category_id = ?', [0, therapy_category_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateTherapyCategoryPosition: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['therapy_category_ids']));

      if (_.isEmpty(params.therapy_category_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const therapyCategoryIdsArray = params.therapy_category_ids.split(/\s*,\s*/);
      if (!Array.isArray(therapyCategoryIdsArray) || therapyCategoryIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      /* Fetch ALL rows sorted by position */
      const allRows = await queryPromise('SELECT therapy_category_id, position FROM therapy_category ORDER BY position');

      /* Create a map of therapy_category_id -> position */
      const positionMap = new Map(allRows.map((row) => [row.therapy_category_id, row.position]));

      /* Extract only the moved IDs and adjust their positions globally */
      const movedRows = therapyCategoryIdsArray
        .map((id) => ({ id, position: positionMap.get(Number(id)) }))
        .filter((row) => row.position !== undefined);

      if (movedRows.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', 'Invalid IDs in request.'));
      }

      /* Remove moved rows from the original list */
      const remainingRows = allRows.filter((row) => !therapyCategoryIdsArray.includes(String(row.therapy_category_id)));

      /* Reconstruct the ordered list */
      let newOrder = [...remainingRows];

      /* Find where to insert moved rows */
      const startPosition = movedRows[0].position; /* Get the first item's original position */
      newOrder.splice(startPosition - 1, 0, ...movedRows); /* Insert at correct place */

      /* Reassign positions sequentially */
      const updateQueries = newOrder.map((row, index) =>
        queryPromise('UPDATE therapy_category SET position = ? WHERE therapy_category_id = ?', [index + 1, row.id])
      );

      await Promise.all(updateQueries);

      /* Fetch updated paginated data */
      const { limit = 10, page = 1 } = req.body;
      const offset = (page - 1) * limit;
      const results = await queryPromise('SELECT * FROM therapy_category ORDER BY position LIMIT ? OFFSET ?', [limit, offset]);

      const countResult = await queryPromise('SELECT COUNT(*) AS total FROM therapy_category');
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      return res.status(200).json(
        service.serviceResponse(true, '000', errorMessages.success, {
          data: results,
          pagination: {
            currentPage: page,
            limit,
            totalPages,
            totalRecords: total
          }
        })
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  /* Therapy Category API End */

  /* Therapy API Start */
  therapyCategoryListForTherapy: async (req, res) => {
    try {
      db.query('SELECT * FROM therapy_category WHERE status = ? ORDER BY position', ['1'], (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success, results));
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  therapyList: async (req, res) => {
    try {
      /* Fetch updated paginated data */
      const order = req.query.order || 'position';
      const desc = req.query.desc;
      const dir = desc === 'true' ? 'DESC' : 'ASC';
      const search = req.query.search || '';
      const status = req.query.status || 'all';
      const therapy_category_id = req.query.therapy_category_id || 'all';

      const page = parseInt(req.query.page) || 1; /* Default to page 1 */
      const limit = parseInt(req.query.limit) || 10; /* Default to 10 items per page */
      const offset = (page - 1) * limit;

      /* Construct query dynamically */
      let whereConditions = [];

      /* Add search condition */
      if (search) {
        whereConditions.push(`(tc.therapy_category LIKE '%${search}%' OR t.therapy LIKE '%${search}%')`);
      }

      /* Add status filter */
      if (status !== 'all') {
        whereConditions.push(`t.status = '${status}'`);
      }

      /* Add therapy_category_id filter */
      if (therapy_category_id !== 'all') {
        whereConditions.push(`t.therapy_category_id = '${therapy_category_id}'`);
      }

      /* Combine where clause */
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      console.log(whereClause);

      /* Construct query dynamically */
      var dataQuery = `SELECT t.*, tc.therapy_category FROM therapy as t JOIN therapy_category as tc ON tc.therapy_category_id = t.therapy_category_id ${whereClause} ORDER BY ${order} ${dir}, therapy_id ${dir} LIMIT ? OFFSET ?`;
      var countQuery = `SELECT COUNT('t.*') AS total FROM therapy as t JOIN therapy_category as tc ON tc.therapy_category_id = t.therapy_category_id ${whereClause}`;

      /* Execute the count query */
      db.query(countQuery, (err, countResult) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        /* Execute the data query */
        db.query(dataQuery, [limit, offset], (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          /* Return the paginated data along with metadata */
          return res.status(200).json(
            service.serviceResponse(true, '000', errorMessages.success, {
              data: results,
              pagination: {
                totalRecords: total,
                totalPages,
                currentPage: page,
                limit
              }
            })
          );
        });
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  addTherapy: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['therapy_category_id', 'therapy', 'info_text', 'is_disabled', 'status']));

      if (_.isEmpty(params.therapy_category_id) || _.isEmpty(params.therapy) || _.isEmpty(params.is_disabled) || _.isEmpty(params.status)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      params.therapy = service.capitalizeFirstLetter(params.therapy);

      db.query(
        'SELECT * FROM therapy WHERE therapy = ? AND therapy_category_id = ?',
        [params.therapy, params.therapy_category_id],
        (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          if (results.length >= 1) {
            return res.status(200).json(service.serviceResponse(false, '000', errorMessages.sameRecordAlreadyExistError));
          } else {
            db.query(
              'INSERT INTO therapy (therapy_category_id, therapy, info_text, is_disabled, status, created_at) VALUES (?, ?, ?, ?, ?, ?)',
              [params.therapy_category_id, params.therapy, params.info_text, params.is_disabled, params.status, new Date()],
              (err, results) => {
                if (err) {
                  return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
                }
                return res.status(200).json(
                  service.serviceResponse(true, '000', errorMessages.success, {
                    therapy_id: results.insertId,
                    therapy_category_id: params.therapy_category_id,
                    therapy: params.therapy,
                    info_text: params.info_text,
                    is_disabled: params.is_disabled,
                    status: params.status
                  })
                );
              }
            );
          }
        }
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateTherapy: async (req, res) => {
    try {
      const params = await service.trimObject(
        _.pick(req.body, ['therapy_id', 'therapy_category_id', 'therapy', 'info_text', 'is_disabled', 'status'])
      );

      if (
        _.isEmpty(params.therapy_id) ||
        _.isEmpty(params.therapy_category_id) ||
        _.isEmpty(params.therapy) ||
        _.isEmpty(params.is_disabled) ||
        _.isEmpty(params.status)
      ) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      params.therapy = service.capitalizeFirstLetter(params.therapy);

      db.query(
        'SELECT * FROM therapy WHERE therapy = ? AND therapy_category_id = ? AND therapy_id != ?',
        [params.therapy, params.therapy_category_id, params.therapy_id],
        (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          if (results.length >= 1) {
            return res.status(200).json(service.serviceResponse(false, '000', errorMessages.sameRecordAlreadyExistError));
          } else {
            db.query(
              'UPDATE therapy SET therapy_category_id = ?, therapy = ?, info_text = ?, is_disabled = ?, status = ? WHERE therapy_id = ?',
              [params.therapy_category_id, params.therapy, params.info_text, params.is_disabled, params.status, params.therapy_id],
              (err, results) => {
                if (err) {
                  return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
                }
                return res.status(200).json(
                  service.serviceResponse(true, '000', errorMessages.success, {
                    therapy_id: params.therapy_id,
                    therapy_category_id: params.therapy_category_id,
                    therapy: params.therapy,
                    info_text: params.info_text,
                    is_disabled: params.is_disabled,
                    status: params.status
                  })
                );
              }
            );
          }
        }
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  deleteTherapy: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['therapy_ids']));

      if (_.isEmpty(params.therapy_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const therapyIdsArray = params.therapy_ids.split(/\s*,\s*/);

      if (!Array.isArray(therapyIdsArray) || therapyIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const deleteQueries = [];
      deleteQueries.push(
        therapyIdsArray.map((therapy_id, index) => {
          return db.query('DELETE FROM therapy WHERE therapy_id = ?', [therapy_id]);
        })
      );

      await Promise.all(deleteQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  activeTherapy: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['therapy_ids']));

      if (_.isEmpty(params.therapy_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const therapyIdsArray = params.therapy_ids.split(/\s*,\s*/);

      if (!Array.isArray(therapyIdsArray) || therapyIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        therapyIdsArray.map((therapy_id, index) => {
          return db.query('UPDATE therapy SET status = ? WHERE therapy_id = ?', [1, therapy_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  inactiveTherapy: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['therapy_ids']));

      if (_.isEmpty(params.therapy_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const therapyIdsArray = params.therapy_ids.split(/\s*,\s*/);

      if (!Array.isArray(therapyIdsArray) || therapyIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        therapyIdsArray.map((therapy_id, index) => {
          return db.query('UPDATE therapy SET status = ? WHERE therapy_id = ?', [0, therapy_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateTherapyPosition: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['therapy_ids']));

      if (_.isEmpty(params.therapy_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const therapyIdsArray = params.therapy_ids.split(/\s*,\s*/);
      if (!Array.isArray(therapyIdsArray) || therapyIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      /* Fetch ALL rows sorted by position */
      const allRows = await queryPromise('SELECT therapy_id, position FROM therapy ORDER BY position');

      /* Create a map of therapy_id -> position */
      const positionMap = new Map(allRows.map((row) => [row.therapy_id, row.position]));

      /* Extract only the moved IDs and adjust their positions globally */
      const movedRows = therapyIdsArray
        .map((id) => ({ id, position: positionMap.get(Number(id)) }))
        .filter((row) => row.position !== undefined);

      if (movedRows.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', 'Invalid IDs in request.'));
      }

      /* Remove moved rows from the original list */
      const remainingRows = allRows.filter((row) => !therapyIdsArray.includes(String(row.therapy_id)));

      /* Reconstruct the ordered list */
      let newOrder = [...remainingRows];

      /* Find where to insert moved rows */
      const startPosition = movedRows[0].position; /* Get the first item's original position */
      newOrder.splice(startPosition - 1, 0, ...movedRows); /* Insert at correct place */

      /* Reassign positions sequentially */
      const updateQueries = newOrder.map((row, index) =>
        queryPromise('UPDATE therapy SET position = ? WHERE therapy_id = ?', [index + 1, row.id])
      );

      await Promise.all(updateQueries);

      /* Fetch updated paginated data */
      const { limit = 10, page = 1 } = req.body;
      const offset = (page - 1) * limit;
      const results = await queryPromise(
        'SELECT t.*, tc.therapy_category FROM therapy as t JOIN therapy_category as tc ON tc.therapy_category_id = t.therapy_category_id ORDER BY t.position LIMIT ? OFFSET ?',
        [limit, offset]
      );

      const countResult = await queryPromise(
        `SELECT COUNT('t.*') AS total FROM therapy as t JOIN therapy_category as tc ON tc.therapy_category_id = t.therapy_category_id`
      );
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      return res.status(200).json(
        service.serviceResponse(true, '000', errorMessages.success, {
          data: results,
          pagination: {
            currentPage: page,
            limit,
            totalPages,
            totalRecords: total
          }
        })
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  /* Therapy API End */

  /* blog Category API Start */
  blogCategoryList: async (req, res) => {
    try {
      /* Fetch updated paginated data */
      const order = req.query.order || 'position';
      const desc = req.query.desc;
      const dir = desc === 'true' ? 'DESC' : 'ASC';
      const search = req.query.search || '';
      const status = req.query.status || 'all';

      const page = parseInt(req.query.page) || 1; /* Default to page 1 */
      const limit = parseInt(req.query.limit) || 10; /* Default to 10 items per page */
      const offset = (page - 1) * limit;

      /* Construct query dynamically */
      let whereConditions = [];

      /* Add search condition */
      if (search) {
        whereConditions.push(`blog_category LIKE '%${search}%'`);
      }

      /* Add status filter */
      if (status !== 'all') {
        whereConditions.push(`status = '${status}'`);
      }

      /* Combine where clause */
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      /* Construct query dynamically */
      dataQuery = `SELECT * FROM blog_category ${whereClause} ORDER BY ${order} ${dir}, blog_category_id ${dir} LIMIT ? OFFSET ?`;
      countQuery = `SELECT COUNT(*) AS total FROM blog_category ${whereClause}`;

      /* Execute the count query */
      db.query(countQuery, (err, countResult) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        /* Execute the data query */
        db.query(dataQuery, [limit, offset], (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          /* Return the paginated data along with metadata */
          return res.status(200).json(
            service.serviceResponse(true, '000', errorMessages.success, {
              data: results,
              pagination: {
                totalRecords: total,
                totalPages,
                currentPage: page,
                limit
              }
            })
          );
        });
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  addBlogCategory: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['blog_category', 'info_text', 'is_disabled', 'status']));

      if (_.isEmpty(params.blog_category) || _.isEmpty(params.is_disabled) || _.isEmpty(params.status)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      params.blog_category = service.capitalizeFirstLetter(params.blog_category);

      db.query('SELECT * FROM blog_category WHERE blog_category = ?', [params.blog_category], (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        if (results.length >= 1) {
          return res.status(200).json(service.serviceResponse(false, '000', errorMessages.sameRecordAlreadyExistError));
        } else {
          db.query(
            'INSERT INTO blog_category (blog_category, info_text, is_disabled, status, created_at) VALUES (?, ?, ?, ?, ?)',
            [params.blog_category, params.info_text, params.is_disabled, params.status, new Date()],
            (err, results) => {
              if (err) {
                return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
              }
              return res.status(200).json(
                service.serviceResponse(true, '000', errorMessages.success, {
                  blog_category_id: results.insertId,
                  blog_category: params.blog_category,
                  info_text: params.info_text,
                  is_disabled: params.is_disabled,
                  status: params.status
                })
              );
            }
          );
        }
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateBlogCategory: async (req, res) => {
    try {
      const params = await service.trimObject(
        _.pick(req.body, ['blog_category_id', 'blog_category', 'info_text', 'is_disabled', 'status'])
      );

      if (
        !params.blog_category_id ||
        !params.blog_category ||
        params.is_disabled === undefined ||
        params.status === undefined
      ) {
        return res.status(200).json(
          service.serviceResponse(false, '000', errorMessages.missingParamError)
        );
      }


      params.blog_category = service.capitalizeFirstLetter(params.blog_category);

      db.query(
        'SELECT * FROM blog_category WHERE blog_category = ? AND blog_category_id != ?',
        [params.blog_category, params.blog_category_id],
        (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          if (results.length >= 1) {
            return res.status(200).json(service.serviceResponse(false, '000', errorMessages.sameRecordAlreadyExistError));
          } else {
            db.query(
              'UPDATE blog_category SET blog_category = ?, info_text = ?, is_disabled = ?, status = ? WHERE blog_category_id = ?',
              [params.blog_category, params.info_text, params.is_disabled, params.status, params.blog_category_id],
              (err, results) => {
                if (err) {
                  return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
                }
                return res.status(200).json(
                  service.serviceResponse(true, '000', errorMessages.success, {
                    blog_category_id: params.blog_category_id,
                    blog_category: params.blog_category,
                    info_text: params.info_text,
                    is_disabled: params.is_disabled,
                    status: params.status
                  })
                );
              }
            );
          }
        }
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  deleteBlogCategory: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['blog_category_ids']));

      if (_.isEmpty(params.blog_category_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const blogCategoryIdsArray = params.blog_category_ids.split(/\s*,\s*/);

      if (!Array.isArray(blogCategoryIdsArray) || blogCategoryIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const deleteQueries = [];
      deleteQueries.push(
        blogCategoryIdsArray.map((blog_category_id, index) => {
          return db.query('DELETE FROM blog_category WHERE blog_category_id = ?', [blog_category_id]);
        })
      );

      await Promise.all(deleteQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  activeBlogCategory: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['blog_category_ids']));

      if (_.isEmpty(params.blog_category_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const blogCategoryIdsArray = params.blog_category_ids.split(/\s*,\s*/);

      if (!Array.isArray(blogCategoryIdsArray) || blogCategoryIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        blogCategoryIdsArray.map((blog_category_id, index) => {
          return db.query('UPDATE blog_category SET status = ? WHERE blog_category_id = ?', [1, blog_category_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  inactiveBlogCategory: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['blog_category_ids']));

      if (_.isEmpty(params.blog_category_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const blogCategoryIdsArray = params.blog_category_ids.split(/\s*,\s*/);

      if (!Array.isArray(blogCategoryIdsArray) || blogCategoryIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        blogCategoryIdsArray.map((blog_category_id, index) => {
          return db.query('UPDATE blog_category SET status = ? WHERE blog_category_id = ?', [0, blog_category_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateBlogCategoryPosition: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['blog_category_ids']));

      if (_.isEmpty(params.blog_category_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const blogCategoryIdsArray = params.blog_category_ids.split(/\s*,\s*/);
      if (!Array.isArray(blogCategoryIdsArray) || blogCategoryIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      /* Fetch ALL rows sorted by position */
      const allRows = await queryPromise('SELECT blog_category_id, position FROM blog_category ORDER BY position');

      /* Create a map of blog_category_id -> position */
      const positionMap = new Map(allRows.map((row) => [row.blog_category_id, row.position]));

      /* Extract only the moved IDs and adjust their positions globally */
      const movedRows = blogCategoryIdsArray
        .map((id) => ({ id, position: positionMap.get(Number(id)) }))
        .filter((row) => row.position !== undefined);

      if (movedRows.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', 'Invalid IDs in request.'));
      }

      /* Remove moved rows from the original list */
      const remainingRows = allRows.filter((row) => !blogCategoryIdsArray.includes(String(row.blog_category_id)));

      /* Reconstruct the ordered list */
      let newOrder = [...remainingRows];

      /* Find where to insert moved rows */
      const startPosition = movedRows[0].position; /* Get the first item's original position */
      newOrder.splice(startPosition - 1, 0, ...movedRows); /* Insert at correct place */

      /* Reassign positions sequentially */
      const updateQueries = newOrder.map((row, index) =>
        queryPromise('UPDATE blog_category SET position = ? WHERE blog_category_id = ?', [index + 1, row.id])
      );

      await Promise.all(updateQueries);

      /* Fetch updated paginated data */
      const { limit = 10, page = 1 } = req.body;
      const offset = (page - 1) * limit;
      const results = await queryPromise('SELECT * FROM blog_category ORDER BY position LIMIT ? OFFSET ?', [limit, offset]);

      const countResult = await queryPromise('SELECT COUNT(*) AS total FROM blog_category');
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      return res.status(200).json(
        service.serviceResponse(true, '000', errorMessages.success, {
          data: results,
          pagination: {
            currentPage: page,
            limit,
            totalPages,
            totalRecords: total
          }
        })
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  /* Blog Category API End */

  /* Blog API Start */
  blogCategoryListForBlog: async (req, res) => {
    try {
      db.query('SELECT * FROM blog_category WHERE status = ? ORDER BY position', ['1'], (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success, results));
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  blogList: async (req, res) => {
    try {
      /* Fetch updated paginated data */
      const order = req.query.order || 'created_at';
      const desc = req.query.desc;
      const dir = desc === 'true' ? 'DESC' : 'ASC';
      const search = req.query.search || '';
      const status = req.query.status || 'all';
      const blog_category_id = req.query.blog_category_id || 'all';

      const page = parseInt(req.query.page) || 1; /* Default to page 1 */
      const limit = parseInt(req.query.limit) || 10; /* Default to 10 items per page */
      const offset = (page - 1) * limit;

      /* Construct query dynamically */
      let whereConditions = [];

      /* Add search condition */
      if (search) {
        whereConditions.push(`(bc.blog_category LIKE '%${search}%' OR b.blog LIKE '%${search}%')`);
      }

      /* Add status filter */
      if (status !== 'all') {
        whereConditions.push(`b.status = '${status}'`);
      }

      /* Add blog_category_id filter */
      if (blog_category_id !== 'all') {
        whereConditions.push(`b.blog_category_id = '${blog_category_id}'`);
      }

      /* Combine where clause */
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      /* Construct query dynamically */
      var dataQuery = `SELECT b.*, bc.blog_category FROM blog as b JOIN blog_category as bc ON bc.blog_category_id = b.blog_category_id ${whereClause} ORDER BY ${order} ${dir}, blog_id ${dir} LIMIT ? OFFSET ?`;
      var countQuery = `SELECT COUNT(*) AS total FROM blog as b JOIN blog_category as bc ON bc.blog_category_id = b.blog_category_id ${whereClause}`;

      /* console.log(dataQuery);
            console.log(countQuery); */


      /* Execute the count query */
      db.query(countQuery, (err, countResult) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        /* Execute the data query */
        db.query(dataQuery, [limit, offset], (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }
           const resObj = results.map((item) => ({
            ...item,
            image: `${req.protocol}://${req.get('host')}/uploads/blog_images/${item.image}`
          }));

          /* Return the paginated data along with metadata */
          return res.status(200).json(
            service.serviceResponse(true, '000', errorMessages.success, {
              data: resObj,
              pagination: {
                totalRecords: total,
                totalPages,
                currentPage: page,
                limit
              }
            })
          );
        });
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },


  addBlog: async (req, res) => {
    try {
      const params = await service.trimObject(
        _.pick(req.body, [
          'blog_category_id',
          'blog',
          'info_text',
          'is_disabled',
          'status'
        ])
      );

      // ✅ Proper validation
      if (
        _.isEmpty(params.blog_category_id) ||
        _.isEmpty(params.blog) ||
        _.isEmpty(params.is_disabled) ||
        _.isEmpty(params.status)
      ) {
        service.deleteUploadedFiles(req.files);
        return res
          .status(200)
          .json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      // ✅ Image REQUIRED only for ADD
        if (req.files.image) {
        const image = req.files.image[0];
        params['image'] = image.filename;
         } else {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
        }

      params.blog = service.capitalizeFirstLetter(params.blog);

      db.query(
        'SELECT * FROM blog WHERE blog = ? AND blog_category_id = ?',
        [params.blog, params.blog_category_id],
        (err, results) => {
          if (err) {
            return res
              .status(200)
              .json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          if (results.length >= 1) {
            return res
              .status(200)
              .json(service.serviceResponse(false, '000', errorMessages.sameRecordAlreadyExistError));
          }
        else {

          db.query(
            `INSERT INTO blog 
           (image, blog_category_id, blog, info_text, is_disabled, status, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              params.image,
              params.blog_category_id,
              params.blog,
              params.info_text || '',
              params.is_disabled,
              params.status,
              new Date()
            ],
            (err, result) => {
              if (err) {
                return res
                  .status(200)
                  .json(service.serviceResponse(false, '000', err.sqlMessage));
              }

              const imagePath = `${req.protocol}://${req.get(
                'host'
              )}/uploads/blog_images/${params.image}`;

              return res.status(200).json(
                service.serviceResponse(true, '000', errorMessages.success, {
                  blog_id: result.insertId,
                  image: imagePath,
                  blog_category_id: params.blog_category_id,
                  blog: params.blog,
                  info_text: params.info_text,
                  is_disabled: params.is_disabled,
                  status: params.status
                })
              );
            }
          );
        }
    });
    
    } catch (err) {
      return res
        .status(200)
        .json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },


 updateBlog: async (req, res) => {
  try {
    const params = await service.trimObject(
      _.pick(req.body, [
        'blog_id',
        'blog_category_id',
        'blog',
        'info_text',
        'is_disabled',
        'status'
      ])
    );

    if (
      _.isEmpty(params.blog_id) ||
      _.isEmpty(params.blog_category_id) ||
      _.isEmpty(params.blog) ||
      _.isEmpty(params.is_disabled) ||
      _.isEmpty(params.status)
    ) {
      service.deleteUploadedFiles(req.files);
      return res
        .status(200)
        .json(service.serviceResponse(false, '000', errorMessages.missingParamError));
    }

    /* Check if image was uploaded */
    if (req.files && req.files.image) {
      const image = req.files.image[0];
      params.image = image.filename;
    }

    params.blog = service.capitalizeFirstLetter(params.blog);

    db.query(
      'SELECT * FROM blog WHERE blog = ? AND blog_category_id = ? AND blog_id != ?',
      [params.blog, params.blog_category_id, params.blog_id],
      (err, results) => {
        if (err) {
          return res
            .status(200)
            .json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        if (results.length >= 1) {
          return res
            .status(200)
            .json(service.serviceResponse(false, '000', errorMessages.sameRecordAlreadyExistError));
        }
         else {
          if (params.image) {
            db.query(
              `UPDATE blog 
               SET blog_category_id=?, blog=?, info_text=?, is_disabled=?, status=?, image=?
               WHERE blog_id=?`,
              [
                params.blog_category_id,
                params.blog,
                params.info_text || '',
                params.is_disabled,
                params.status,
                params.image,
                params.blog_id
              ],
              (err,results) => {
                if (err) {
                  return res
                    .status(200)
                    .json(service.serviceResponse(false, '000', err.sqlMessage));
                }

                const imagePath = `${req.protocol}://${req.get('host')}/uploads/blog_imaeges/${params.image}`;

                return res.status(200).json(
                  service.serviceResponse(true, '000', errorMessages.success, {
                    blog_id: params.blog_id,
                    image: imagePath,
                    blog_category_id: params.blog_category_id,
                    blog: params.blog,
                    info_text: params.info_text,
                    is_disabled: params.is_disabled,
                    status: params.status
                  })
                );
              }
            );
          } else {
            db.query(
              `UPDATE blog 
               SET blog_category_id=?, blog=?, info_text=?, is_disabled=?, status=?
               WHERE blog_id=?`,
              [
                params.blog_category_id,
                params.blog,
                params.info_text || '',
                params.is_disabled,
                params.status,
                params.blog_id
              ],
              (err,results) => {
                if (err) {
                  return res
                    .status(200)
                    .json(service.serviceResponse(false, '000', err.sqlMessage));
                }

                return res.status(200).json(
                  service.serviceResponse(true, '000', errorMessages.success, {
                    blog_id: params.blog_id,
                    blog_category_id: params.blog_category_id,
                    blog: params.blog,
                    info_text: params.info_text,
                    is_disabled: params.is_disabled,
                    status: params.status
                  })
                );
              }
            );
          }

        }
      }
    );
  } catch (err) {
    return res
      .status(200)
      .json(service.serviceResponse(false, '333', errorMessages.serverError));
  }
},

  deleteBlog: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['blog_ids']));

      if (_.isEmpty(params.blog_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const blogIdsArray = params.blog_ids.split(/\s*,\s*/);

      if (!Array.isArray(blogIdsArray) || blogIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const deleteQueries = [];
      deleteQueries.push(
        blogIdsArray.map((blog_id, index) => {
          return db.query('DELETE FROM blog WHERE blog_id = ?', [blog_id]);
        })
      );

      await Promise.all(deleteQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  activeBlog: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['blog_ids']));

      if (_.isEmpty(params.blog_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const blogIdsArray = params.blog_ids.split(/\s*,\s*/);

      if (!Array.isArray(blogIdsArray) || blogIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        blogIdsArray.map((blog_id, index) => {
          return db.query('UPDATE blog SET status = ? WHERE blog_id = ?', [1, blog_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  inactiveBlog: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['blog_ids']));

      if (_.isEmpty(params.blog_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const blogIdsArray = params.blog_ids.split(/\s*,\s*/);

      if (!Array.isArray(blogIdsArray) || blogIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        blogIdsArray.map((blog_id, index) => {
          return db.query('UPDATE blog SET status = ? WHERE blog_id = ?', [0, blog_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateBlogPosition: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['blog_ids']));

      if (_.isEmpty(params.blog_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const blogIdsArray = params.blog_ids.split(/\s*,\s*/);
      if (!Array.isArray(blogIdsArray) || blogIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      /* Fetch ALL rows sorted by position */
      const allRows = await queryPromise('SELECT blog_id, position FROM blog ORDER BY position');

      /* Create a map of blog_id -> position */
      const positionMap = new Map(allRows.map((row) => [row.blog_id, row.position]));

      /* Extract only the moved IDs and adjust their positions globally */
      const movedRows = blogIdsArray
        .map((id) => ({ id, position: positionMap.get(Number(id)) }))
        .filter((row) => row.position !== undefined);

      if (movedRows.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', 'Invalid IDs in request.'));
      }

      /* Remove moved rows from the original list */
      const remainingRows = allRows.filter((row) => !blogIdsArray.includes(String(row.blog_id)));

      /* Reconstruct the ordered list */
      let newOrder = [...remainingRows];

      /* Find where to insert moved rows */
      const startPosition = movedRows[0].position; /* Get the first item's original position */
      newOrder.splice(startPosition - 1, 0, ...movedRows); /* Insert at correct place */

      /* Reassign positions sequentially */
      const updateQueries = newOrder.map((row, index) =>
        queryPromise('UPDATE blog SET position = ? WHERE blog_id = ?', [index + 1, row.id])
      );

      await Promise.all(updateQueries);

      /* Fetch updated paginated data */
      const { limit = 10, page = 1 } = req.body;
      const offset = (page - 1) * limit;
      const results = await queryPromise(
        'SELECT b.*, bc.blog_category FROM blog as b JOIN blog_category as bc ON bc.blog_category_id = b.blog_category_id ORDER BY b.position LIMIT ? OFFSET ?',
        [limit, offset]
      );

      const countResult = await queryPromise(
        `SELECT COUNT(*) AS total FROM blog as b JOIN blog_category as bc ON bc.blog_category_id = b.blog_category_id`
      );
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      const resObj = results.map((item) => ({
        ...item,
        image: item.image
          ? `${req.protocol}://${req.get("host")}/uploads/blog_images/${item.image}`
          : null
      }));


      return res.status(200).json(
        service.serviceResponse(true, '000', errorMessages.success, {
          data: resObj,
          pagination: {
            currentPage: page,
            limit,
            totalPages,
            totalRecords: total
          }
        })
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  /*Blog API End */


  /* Type of practitioner API Start */
  typeOfPractitionerList: async (req, res) => {
    try {
      /* Fetch updated paginated data */
      const order = req.query.order || 'position';
      const desc = req.query.desc;
      const dir = desc === 'true' ? 'DESC' : 'ASC';
      const search = req.query.search || '';
      const status = req.query.status || 'all';

      const page = parseInt(req.query.page) || 1; /* Default to page 1 */
      const limit = parseInt(req.query.limit) || 10; /* Default to 10 items per page */
      const offset = (page - 1) * limit;

      /* Construct query dynamically */
      let whereConditions = [];

      /* Add search condition */
      if (search) {
        whereConditions.push(`type_of_practitioner LIKE '%${search}%'`);
      }

      /* Add status filter */
      if (status !== 'all') {
        whereConditions.push(`status = '${status}'`);
      }

      /* Combine where clause */
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      /* Construct query dynamically */
      dataQuery = `SELECT * FROM type_of_practitioner ${whereClause} ORDER BY ${order} ${dir}, type_of_practitioner_id ${dir} LIMIT ? OFFSET ?`;
      countQuery = `SELECT COUNT(*) AS total FROM type_of_practitioner ${whereClause}`;

      /* Execute the count query */
      db.query(countQuery, (err, countResult) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        /* Execute the data query */
        db.query(dataQuery, [limit, offset], (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          /* Return the paginated data along with metadata */
          return res.status(200).json(
            service.serviceResponse(true, '000', errorMessages.success, {
              data: results,
              pagination: {
                totalRecords: total,
                totalPages,
                currentPage: page,
                limit
              }
            })
          );
        });
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  addTypeOfPractitioner: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['type_of_practitioner', 'status']));

      if (_.isEmpty(params.type_of_practitioner) || _.isEmpty(params.status)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      params.type_of_practitioner = service.capitalizeFirstLetter(params.type_of_practitioner);

      db.query('SELECT * FROM type_of_practitioner WHERE type_of_practitioner = ?', [params.type_of_practitioner], (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        if (results.length >= 1) {
          return res.status(200).json(service.serviceResponse(false, '000', errorMessages.sameRecordAlreadyExistError));
        } else {
          db.query(
            'INSERT INTO type_of_practitioner (type_of_practitioner, status, created_at) VALUES (?, ?, ?)',
            [params.type_of_practitioner, params.status, new Date()],
            (err, results) => {
              if (err) {
                return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
              }
              return res.status(200).json(
                service.serviceResponse(true, '000', errorMessages.success, {
                  type_of_practitioner_id: results.insertId,
                  type_of_practitioner: params.type_of_practitioner,
                  status: params.status
                })
              );
            }
          );
        }
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateTypeOfPractitioner: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['type_of_practitioner_id', 'type_of_practitioner', 'status']));

      if (_.isEmpty(params.type_of_practitioner_id) || _.isEmpty(params.type_of_practitioner) || _.isEmpty(params.status)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      params.type_of_practitioner = service.capitalizeFirstLetter(params.type_of_practitioner);

      db.query(
        'SELECT * FROM type_of_practitioner WHERE type_of_practitioner = ? AND type_of_practitioner_id != ?',
        [params.type_of_practitioner, params.type_of_practitioner_id],
        (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          if (results.length >= 1) {
            return res.status(200).json(service.serviceResponse(false, '000', errorMessages.sameRecordAlreadyExistError));
          } else {
            db.query(
              'UPDATE type_of_practitioner SET type_of_practitioner = ?, status = ? WHERE type_of_practitioner_id = ?',
              [params.type_of_practitioner, params.status, params.type_of_practitioner_id],
              (err, results) => {
                if (err) {
                  return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
                }
                return res.status(200).json(
                  service.serviceResponse(true, '000', errorMessages.success, {
                    type_of_practitioner_id: params.type_of_practitioner_id,
                    type_of_practitioner: params.type_of_practitioner,
                    status: params.status
                  })
                );
              }
            );
          }
        }
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  deleteTypeOfPractitioner: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['type_of_practitioner_ids']));

      if (_.isEmpty(params.type_of_practitioner_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const TypeOfPractitionerIdsArray = params.type_of_practitioner_ids.split(/\s*,\s*/);

      if (!Array.isArray(TypeOfPractitionerIdsArray) || TypeOfPractitionerIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const deleteQueries = [];
      deleteQueries.push(
        TypeOfPractitionerIdsArray.map((type_of_practitioner_id, index) => {
          return db.query('DELETE FROM type_of_practitioner WHERE type_of_practitioner_id = ?', [type_of_practitioner_id]);
        })
      );

      await Promise.all(deleteQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  activeTypeOfPractitioner: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['type_of_practitioner_ids']));

      if (_.isEmpty(params.type_of_practitioner_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const TypeOfPractitionerIdsArray = params.type_of_practitioner_ids.split(/\s*,\s*/);

      if (!Array.isArray(TypeOfPractitionerIdsArray) || TypeOfPractitionerIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        TypeOfPractitionerIdsArray.map((type_of_practitioner_id, index) => {
          return db.query('UPDATE type_of_practitioner SET status = ? WHERE type_of_practitioner_id = ?', [1, type_of_practitioner_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  inactiveTypeOfPractitioner: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['type_of_practitioner_ids']));

      if (_.isEmpty(params.type_of_practitioner_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const TypeOfPractitionerIdsArray = params.type_of_practitioner_ids.split(/\s*,\s*/);

      if (!Array.isArray(TypeOfPractitionerIdsArray) || TypeOfPractitionerIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        TypeOfPractitionerIdsArray.map((type_of_practitioner_id, index) => {
          return db.query('UPDATE type_of_practitioner SET status = ? WHERE type_of_practitioner_id = ?', [0, type_of_practitioner_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateTypeOfPractitionerPosition: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['type_of_practitioner_ids']));

      if (_.isEmpty(params.type_of_practitioner_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const TypeOfPractitionerIdsArray = params.type_of_practitioner_ids.split(/\s*,\s*/);
      if (!Array.isArray(TypeOfPractitionerIdsArray) || TypeOfPractitionerIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      /* Fetch ALL rows sorted by position */
      const allRows = await queryPromise('SELECT type_of_practitioner_id, position FROM type_of_practitioner ORDER BY position');

      /* Create a map of type_of_practitioner_id -> position */
      const positionMap = new Map(allRows.map((row) => [row.type_of_practitioner_id, row.position]));

      /* Extract only the moved IDs and adjust their positions globally */
      const movedRows = TypeOfPractitionerIdsArray.map((id) => ({
        id,
        position: positionMap.get(Number(id))
      })).filter((row) => row.position !== undefined);

      if (movedRows.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', 'Invalid IDs in request.'));
      }

      /* Remove moved rows from the original list */
      const remainingRows = allRows.filter((row) => !TypeOfPractitionerIdsArray.includes(String(row.type_of_practitioner_id)));

      /* Reconstruct the ordered list */
      let newOrder = [...remainingRows];

      /* Find where to insert moved rows */
      const startPosition = movedRows[0].position; /* Get the first item's original position */
      newOrder.splice(startPosition - 1, 0, ...movedRows); /* Insert at correct place */

      /* Reassign positions sequentially */
      const updateQueries = newOrder.map((row, index) =>
        queryPromise('UPDATE type_of_practitioner SET position = ? WHERE type_of_practitioner_id = ?', [index + 1, row.id])
      );

      await Promise.all(updateQueries);

      /* Fetch updated paginated data */
      const { limit = 10, page = 1 } = req.body;
      const offset = (page - 1) * limit;
      const results = await queryPromise('SELECT * FROM type_of_practitioner ORDER BY position LIMIT ? OFFSET ?', [limit, offset]);

      const countResult = await queryPromise('SELECT COUNT(*) AS total FROM type_of_practitioner');
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      return res.status(200).json(
        service.serviceResponse(true, '000', errorMessages.success, {
          data: results,
          pagination: {
            currentPage: page,
            limit,
            totalPages,
            totalRecords: total
          }
        })
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  /* Type of practitioner API End */

  /* Concession API Start */
  concessionList: async (req, res) => {
    try {
      /* Fetch updated paginated data */
      const order = req.query.order || 'position';
      const desc = req.query.desc;
      const dir = desc === 'true' ? 'DESC' : 'ASC';
      const search = req.query.search || '';
      const status = req.query.status || 'all';

      const page = parseInt(req.query.page) || 1; /* Default to page 1 */
      const limit = parseInt(req.query.limit) || 10; /* Default to 10 items per page */
      const offset = (page - 1) * limit;

      /* Construct query dynamically */
      let whereConditions = [];

      /* Add search condition */
      if (search) {
        whereConditions.push(`concession LIKE '%${search}%'`);
      }

      /* Add status filter */
      if (status !== 'all') {
        whereConditions.push(`status = '${status}'`);
      }

      /* Combine where clause */
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      /* Construct query dynamically */
      dataQuery = `SELECT * FROM concession ${whereClause} ORDER BY ${order} ${dir}, concession_id ${dir} LIMIT ? OFFSET ?`;
      countQuery = `SELECT COUNT(*) AS total FROM concession ${whereClause}`;

      /* Execute the count query */
      db.query(countQuery, (err, countResult) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        /* Execute the data query */
        db.query(dataQuery, [limit, offset], (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          /* Return the paginated data along with metadata */
          return res.status(200).json(
            service.serviceResponse(true, '000', errorMessages.success, {
              data: results,
              pagination: {
                totalRecords: total,
                totalPages,
                currentPage: page,
                limit
              }
            })
          );
        });
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  addConcession: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['concession', 'status']));

      if (_.isEmpty(params.concession) || _.isEmpty(params.status)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      params.concession = service.capitalizeFirstLetter(params.concession);

      db.query('SELECT * FROM concession WHERE concession = ?', [params.concession], (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        if (results.length >= 1) {
          return res.status(200).json(service.serviceResponse(false, '000', errorMessages.sameRecordAlreadyExistError));
        } else {
          db.query(
            'INSERT INTO concession (concession, status, created_at) VALUES (?, ?, ?)',
            [params.concession, params.status, new Date()],
            (err, results) => {
              if (err) {
                return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
              }
              return res.status(200).json(
                service.serviceResponse(true, '000', errorMessages.success, {
                  concession_id: results.insertId,
                  concession: params.concession,
                  status: params.status
                })
              );
            }
          );
        }
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateConcession: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['concession_id', 'concession', 'status']));

      if (_.isEmpty(params.concession_id) || _.isEmpty(params.concession) || _.isEmpty(params.status)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      params.concession = service.capitalizeFirstLetter(params.concession);

      db.query(
        'SELECT * FROM concession WHERE concession = ? AND concession_id != ?',
        [params.concession, params.concession_id],
        (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          if (results.length >= 1) {
            return res.status(200).json(service.serviceResponse(false, '000', errorMessages.sameRecordAlreadyExistError));
          } else {
            db.query(
              'UPDATE concession SET concession = ?, status = ? WHERE concession_id = ?',
              [params.concession, params.status, params.concession_id],
              (err, results) => {
                if (err) {
                  return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
                }
                return res.status(200).json(
                  service.serviceResponse(true, '000', errorMessages.success, {
                    concession_id: params.concession_id,
                    concession: params.concession,
                    status: params.status
                  })
                );
              }
            );
          }
        }
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  deleteConcession: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['concession_ids']));

      if (_.isEmpty(params.concession_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const concessionIdsArray = params.concession_ids.split(/\s*,\s*/);

      if (!Array.isArray(concessionIdsArray) || concessionIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const deleteQueries = [];
      deleteQueries.push(
        concessionIdsArray.map((concession_id, index) => {
          return db.query('DELETE FROM concession WHERE concession_id = ?', [concession_id]);
        })
      );

      await Promise.all(deleteQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  activeConcession: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['concession_ids']));

      if (_.isEmpty(params.concession_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const concessionIdsArray = params.concession_ids.split(/\s*,\s*/);

      if (!Array.isArray(concessionIdsArray) || concessionIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        concessionIdsArray.map((concession_id, index) => {
          return db.query('UPDATE concession SET status = ? WHERE concession_id = ?', [1, concession_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  inactiveConcession: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['concession_ids']));

      if (_.isEmpty(params.concession_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const concessionIdsArray = params.concession_ids.split(/\s*,\s*/);

      if (!Array.isArray(concessionIdsArray) || concessionIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        concessionIdsArray.map((concession_id, index) => {
          return db.query('UPDATE concession SET status = ? WHERE concession_id = ?', [0, concession_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateConcessionPosition: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['concession_ids']));

      if (_.isEmpty(params.concession_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const concessionIdsArray = params.concession_ids.split(/\s*,\s*/);
      if (!Array.isArray(concessionIdsArray) || concessionIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      /* Fetch ALL rows sorted by position */
      const allRows = await queryPromise('SELECT concession_id, position FROM concession ORDER BY position');

      /* Create a map of concession_id -> position */
      const positionMap = new Map(allRows.map((row) => [row.concession_id, row.position]));

      /* Extract only the moved IDs and adjust their positions globally */
      const movedRows = concessionIdsArray
        .map((id) => ({ id, position: positionMap.get(Number(id)) }))
        .filter((row) => row.position !== undefined);

      if (movedRows.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', 'Invalid IDs in request.'));
      }

      /* Remove moved rows from the original list */
      const remainingRows = allRows.filter((row) => !concessionIdsArray.includes(String(row.concession_id)));

      /* Reconstruct the ordered list */
      let newOrder = [...remainingRows];

      /* Find where to insert moved rows */
      const startPosition = movedRows[0].position; /* Get the first item's original position */
      newOrder.splice(startPosition - 1, 0, ...movedRows); /* Insert at correct place */

      /* Reassign positions sequentially */
      const updateQueries = newOrder.map((row, index) =>
        queryPromise('UPDATE concession SET position = ? WHERE concession_id = ?', [index + 1, row.id])
      );

      await Promise.all(updateQueries);

      /* Fetch updated paginated data */
      const { limit = 10, page = 1 } = req.body;
      const offset = (page - 1) * limit;
      const results = await queryPromise('SELECT * FROM concession ORDER BY position LIMIT ? OFFSET ?', [limit, offset]);

      const countResult = await queryPromise('SELECT COUNT(*) AS total FROM concession');
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      return res.status(200).json(
        service.serviceResponse(true, '000', errorMessages.success, {
          data: results,
          pagination: {
            currentPage: page,
            limit,
            totalPages,
            totalRecords: total
          }
        })
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  /* Concession API End */

  /* Health Insurance API Start */
  healthInsuranceList: async (req, res) => {
    try {
      /* Fetch updated paginated data */
      const order = req.query.order || 'position';
      const desc = req.query.desc;
      const dir = desc === 'true' ? 'DESC' : 'ASC';
      const search = req.query.search || '';
      const status = req.query.status || 'all';

      const page = parseInt(req.query.page) || 1; /* Default to page 1 */
      const limit = parseInt(req.query.limit) || 10; /* Default to 10 items per page */
      const offset = (page - 1) * limit;

      /* Construct query dynamically */
      let whereConditions = [];

      /* Add search condition */
      if (search) {
        whereConditions.push(`health_insurance LIKE '%${search}%'`);
      }

      /* Add status filter */
      if (status !== 'all') {
        whereConditions.push(`status = '${status}'`);
      }

      /* Combine where clause */
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      /* Construct query dynamically */
      dataQuery = `SELECT * FROM health_insurance ${whereClause} ORDER BY ${order} ${dir}, health_insurance_id ${dir} LIMIT ? OFFSET ?`;
      countQuery = `SELECT COUNT(*) AS total FROM health_insurance ${whereClause}`;

      /* Execute the count query */
      db.query(countQuery, (err, countResult) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        /* Execute the data query */
        db.query(dataQuery, [limit, offset], (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          /* Return the paginated data along with metadata */
          return res.status(200).json(
            service.serviceResponse(true, '000', errorMessages.success, {
              data: results,
              pagination: {
                totalRecords: total,
                totalPages,
                currentPage: page,
                limit
              }
            })
          );
        });
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  addHealthInsurance: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['health_insurance', 'status']));

      if (_.isEmpty(params.health_insurance) || _.isEmpty(params.status)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      params.health_insurance = service.capitalizeFirstLetter(params.health_insurance);

      db.query('SELECT * FROM health_insurance WHERE health_insurance = ?', [params.health_insurance], (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        if (results.length >= 1) {
          return res.status(200).json(service.serviceResponse(false, '000', errorMessages.sameRecordAlreadyExistError));
        } else {
          db.query(
            'INSERT INTO health_insurance (health_insurance, status, created_at) VALUES (?, ?, ?)',
            [params.health_insurance, params.status, new Date()],
            (err, results) => {
              if (err) {
                return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
              }
              return res.status(200).json(
                service.serviceResponse(true, '000', errorMessages.success, {
                  health_insurance_id: results.insertId,
                  health_insurance: params.health_insurance,
                  status: params.status
                })
              );
            }
          );
        }
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateHealthInsurance: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['health_insurance_id', 'health_insurance', 'status']));

      if (_.isEmpty(params.health_insurance_id) || _.isEmpty(params.health_insurance) || _.isEmpty(params.status)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      params.health_insurance = service.capitalizeFirstLetter(params.health_insurance);

      db.query(
        'SELECT * FROM health_insurance WHERE health_insurance = ? AND health_insurance_id != ?',
        [params.health_insurance, params.health_insurance_id],
        (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          if (results.length >= 1) {
            return res.status(200).json(service.serviceResponse(false, '000', errorMessages.sameRecordAlreadyExistError));
          } else {
            db.query(
              'UPDATE health_insurance SET health_insurance = ?, status = ? WHERE health_insurance_id = ?',
              [params.health_insurance, params.status, params.health_insurance_id],
              (err, results) => {
                if (err) {
                  return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
                }
                return res.status(200).json(
                  service.serviceResponse(true, '000', errorMessages.success, {
                    health_insurance_id: params.health_insurance_id,
                    health_insurance: params.health_insurance,
                    status: params.status
                  })
                );
              }
            );
          }
        }
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  deleteHealthInsurance: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['health_insurance_ids']));

      if (_.isEmpty(params.health_insurance_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const healthInsuranceIdsArray = params.health_insurance_ids.split(/\s*,\s*/);

      if (!Array.isArray(healthInsuranceIdsArray) || healthInsuranceIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const deleteQueries = [];
      deleteQueries.push(
        healthInsuranceIdsArray.map((health_insurance_id, index) => {
          return db.query('DELETE FROM health_insurance WHERE health_insurance_id = ?', [health_insurance_id]);
        })
      );

      await Promise.all(deleteQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  activeHealthInsurance: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['health_insurance_ids']));

      if (_.isEmpty(params.health_insurance_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const healthInsuranceIdsArray = params.health_insurance_ids.split(/\s*,\s*/);

      if (!Array.isArray(healthInsuranceIdsArray) || healthInsuranceIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        healthInsuranceIdsArray.map((health_insurance_id, index) => {
          return db.query('UPDATE health_insurance SET status = ? WHERE health_insurance_id = ?', [1, health_insurance_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  inactiveHealthInsurance: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['health_insurance_ids']));

      if (_.isEmpty(params.health_insurance_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const healthInsuranceIdsArray = params.health_insurance_ids.split(/\s*,\s*/);

      if (!Array.isArray(healthInsuranceIdsArray) || healthInsuranceIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        healthInsuranceIdsArray.map((health_insurance_id, index) => {
          return db.query('UPDATE health_insurance SET status = ? WHERE health_insurance_id = ?', [0, health_insurance_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateHealthInsurancePosition: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['health_insurance_ids']));

      if (_.isEmpty(params.health_insurance_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const healthInsuranceIdsArray = params.health_insurance_ids.split(/\s*,\s*/);
      if (!Array.isArray(healthInsuranceIdsArray) || healthInsuranceIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      /* Fetch ALL rows sorted by position */
      const allRows = await queryPromise('SELECT health_insurance_id, position FROM health_insurance ORDER BY position');

      /* Create a map of health_insurance_id -> position */
      const positionMap = new Map(allRows.map((row) => [row.health_insurance_id, row.position]));

      /* Extract only the moved IDs and adjust their positions globally */
      const movedRows = healthInsuranceIdsArray
        .map((id) => ({ id, position: positionMap.get(Number(id)) }))
        .filter((row) => row.position !== undefined);

      if (movedRows.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', 'Invalid IDs in request.'));
      }

      /* Remove moved rows from the original list */
      const remainingRows = allRows.filter((row) => !healthInsuranceIdsArray.includes(String(row.health_insurance_id)));

      /* Reconstruct the ordered list */
      let newOrder = [...remainingRows];

      /* Find where to insert moved rows */
      const startPosition = movedRows[0].position; /* Get the first item's original position */
      newOrder.splice(startPosition - 1, 0, ...movedRows); /* Insert at correct place */

      /* Reassign positions sequentially */
      const updateQueries = newOrder.map((row, index) =>
        queryPromise('UPDATE health_insurance SET position = ? WHERE health_insurance_id = ?', [index + 1, row.id])
      );

      await Promise.all(updateQueries);

      /* Fetch updated paginated data */
      const { limit = 10, page = 1 } = req.body;
      const offset = (page - 1) * limit;
      const results = await queryPromise('SELECT * FROM health_insurance ORDER BY position LIMIT ? OFFSET ?', [limit, offset]);

      const countResult = await queryPromise('SELECT COUNT(*) AS total FROM health_insurance');
      const total = countResult[0].total;
      const totalPages = Math.ceil(total / limit);

      return res.status(200).json(
        service.serviceResponse(true, '000', errorMessages.success, {
          data: results,
          pagination: {
            currentPage: page,
            limit,
            totalPages,
            totalRecords: total
          }
        })
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  /* Health Insurance API End */

  /* Info Icon Text API Start */
  updateInfoIconText: async (req, res) => {
    try {
      const params = await service.trimObject(
        _.pick(req.body, ['professional_background', 'approach_philosophy', 'memberships', 'languages', 'upload_introduction_video'])
      );

      const updatePromises = [];
      updatePromises.push(
        Object.keys(params).map((key) => {
          return db.query('UPDATE info_icon_text SET value = ? WHERE `key` = ?', [params[key], key]);
        })
      );

      await Promise.all(updatePromises);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  getInfoIconText: async (req, res) => {
    try {
      db.query(
        "SELECT * FROM info_icon_text WHERE `key` IN ('professional_background', 'approach_philosophy', 'memberships', 'languages', 'upload_introduction_video')",
        (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          const resObj = {};
          results.forEach((record) => {
            resObj[record.key] = record.value;
          });

          return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success, resObj));
        }
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  /* Info Icon Text API End */

  /* Article API Start */
  counsellingAreaListForArticle: async (req, res) => {
    try {
      db.query('SELECT * FROM counselling_area WHERE status = ? ORDER BY position', ['1'], (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success, results));
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  articleList: async (req, res) => {
    try {
      /* Fetch updated paginated data */
      const order = req.query.order || 'created_at';
      const desc = req.query.desc;
      const dir = desc === 'true' ? 'DESC' : 'ASC';
      const search = req.query.search || '';
      const status = req.query.status || 'all';

      const page = parseInt(req.query.page) || 1; /* Default to page 1 */
      const limit = parseInt(req.query.limit) || 10; /* Default to 10 items per page */
      const offset = (page - 1) * limit;

      /* Construct query dynamically */
      let whereConditions = [];

      /* Add search condition */
      if (search) {
        whereConditions.push(`(ar.title LIKE '%${search}%' OR ar.short_description LIKE '%${search}%')`);
      }

      /* Add status filter */
      if (status !== 'all') {
        whereConditions.push(`ar.status = '${status}'`);
      }

      /* Combine where clause */
      const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

      /* Construct query dynamically */
      dataQuery = `SELECT ar.*, GROUP_CONCAT(ca.counselling_area ORDER BY ca.counselling_area) as tags_name FROM article as ar JOIN counselling_area as ca ON FIND_IN_SET(ca.counselling_area_id, ar.tags) > 0 ${whereClause} GROUP BY ar.article_id ORDER BY ${order} ${dir} LIMIT ? OFFSET ?`;
      countQuery = `SELECT COUNT('ar.*') AS total FROM article as ar ${whereClause}`;

      /* console.log(dataQuery);
      console.log(countQuery); */

      /* Execute the count query */
      db.query(countQuery, (err, countResult) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        const total = countResult[0].total;
        const totalPages = Math.ceil(total / limit);

        /* Execute the data query */
        db.query(dataQuery, [limit, offset], (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }

          const resObj = results.map((item) => ({
            ...item,
            image: `${req.protocol}://${req.get('host')}/uploads/article_images/${item.image}`
          }));

          return res.status(200).json(
            service.serviceResponse(true, '000', errorMessages.success, {
              data: resObj,
              pagination: {
                totalRecords: total,
                totalPages,
                currentPage: page,
                limit
              }
            })
          );
        });
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  addArticle: async (req, res) => {
    try {
      const params = await service.trimObject(
        _.pick(req.body, ['title', 'short_description', 'description', 'reading_time', 'tags', 'admin_id', 'status'])
      );

      if (
        _.isEmpty(params.title) ||
        _.isEmpty(params.short_description) ||
        _.isEmpty(params.description) ||
        _.isEmpty(params.reading_time) ||
        _.isEmpty(params.tags) ||
        _.isEmpty(params.admin_id) ||
        _.isEmpty(params.status)
      ) {
        service.deleteUploadedFiles(req.files);
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      /* Check if image was uploaded */
      if (req.files && req.files.image && req.files.image.length > 0) {
        const image = req.files.image[0];
        params['image'] = image.filename;
      } else {
        params['image'] = null;
      }

      params.title = service.capitalizeFirstLetter(params.title);

      db.query('SELECT * FROM article WHERE title = ?', [params.title], (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        if (results.length >= 1) {
          return res.status(200).json(service.serviceResponse(false, '000', errorMessages.sameRecordAlreadyExistError));
        } else {
          db.query(
            'INSERT INTO article (article_type, image, title, short_description, description, reading_time, tags, admin_id, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [
              'admin_article',
              params.image,
              params.title,
              params.short_description,
              params.description,
              params.reading_time,
              params.tags,
              params.admin_id,
              params.status,
              new Date()
            ],
            (err, results) => {
              if (err) {
                return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
              }

              const imagePath = params.image ? `${req.protocol}://${req.get('host')}/uploads/article_imaeges/${params.image}` : '';
              return res.status(200).json(
                service.serviceResponse(true, '000', errorMessages.success, {
                  article_id: results.insertId,
                  image: imagePath,
                  title: params.title,
                  short_description: params.short_description,
                  description: params.description,
                  reading_time: params.reading_time,
                  tags: params.tags,
                  admin_id: params.admin_id,
                  status: params.status
                })
              );
            }
          );
        }
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateArticle: async (req, res) => {
    try {
      const params = await service.trimObject(
        _.pick(req.body, ['article_id', 'title', 'short_description', 'description', 'reading_time', 'tags', 'admin_id', 'status'])
      );

      if (
        _.isEmpty(params.article_id) ||
        _.isEmpty(params.title) ||
        _.isEmpty(params.short_description) ||
        _.isEmpty(params.description) ||
        _.isEmpty(params.reading_time) ||
        _.isEmpty(params.tags) ||
        _.isEmpty(params.admin_id) ||
        _.isEmpty(params.status)
      ) {
        service.deleteUploadedFiles(req.files);
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      /* Check if logo1 was uploaded */
      if (req.files.image) {
        const image = req.files.image[0];
        params['image'] = image.filename;
      }

      params.title = service.capitalizeFirstLetter(params.title);

      db.query('SELECT * FROM article WHERE title = ? AND article_id != ?', [params.title, params.article_id], (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        if (results.length >= 1) {
          return res.status(200).json(service.serviceResponse(false, '000', errorMessages.sameRecordAlreadyExistError));
        } else {
          if (params.image) {
            db.query(
              'UPDATE article SET article_type = ?, image = ?, title = ?, short_description = ?, description = ?, reading_time = ?, tags = ?, admin_id = ?, status = ? WHERE article_id = ?',
              [
                'admin_article',
                params.image,
                params.title,
                params.short_description,
                params.description,
                params.reading_time,
                params.tags,
                params.admin_id,
                params.status,
                params.article_id
              ],
              (err, results) => {
                if (err) {
                  return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
                }

                const imagePath = params.image ? `${req.protocol}://${req.get('host')}/uploads/article_imaeges/${params.image}` : '';

                return res.status(200).json(
                  service.serviceResponse(true, '000', errorMessages.success, {
                    article_id: params.article_id,
                    image: imagePath,
                    title: params.title,
                    short_description: params.short_description,
                    description: params.description,
                    reading_time: params.reading_time,
                    tags: params.tags,
                    admin_id: params.admin_id,
                    status: params.status
                  })
                );
              }
            );
          } else {
            db.query(
              'UPDATE article SET article_type = ?, title = ?, short_description = ?, description = ?, reading_time = ?, tags = ?, admin_id = ?, status = ? WHERE article_id = ?',
              [
                'admin_article',
                params.title,
                params.short_description,
                params.description,
                params.reading_time,
                params.tags,
                params.admin_id,
                params.status,
                params.article_id
              ],
              (err, results) => {
                if (err) {
                  return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
                }

                return res.status(200).json(
                  service.serviceResponse(true, '000', errorMessages.success, {
                    article_id: params.article_id,
                    title: params.title,
                    short_description: params.short_description,
                    description: params.description,
                    reading_time: params.reading_time,
                    tags: params.tags,
                    admin_id: params.admin_id,
                    status: params.status
                  })
                );
              }
            );
          }
        }
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  deleteArticle: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['article_ids']));

      if (_.isEmpty(params.article_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const articleIdsArray = params.article_ids.split(/\s*,\s*/);

      if (!Array.isArray(articleIdsArray) || articleIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const deleteQueries = [];
      deleteQueries.push(
        articleIdsArray.map((article_id, index) => {
          return db.query('DELETE FROM article WHERE article_id = ?', [article_id]);
        })
      );

      await Promise.all(deleteQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  activeArticle: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['article_ids']));

      if (_.isEmpty(params.article_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const articleIdsArray = params.article_ids.split(/\s*,\s*/);

      if (!Array.isArray(articleIdsArray) || articleIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        articleIdsArray.map((article_id, index) => {
          return db.query('UPDATE article SET status = ? WHERE article_id = ?', [1, article_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  inactiveArticle: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['article_ids']));

      if (_.isEmpty(params.article_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const articleIdsArray = params.article_ids.split(/\s*,\s*/);

      if (!Array.isArray(articleIdsArray) || articleIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        articleIdsArray.map((article_id, index) => {
          return db.query('UPDATE article SET status = ? WHERE article_id = ?', [0, article_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  /* Article API End */

  /* SEO API Start */
  getSEO: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['page']));

      if (_.isEmpty(params.page)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const keys = [`'${params.page}_meta_title'`, `'${params.page}_meta_keyword'`, `'${params.page}_meta_description'`];

      db.query('SELECT * FROM seo WHERE `key` IN (' + keys + ')', (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }

        const resObj = {};
        results.forEach((record) => {
          resObj[record.key] = record.value;
        });
        return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success, resObj));
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  updateSEO: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['page', 'title', 'keyword', 'description']));

      if (_.isEmpty(params.page) || _.isEmpty(params.title) || _.isEmpty(params.keyword) || _.isEmpty(params.description)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const updates = [
        { key: `${params.page}_meta_title`, value: params.title },
        { key: `${params.page}_meta_keyword`, value: params.keyword },
        { key: `${params.page}_meta_description`, value: params.description }
      ];

      const updatePromises = [];
      updatePromises.push(
        Object.keys(updates).map((key, value) => {
          return db.query('UPDATE seo SET value = ? WHERE `key` = ?', [updates[key].value, updates[key].key]);
        })
      );

      await Promise.all(updatePromises);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },
  /* SEO API End */

  /* Tawk Chat Notification API Start */
  initTawkChat: async (req, res) => {
    try {
      db.query(
        'INSERT INTO admin_notification(data, is_read, created_at) VALUES ( ?, ?, ?)',
        [JSON.stringify(req.body), 0, new Date()],
        (err, results) => {
          if (err) {
            return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
          }
          // 🔔 Update Notification
          // const io = getIO();
          //io.emit('admin-notification', 'admin', { data: req.body });
          return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
        }
      );
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  getNotification: async (req, res) => {
    try {
      db.query('SELECT * FROM admin_notification WHERE is_read = 0 ORDER BY created_at', (err, results) => {
        if (err) {
          return res.status(200).json(service.serviceResponse(false, '000', err.sqlMessage));
        }
        return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success, results));
      });
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  },

  readNotification: async (req, res) => {
    try {
      const params = await service.trimObject(_.pick(req.body, ['notification_ids']));

      if (_.isEmpty(params.notification_ids)) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.missingParamError));
      }

      const notificationIdsArray = params.notification_ids.split(/\s*,\s*/);

      if (!Array.isArray(notificationIdsArray) || notificationIdsArray.length === 0) {
        return res.status(200).json(service.serviceResponse(false, '000', errorMessages.invalidIdError));
      }

      const updateQueries = [];
      updateQueries.push(
        notificationIdsArray.map((notification_id, index) => {
          return db.query('UPDATE admin_notification SET is_read = ? WHERE notification_id = ?', [1, notification_id]);
        })
      );

      await Promise.all(updateQueries);

      return res.status(200).json(service.serviceResponse(true, '000', errorMessages.success));
    } catch (err) {
      return res.status(200).json(service.serviceResponse(false, '333', errorMessages.serverError));
    }
  }
  /* Tawk Chat Notification API End */
};
