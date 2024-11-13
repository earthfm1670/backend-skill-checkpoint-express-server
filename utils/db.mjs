// Create PostgreSQL Connection Pool here !
import * as pg from "pg";
const { Pool } = pg.default;
import "dotenv/config";

const connectionPool = new Pool({
  connectionString: process.env.CONNECTION_STRING,
});
// CONNECTION_STRING = "postgresql://postgres:16708824@localhost:5432/quoramock" อันนี้คือในตัวไฟล์ .env

export default connectionPool;
