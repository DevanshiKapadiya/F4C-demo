const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");
const path = require("path");
require("dotenv").config();
const axios = require("axios");

const app = express();
app.set("trust proxy", true);
const server = http.createServer(app);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );

  next();
});

let port;
if (process.env.APP_MODE == "development") {
  port = process.env.DEVELOPMENT_PORT;
} else {
  port = process.env.PRODUCTION_PORT;
}

const adminAPIRoutes = require("./routes/adminAPIRoutes");
const webAPIRoutes = require("./routes/webAPIRoutes");

app.use(cors());
app.use(express.json());

app.use(bodyParser.json());

/* Routes */
app.get("/", (req, res) => {
  res.send("Welcome to First 4 Counseling");
});

app.use("/admin/api", adminAPIRoutes);
app.use("/web/api", webAPIRoutes);

server.listen(port, () => {
  console.log(`Server running at ${port}`);
});

