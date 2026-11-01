/**
 * Dialect-aware schema.
 *
 * Set DB_DIALECT=mysql to use MySQL. If DB_DIALECT is missing, the app
 * auto-detects MySQL when DB_HOST / DB_USER / DB_PASSWORD / DB_NAME are present.
 * Both schemas are structurally identical (same table + column names), so the
 * TypeScript types are taken from the PostgreSQL definitions while the runtime
 * objects come from whichever dialect is active. Drizzle generates SQL from the
 * runtime objects, so the emitted queries always match the live connection.
 */
import * as pgSchema from "./schema.pg";
import * as mysqlSchema from "./schema.mysql";

const explicitDialect = process.env.DB_DIALECT?.toLowerCase();
const hasMysqlEnv = Boolean(
  process.env.DB_HOST ||
    process.env.DB_USER ||
    process.env.DB_PASSWORD ||
    process.env.DB_NAME ||
    process.env.DATABASE_URL?.startsWith("mysql")
);

export const DB_DIALECT = explicitDialect ?? (hasMysqlEnv ? "mysql" : "postgresql");
export const isMySQL = DB_DIALECT === "mysql";

const active: typeof pgSchema = isMySQL
  ? (mysqlSchema as unknown as typeof pgSchema)
  : pgSchema;

export const admins = active.admins;
export const students = active.students;
export const batches = active.batches;
export const batchStudents = active.batchStudents;
export const computers = active.computers;
export const labSessions = active.labSessions;
export const sessionActions = active.sessionActions;
export const auditLogs = active.auditLogs;
export const loginAttempts = active.loginAttempts;
export const notifications = active.notifications;
