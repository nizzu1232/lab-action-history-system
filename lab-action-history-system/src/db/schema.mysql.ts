import {
  mysqlTable,
  text,
  int,
  datetime,
  boolean,
  varchar,
  index,
  uniqueIndex,
} from "drizzle-orm/mysql-core";
import { sql } from "drizzle-orm";

// ADMINS
export const admins = mysqlTable(
  "admins",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    email: varchar("email", { length: 200 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: varchar("role", { length: 50 }).notNull().default("lab_admin"),
    status: varchar("status", { length: 50 }).notNull().default("active"),
    avatarColor: varchar("avatar_color", { length: 50 }).default("#6366f1"),
    lastLogin: datetime("last_login", { mode: "date" }),
    createdAt: datetime("created_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: datetime("updated_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (t) => ({
    emailIdx: uniqueIndex("admins_email_idx").on(t.email),
  })
);

// STUDENTS
export const students = mysqlTable(
  "students",
  {
    id: int("id").autoincrement().primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    usn: varchar("usn", { length: 50 }).notNull(),
    course: varchar("course", { length: 100 }).notNull(),
    department: varchar("department", { length: 150 }).notNull(),
    semester: varchar("semester", { length: 50 }).notNull(),
    academicYear: varchar("academic_year", { length: 30 }).notNull(),
    email: varchar("email", { length: 200 }),
    phone: varchar("phone", { length: 30 }),
    status: varchar("status", { length: 50 }).notNull().default("active"),
    qrId: varchar("qr_id", { length: 100 }).notNull(),
    avatarColor: varchar("avatar_color", { length: 50 }).default("#6366f1"),
    createdAt: datetime("created_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: datetime("updated_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    deletedAt: datetime("deleted_at", { mode: "date" }),
    deletedBy: int("deleted_by"),
  },
  (t) => ({
    usnIdx: uniqueIndex("students_usn_idx").on(t.usn),
    emailIdx: index("students_email_idx").on(t.email),
    statusIdx: index("students_status_idx").on(t.status),
    courseIdx: index("students_course_idx").on(t.course),
  })
);

// BATCHES (no batch_code, no section)
export const batches = mysqlTable(
  "batches",
  {
    id: int("id").autoincrement().primaryKey(),
    batchName: varchar("batch_name", { length: 250 }).notNull(),
    course: varchar("course", { length: 100 }).notNull(),
    department: varchar("department", { length: 150 }).notNull(),
    semester: varchar("semester", { length: 50 }).notNull(),
    academicYear: varchar("academic_year", { length: 30 }).notNull(),
    capacity: int("capacity").notNull().default(40),
    status: varchar("status", { length: 50 }).notNull().default("active"),
    createdAt: datetime("created_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: datetime("updated_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (t) => ({
    statusIdx: index("batches_status_idx").on(t.status),
  })
);

// BATCH_STUDENTS
export const batchStudents = mysqlTable(
  "batch_students",
  {
    id: int("id").autoincrement().primaryKey(),
    batchId: int("batch_id").notNull(),
    studentId: int("student_id").notNull(),
    assignedDate: datetime("assigned_date", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    status: varchar("status", { length: 50 }).default("active"),
  },
  (t) => ({
    uniq: uniqueIndex("batch_students_uniq").on(t.batchId, t.studentId),
    batchIdx: index("batch_students_batch_idx").on(t.batchId),
    studentIdx: index("batch_students_student_idx").on(t.studentId),
  })
);

// COMPUTERS
export const computers = mysqlTable(
  "computers",
  {
    id: int("id").autoincrement().primaryKey(),
    computerNumber: varchar("computer_number", { length: 50 }).notNull(),
    status: varchar("status", { length: 50 }).notNull().default("available"),
    location: varchar("location", { length: 150 }).default("Lab A"),
    createdAt: datetime("created_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: datetime("updated_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (t) => ({
    numberIdx: uniqueIndex("computers_number_idx").on(t.computerNumber),
  })
);

// LAB_SESSIONS
export const labSessions = mysqlTable(
  "lab_sessions",
  {
    id: int("id").autoincrement().primaryKey(),
    batchId: int("batch_id"),
    studentId: int("student_id").notNull(),
    computerId: int("computer_id").notNull(),
    startedByAdminId: int("started_by_admin_id"),
    startTime: datetime("start_time", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    endTime: datetime("end_time", { mode: "date" }),
    durationSeconds: int("duration_seconds").default(0),
    status: varchar("status", { length: 50 }).notNull().default("active"),
    createdAt: datetime("created_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
    updatedAt: datetime("updated_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (t) => ({
    studentIdx: index("lab_sessions_student_idx").on(t.studentId),
    computerIdx: index("lab_sessions_computer_idx").on(t.computerId),
    batchIdx: index("lab_sessions_batch_idx").on(t.batchId),
    statusIdx: index("lab_sessions_status_idx").on(t.status),
  })
);

// SESSION_ACTIONS
export const sessionActions = mysqlTable(
  "session_actions",
  {
    id: int("id").autoincrement().primaryKey(),
    sessionId: int("session_id"),
    studentId: int("student_id"),
    computerId: int("computer_id"),
    actionType: varchar("action_type", { length: 100 }).notNull(),
    description: text("description"),
    timestamp: datetime("timestamp", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (t) => ({
    sessionIdx: index("session_actions_session_idx").on(t.sessionId),
    timestampIdx: index("session_actions_timestamp_idx").on(t.timestamp),
  })
);

// AUDIT_LOGS
export const auditLogs = mysqlTable(
  "audit_logs",
  {
    id: int("id").autoincrement().primaryKey(),
    adminId: int("admin_id"),
    action: varchar("action", { length: 100 }).notNull(),
    description: text("description"),
    entityType: varchar("entity_type", { length: 50 }),
    entityId: int("entity_id"),
    ipAddress: varchar("ip_address", { length: 50 }),
    userAgent: text("user_agent"),
    timestamp: datetime("timestamp", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (t) => ({
    adminIdx: index("audit_logs_admin_idx").on(t.adminId),
    timestampIdx: index("audit_logs_timestamp_idx").on(t.timestamp),
  })
);

// LOGIN_ATTEMPTS
export const loginAttempts = mysqlTable(
  "login_attempts",
  {
    id: int("id").autoincrement().primaryKey(),
    email: varchar("email", { length: 200 }).notNull(),
    adminId: int("admin_id"),
    success: boolean("success").notNull().default(false),
    reason: varchar("reason", { length: 100 }),
    ipAddress: varchar("ip_address", { length: 50 }),
    timestamp: datetime("timestamp", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
  },
  (t) => ({
    emailIdx: index("login_attempts_email_idx").on(t.email),
    timestampIdx: index("login_attempts_timestamp_idx").on(t.timestamp),
  })
);

// NOTIFICATIONS
export const notifications = mysqlTable("notifications", {
  id: int("id").autoincrement().primaryKey(),
  adminId: int("admin_id"),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message"),
  type: varchar("type", { length: 50 }).default("info"),
  read: boolean("read").default(false).notNull(),
  createdAt: datetime("created_at", { mode: "date" }).default(sql`CURRENT_TIMESTAMP`).notNull(),
});
