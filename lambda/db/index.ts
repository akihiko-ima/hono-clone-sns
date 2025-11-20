import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
});

export const db = drizzle(pool, { schema });

// migration 実行
(async () => {
  await migrate(db, { migrationsFolder: "./drizzle" });
})();
