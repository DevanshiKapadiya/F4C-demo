const mysql = require("mysql2");
const dotenv = require("dotenv");

dotenv.config();

let pool;
if (process.env.APP_MODE == "development") {
  pool = mysql.createPool({
    host: process.env.DEVELOPMENT_DB_HOST,
    user: process.env.DEVELOPMENT_DB_USERNAME,
    password: process.env.DEVELOPMENT_DB_PASSWORD,
    database: process.env.DEVELOPMENT_DB_NAME,
    waitForConnections: true,
    queueLimit: 0,
    connectTimeout: 10000,
  });
} else {
  pool = mysql.createPool({
    host: process.env.PRODUCTION_DB_HOST,
    user: process.env.PRODUCTION_DB_USERNAME,
    password: process.env.PRODUCTION_DB_PASSWORD,
    database: process.env.PRODUCTION_DB_NAME,
    waitForConnections: true,
    queueLimit: 0,
    connectTimeout: 10000,
  });
}

function handleDisconnect() {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error connecting to the database:", err);
      setTimeout(handleDisconnect, 2000);
    } else {
      console.log("Connected to the MYSQL");
      connection.release();
    }
  });
}

handleDisconnect();

setInterval(() => {
  pool.query("SELECT 1", (err) => {
    if (err) {
      console.error("Error pinging the database:", err);
    } else {
      console.log("Database pinged successfully");
    }
  });
}, 300000);

module.exports = pool;

// const db = mysql.createConnection({
//   host: "localhost",
//   user: "root",
//   password: process.env.DB_PASSWORD,
//   database: "f4counselling",
// });

// db.connect((err) => {
//   if (err) throw err;
//   console.log("Connected to MySQL");
// });

// module.exports = db;
