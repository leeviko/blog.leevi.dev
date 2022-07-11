import { Pool } from "pg";

const pool = new Pool({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: 5432,
});

pool.on("error", (err, client) => {
  console.error("Unexpected error on idle client: ", err);
  process.exit(-1);
});

export default pool;
