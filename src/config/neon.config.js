require("dotenv").config();
const { Pool } = require("pg");
const winston = require("winston");

// Logger setup
// const logger = winston.createLogger({
//   level: "info",
//   format: winston.format.combine(
//     winston.format.timestamp(),
//     winston.format.json()
//   ),
//   transports: [
//     new winston.transports.Console(),
//     new winston.transports.File({ filename: "error.log", level: "error" })
//   ],
// });

let { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPORT } = process.env;

const neonPool = new Pool({
  user: PGUSER,
  password: PGPASSWORD,
  host: PGHOST,
  database: PGDATABASE,
  port: ENDPORT,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  max: 20,
  keepAlive: true,
});

const connectWithRetry = () => {
  neonPool
    .connect()
    .then((client) => {
      // logger.info("Connected to the database");
      console.log("Connected to psql");
      client.release();
    })
    .catch((error) => {
      // logger.error("Error connecting to the database:", error);
      // logger.info("Retrying connection in 5 seconds...");
      console.log("Error connecting to the database:", error);
      setTimeout(connectWithRetry, 5000); 
    });
};

const query = async (text, params) => {
  neonPool.connect();
  try {
    const res = await neonPool.query(text, params);
    // const duration = Date.now() - start;
    // logger.info("Executed query", {
    //   text,
    //   params,
    //   duration,
    //   rows: res.rowCount,
    // });
    return res;
  } catch (error) {
    //logger.error("Query error", { text, params, error });
    console.log("Query error", { text, params, error});
    throw error;
  }finally{
    neonPool.release();
  }
};

module.exports = { query };