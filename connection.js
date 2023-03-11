// const mysql = require('mysql');

// const pool = mysql.createPool({
// 	connectionLimit: 5,
// 	host: 'localhost',
// 	user: 'root',
// 	password: 'summerof2010',
// 	database: 'db_test'
// });

// module.exports = pool;

const Pool = require('pg').Pool
const constants = require("./constant")
// const constants = require("./constant_child")

const pool = new Pool({
  user: constants.user,
  host: constants.host,
  database: constants.database,
  password: constants.password,
  port: constants.port,
})

module.exports = pool;

