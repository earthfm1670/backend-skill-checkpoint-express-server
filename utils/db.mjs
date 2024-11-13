// Create PostgreSQL Connection Pool here !
import * as pg from "pg";
const { Pool } = pg.default;

const connectionPool = new Pool({
  connectionString: "postgresql://postgres:16708824@localhost:5432/quoramock",
});

export default connectionPool;
