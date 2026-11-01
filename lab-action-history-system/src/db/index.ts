/**
 * Dialect-aware database client.
 *
 *   DB_DIALECT=mysql        -> MySQL (mysql2 driver)   e.g. database `nizzu`
 *   DB_DIALECT=postgresql   -> PostgreSQL (pg driver)  [default]
 *
 * MySQL reads DB_HOST / DB_PORT / DB_USER / DB_PASSWORD / DB_NAME
 * (or a single DATABASE_URL such as mysql://user:pass@host:3306/nizzu).
 */
import "dotenv/config";
import { DB_DIALECT, isMySQL } from "./schema";
import * as pgSchema from "./schema.pg";

type AnyDb = any;

function buildClient(): AnyDb {
  if (isMySQL) {
    // Loaded lazily so PostgreSQL-only deployments never need mysql2 at runtime.
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { drizzle } = require("drizzle-orm/mysql2");
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mysql = require("mysql2/promise");

    const url = process.env.DATABASE_URL;
    const config =
      url && url.startsWith("mysql")
        ? { uri: url }
        : {
            host: process.env.DB_HOST ?? "127.0.0.1",
            port: Number(process.env.DB_PORT ?? 3306),
            user: process.env.DB_USER ?? "root",
            password: process.env.DB_PASSWORD ?? "",
            database: process.env.DB_NAME ?? "nizzu",
          };

    const pool = mysql.createPool({
      ...config,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      dateStrings: false,
      timezone: "Z",
    });

    return drizzle(pool, { mode: "default" });
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required");
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { drizzle } = require("drizzle-orm/node-postgres");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const { Pool } = require("pg");

  const pool = new Pool({ connectionString: databaseUrl });
  return drizzle(pool, { schema: pgSchema });
}

const globalForDb = globalThis as typeof globalThis & {
  __labActionHistoryDb?: AnyDb;
};

export const db: AnyDb = globalForDb.__labActionHistoryDb ?? buildClient();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__labActionHistoryDb = db;
}

export { DB_DIALECT, isMySQL };
