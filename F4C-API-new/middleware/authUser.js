const service = require("../common/service");
const _ = require("lodash");
const db = require("../db/db");
const errorMessages = require("../common/errorMessages");
const jwt = require("jsonwebtoken");

const cache = {};

module.exports = {
  authenticateUserToken: (req, res, next) => {
    const authHeader = req.headers["authorization"];
    if (!authHeader) {
      return res.status(401).json({
        status: false,
        message: "Token not provided",
      });
    }

    const token = authHeader.split(" ")[1];

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
        return res.status(401).json({
          status: false,
          message: "Invalid token",
        });
      }

      if (decoded.role !== "user") {
        return res.status(403).json({
          status: false,
          message: "Access denied: Not a user",
        });
      }

      const userId = decoded.user_id1;

      if (cache[userId]) {
        req.user = cache[userId];
        return next();
      }

      db.query(
        "SELECT * FROM user1 WHERE user_id1 = ?",
        [userId],
        (err, results) => {
          if (err || results.length === 0) {
            return res.status(401).json({
              status: false,
              message: "User not found",
            });
          }

          cache[userId] = results[0];

          req.user = results[0];
          next();
        }
      );
    });
  }
}