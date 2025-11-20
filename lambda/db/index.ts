import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { migrate } from "drizzle-orm/postgres-js/migrator";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle({ client: pool });

// migration 実行
(async () => {
  await migrate(db, { migrationsFolder: "./drizzle" });
})();
