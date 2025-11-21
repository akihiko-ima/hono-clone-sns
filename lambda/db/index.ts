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
if (process.env.NODE_ENV !== "production") {
  (async () => {
    console.log("Running Drizzle migration...");
    await migrate(db, { migrationsFolder: "./drizzle" });
    console.log("Migration finished.");
  })().catch((err) => {
    console.error("Migration error:", err);
  });
}
