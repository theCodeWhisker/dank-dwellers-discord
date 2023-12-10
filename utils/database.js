const { Pool } = require("pg");
const pool = new Pool({
  user: process.env.SQL_USER,
  host: process.env.SQL_HOST,
  database: process.env.SQL_DATABASE,
  password: process.env.SQL_PASS,
  port: 5432,
});

module.exports = pool;
