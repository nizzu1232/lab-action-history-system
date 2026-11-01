import "dotenv/config";
import type { Config } from "drizzle-kit";

const explicitDialect = process.env.DB_DIALECT?.toLowerCase();
const hasMysqlEnv = Boolean(
  process.env.DB_HOST ||
    process.env.DB_USER ||
    process.env.DB_PASSWORD ||
    process.env.DB_NAME ||
    process.env.DATABASE_URL?.startsWith("mysql")
);
const dialect = explicitDialect ?? (hasMysqlEnv ? "mysql" : "postgresql");

const config: Config =
  dialect === "mysql"
    ? {
        dialect: "mysql",
        schema: "./src/db/schema.mysql.ts",
        out: "./drizzle/mysql",
        dbCredentials: {
          host: process.env.DB_HOST ?? "127.0.0.1",
          port: Number(process.env.DB_PORT ?? 3306),
          user: process.env.DB_USER ?? "root",
          password: process.env.DB_PASSWORD ?? "",
          database: process.env.DB_NAME ?? "nizzu",
        },
      }
    : {
        dialect: "postgresql",
        schema: "./src/db/schema.pg.ts",
        out: "./drizzle/postgres",
        dbCredentials: {
          url:
            process.env.DATABASE_URL ??
            "postgresql://postgres:postgres@127.0.0.1:5432/app_db",
        },
      };

export default config;
