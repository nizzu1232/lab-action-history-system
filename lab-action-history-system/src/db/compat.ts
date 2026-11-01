/**
 * Cross-dialect helpers.
 *
 * PostgreSQL supports `INSERT ... RETURNING`, MySQL does not.
 * These helpers normalise the behaviour so the same application code runs on
 * either database.
 */
import { isMySQL } from "./schema";

type Executor = any;

/** Insert a row and return the stored record (works on MySQL + PostgreSQL). */
export async function insertReturning<T extends Record<string, any>>(
  executor: Executor,
  table: any,
  values: any
): Promise<T> {
  if (!isMySQL) {
    const rows = await executor.insert(table).values(values).returning();
    return rows[0] as T;
  }

  const result = await executor.insert(table).values(values);
  const insertId =
    result?.[0]?.insertId ?? result?.insertId ?? (Array.isArray(result) ? result[0]?.insertId : undefined);

  if (!insertId) {
    throw new Error("Insert did not return an auto-increment id");
  }

  const rows = await executor
    .select()
    .from(table)
    .where((await import("drizzle-orm")).eq(table.id, insertId))
    .limit(1);

  return rows[0] as T;
}

/** Update rows and return the first stored record afterwards. */
export async function updateReturning<T extends Record<string, any>>(
  executor: Executor,
  table: any,
  values: any,
  where: any
): Promise<T | undefined> {
  if (!isMySQL) {
    const rows = await executor.update(table).set(values).where(where).returning();
    return rows[0] as T;
  }

  await executor.update(table).set(values).where(where);
  const rows = await executor.select().from(table).where(where).limit(1);
  return rows[0] as T;
}

/** Bulk insert and return every stored record. */
export async function insertManyReturning<T extends Record<string, any>>(
  executor: Executor,
  table: any,
  values: any[]
): Promise<T[]> {
  if (values.length === 0) return [];

  if (!isMySQL) {
    return (await executor.insert(table).values(values).returning()) as T[];
  }

  const result = await executor.insert(table).values(values);
  const firstId =
    result?.[0]?.insertId ?? result?.insertId ?? (Array.isArray(result) ? result[0]?.insertId : undefined);

  if (!firstId) {
    // Fall back to a plain re-read ordered by primary key.
    const { desc } = await import("drizzle-orm");
    return (await executor
      .select()
      .from(table)
      .orderBy(desc(table.id))
      .limit(values.length)) as T[];
  }

  const { gte, asc } = await import("drizzle-orm");
  return (await executor
    .select()
    .from(table)
    .where(gte(table.id, firstId))
    .orderBy(asc(table.id))
    .limit(values.length)) as T[];
}
