const service = require("../common/service");
const { _ } = require("lodash");
const db = require("../db/db");
const errorMessages = require("../common/errorMessages");
const jwt = require("jsonwebtoken");

module.exports = {
  authenticateAdminToken: async (req, res, next) => {
    const params = await _.pick(req.body, ["adminId"]);

    if (_.isEmpty(params.adminId)) {
      return res
        .status(200)
        .json(
          service.serviceResponse(false, "000", errorMessages.missingParamError)
        );
    }

    if (!req.headers["authorization"]) {
      return res
        .status(200)
        .json(
          service.serviceResponse(false, "444", errorMessages.tokenNotSetError)
        );
    }

    db.query(
      "SELECT * FROM admins WHERE admin_id = ? AND token = ?",
      [params.adminId, req.headers["authorization"]],
      (err, results) => {
        if (err) {
          return res
            .status(200)
            .json(service.serviceResponse(false, "000", err.sqlMessage));
        }

        const admin = results[0];

        if (results.length === 0) {
          return res
            .status(200)
            .json(
              service.serviceResponse(
                false,
                "444",
                errorMessages.tokenNotSetError
              )
            );
        } else {
          if (admin.status === 0) {
            return res
              .status(200)
              .json(
                service.serviceResponse(
                  false,
                  "444",
                  errorMessages.accountNotActiveError
                )
              );
          }

          if (admin.email_verified === 0) {
            return res
              .status(200)
              .json(
                service.serviceResponse(
                  false,
                  "444",
                  errorMessages.emailNotVerifiedError
                )
              );
          }
        }

        req.admin = admin;
        next();
      }
    );
  },
  authenticatecounsellor: async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ message: "Invalid token format" });
      }

      const token = authHeader.split(" ")[1];

      if (!token || token === "null" || token === "undefined") {
        return res.status(401).json({ message: "Token missing or invalid" });
      }

      let decoded;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
      } catch (err) {
        return res.status(401).json({ message: "Token verification failed" });
      }

      if (decoded.role !== "counsellor") {
        return res.status(403).json({ message: "Access denied: Not a counsellor" });
      }

      // ✅ consistent naming
      req.c_id = decoded.c_id;
      next();

    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  }
};
