import {
  pgTable,
  text,
  integer,
  timestamp,
  boolean,
  serial,
  index,
  uniqueIndex,
  varchar,
} from "drizzle-orm/pg-core";

// ADMINS
export const admins = pgTable(
  "admins",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    email: varchar("email", { length: 200 }).notNull(),
    passwordHash: text("password_hash").notNull(),
    role: varchar("role", { length: 50 }).notNull().default("lab_admin"), // super_admin | lab_admin
    status: varchar("status", { length: 50 }).notNull().default("active"),
    avatarColor: varchar("avatar_color", { length: 50 }).default("#6366f1"),
    lastLogin: timestamp("last_login"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    emailIdx: uniqueIndex("admins_email_idx").on(t.email),
  })
);

// STUDENTS
export const students = pgTable(
  "students",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 200 }).notNull(),
    usn: varchar("usn", { length: 50 }).notNull(),
    course: varchar("course", { length: 100 }).notNull(),
    department: varchar("department", { length: 150 }).notNull(),
    semester: varchar("semester", { length: 50 }).notNull(),
    academicYear: varchar("academic_year", { length: 30 }).notNull(),
    email: varchar("email", { length: 200 }),
    phone: varchar("phone", { length: 30 }),
    status: varchar("status", { length: 50 }).notNull().default("active"), // active | inactive | graduated | suspended
    qrId: varchar("qr_id", { length: 100 }).notNull(),
    avatarColor: varchar("avatar_color", { length: 50 }).default("#6366f1"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
    deletedBy: integer("deleted_by"),
  },
  (t) => ({
    usnIdx: uniqueIndex("students_usn_idx").on(t.usn),
    emailIdx: index("students_email_idx").on(t.email),
    statusIdx: index("students_status_idx").on(t.status),
    courseIdx: index("students_course_idx").on(t.course),
  })
);

// BATCHES (no batch_code, no section)
export const batches = pgTable(
  "batches",
  {
    id: serial("id").primaryKey(),
    batchName: varchar("batch_name", { length: 250 }).notNull(),
    course: varchar("course", { length: 100 }).notNull(),
    department: varchar("department", { length: 150 }).notNull(),
    semester: varchar("semester", { length: 50 }).notNull(),
    academicYear: varchar("academic_year", { length: 30 }).notNull(),
    capacity: integer("capacity").notNull().default(40),
    status: varchar("status", { length: 50 }).notNull().default("active"), // active | inactive | completed
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    statusIdx: index("batches_status_idx").on(t.status),
  })
);

// BATCH_STUDENTS (junction)
export const batchStudents = pgTable(
  "batch_students",
  {
    id: serial("id").primaryKey(),
    batchId: integer("batch_id")
      .notNull()
      .references(() => batches.id, { onDelete: "cascade" }),
    studentId: integer("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    assignedDate: timestamp("assigned_date").defaultNow().notNull(),
    status: varchar("status", { length: 50 }).default("active"),
  },
  (t) => ({
    uniq: uniqueIndex("batch_students_uniq").on(t.batchId, t.studentId),
    batchIdx: index("batch_students_batch_idx").on(t.batchId),
    studentIdx: index("batch_students_student_idx").on(t.studentId),
  })
);

// COMPUTERS
export const computers = pgTable(
  "computers",
  {
    id: serial("id").primaryKey(),
    computerNumber: varchar("computer_number", { length: 50 }).notNull(),
    status: varchar("status", { length: 50 }).notNull().default("available"), // available | occupied | maintenance | offline
    location: varchar("location", { length: 150 }).default("Lab A"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    numberIdx: uniqueIndex("computers_number_idx").on(t.computerNumber),
  })
);

// LAB_SESSIONS
export const labSessions = pgTable(
  "lab_sessions",
  {
    id: serial("id").primaryKey(),
    batchId: integer("batch_id").references(() => batches.id),
    studentId: integer("student_id")
      .notNull()
      .references(() => students.id, { onDelete: "cascade" }),
    computerId: integer("computer_id")
      .notNull()
      .references(() => computers.id),
    startedByAdminId: integer("started_by_admin_id").references(() => admins.id),
    startTime: timestamp("start_time").defaultNow().notNull(),
    endTime: timestamp("end_time"),
    durationSeconds: integer("duration_seconds").default(0),
    status: varchar("status", { length: 50 }).notNull().default("active"), // active | completed | terminated
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (t) => ({
    studentIdx: index("lab_sessions_student_idx").on(t.studentId),
    computerIdx: index("lab_sessions_computer_idx").on(t.computerId),
    batchIdx: index("lab_sessions_batch_idx").on(t.batchId),
    statusIdx: index("lab_sessions_status_idx").on(t.status),
  })
);

// SESSION_ACTIONS
export const sessionActions = pgTable(
  "session_actions",
  {
    id: serial("id").primaryKey(),
    sessionId: integer("session_id").references(() => labSessions.id, {
      onDelete: "cascade",
    }),
    studentId: integer("student_id").references(() => students.id, {
      onDelete: "cascade",
    }),
    computerId: integer("computer_id").references(() => computers.id),
    actionType: varchar("action_type", { length: 100 }).notNull(),
    description: text("description"),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (t) => ({
    sessionIdx: index("session_actions_session_idx").on(t.sessionId),
    timestampIdx: index("session_actions_timestamp_idx").on(t.timestamp),
  })
);

// AUDIT_LOGS
export const auditLogs = pgTable(
  "audit_logs",
  {
    id: serial("id").primaryKey(),
    adminId: integer("admin_id").references(() => admins.id),
    action: varchar("action", { length: 100 }).notNull(),
    description: text("description"),
    entityType: varchar("entity_type", { length: 50 }),
    entityId: integer("entity_id"),
    ipAddress: varchar("ip_address", { length: 50 }),
    userAgent: text("user_agent"),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (t) => ({
    adminIdx: index("audit_logs_admin_idx").on(t.adminId),
    timestampIdx: index("audit_logs_timestamp_idx").on(t.timestamp),
  })
);

// LOGIN_ATTEMPTS
export const loginAttempts = pgTable(
  "login_attempts",
  {
    id: serial("id").primaryKey(),
    email: varchar("email", { length: 200 }).notNull(),
    adminId: integer("admin_id").references(() => admins.id),
    success: boolean("success").notNull().default(false),
    reason: varchar("reason", { length: 100 }),
    ipAddress: varchar("ip_address", { length: 50 }),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
  },
  (t) => ({
    emailIdx: index("login_attempts_email_idx").on(t.email),
    timestampIdx: index("login_attempts_timestamp_idx").on(t.timestamp),
  })
);

// NOTIFICATIONS
export const notifications = pgTable(
  "notifications",
  {
    id: serial("id").primaryKey(),
    adminId: integer("admin_id").references(() => admins.id),
    title: varchar("title", { length: 200 }).notNull(),
    message: text("message"),
    type: varchar("type", { length: 50 }).default("info"),
    read: boolean("read").default(false).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  }
);
