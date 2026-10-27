require("dotenv").config();

const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const http = require("http");
const path = require("path");

const app = express();
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

const port = process.env.PORT || 8087;
const adminAPIRoutes = require("./routes/adminAPIRoutes");

app.use(cors());
app.use(express.json());

app.use(bodyParser.json());

/* Routes */
app.get("/", (req, res) => {
  res.send("Welcome to First 4 Counselling");
});

app.use("/admin/api", adminAPIRoutes);

server.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
