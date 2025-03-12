require("dotenv").config();
const { Pool } = require("pg");

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
  const client = await neonPool.connect();
  try {
    const res = await client.query(text, params);
    return res;
  } catch (error) {
    console.log("Query error", { text, params, error });
    throw error;
  } finally {
    client.release();
  }
};

module.exports = { query };