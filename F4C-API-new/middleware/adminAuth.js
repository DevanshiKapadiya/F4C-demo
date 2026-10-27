const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const service = require("../controllers/service");
const { _, result, isEmpty } = require("lodash");

dotenv.config();

const authenticateToken = async (req, res, next) => {
  const params = await service.trimObject(
    _.pick(req.headers, ["authorization"])
  );

  if (_.isEmpty(params.authorization)) {
    return res
      .status(444)
      .json(
        service.serviceResponse(
          false,
          "444",
          "Authentication failed, Token not set"
        )
      );
  }

  jwt.verify(params.authorization, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res
        .status(200)
        .json(service.serviceResponse(false, "444", "Invalid token"));
    }
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
