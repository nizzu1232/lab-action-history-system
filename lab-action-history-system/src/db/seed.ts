import "dotenv/config";
import { db } from "./index";
import { isMySQL } from "./schema";
import {
  admins,
  students,
  batches,
  batchStudents,
  computers,
  labSessions,
  sessionActions,
  auditLogs,
  loginAttempts,
  notifications,
} from "./schema";
import { insertReturning, insertManyReturning } from "./compat";
import { eq, sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

const COLORS = [
  "#6366f1", "#8b5cf6", "#ec4899", "#f59e0b",
  "#10b981", "#06b6d4", "#3b82f6", "#ef4444",
];

async function clearTable(table: any, name: string) {
  if (isMySQL) {
    await db.execute(sql.raw(`DELETE FROM \`${name}\``));
    await db.execute(sql.raw(`ALTER TABLE \`${name}\` AUTO_INCREMENT = 1`));
  } else {
    await db.delete(table);
  }
}

async function seed() {
  console.log(`🌱 Seeding database (dialect: ${isMySQL ? "MySQL" : "PostgreSQL"})...`);

  // Order matters for referential integrity — children before parents
  console.log("Clearing existing data...");
  await clearTable(sessionActions, "session_actions");
  await clearTable(labSessions, "lab_sessions");
  await clearTable(batchStudents, "batch_students");
  await clearTable(batches, "batches");
  await clearTable(students, "students");
  await clearTable(computers, "computers");
  await clearTable(notifications, "notifications");
  await clearTable(loginAttempts, "login_attempts");
  await clearTable(auditLogs, "audit_logs");
  await clearTable(admins, "admins");

  const superAdminPassword = await bcrypt.hash("admin123", 12);
  const labAdminPassword = await bcrypt.hash("lab123", 12);

  console.log("Creating admins...");
  const superAdmin = await insertReturning(db, admins, {
    name: "Dr. Rajesh Kumar",
    email: "admin@college.edu",
    passwordHash: superAdminPassword,
    role: "super_admin",
    status: "active",
    avatarColor: "#6366f1",
  });

  const labAdmin = await insertReturning(db, admins, {
    name: "Priya Sharma",
    email: "lab@college.edu",
    passwordHash: labAdminPassword,
    role: "lab_admin",
    status: "active",
    avatarColor: "#ec4899",
  });

  console.log("Creating computers...");
  const computerData = [];
  for (let i = 1; i <= 45; i++) {
    computerData.push({
      computerNumber: `PC-${String(i).padStart(2, "0")}`,
      status: i <= 40 ? "available" : i <= 42 ? "maintenance" : i <= 44 ? "offline" : "available",
      location: i <= 30 ? "Lab A" : "Lab B",
    });
  }
  await db.insert(computers).values(computerData);

  console.log("Creating students...");
  const names = [
    "Rahul Sharma", "Ananya Patel", "Arjun Reddy", "Sneha Gupta", "Vikram Singh",
    "Kavya Nair", "Rohan Mehta", "Ishita Joshi", "Aditya Kumar", "Neha Verma",
    "Siddharth Rao", "Divya Menon", "Karthik Iyer", "Pooja Das", "Amit Saxena",
    "Riya Kapoor", "Sanjay Pillai", "Megha Shah", "Vishal Bhatt", "Tanvi Agarwal",
    "Nikhil Jain", "Shreya Mishra", "Rajiv Choudhury", "Anjali Malhotra", "Manish Tiwari",
    "Swati Desai", "Gaurav Khanna", "Pallavi Sinha", "Varun Chopra", "Nidhi Pandey",
    "Arun Banerjee", "Priti Yadav", "Suresh Menon", "Lakshmi Nair", "Kiran Patil",
    "Deepa Iyer", "Ashwin Rao", "Meera Krishnan", "Harish Shetty", "Anitha Gowda",
    "Pradeep Hegde", "Sunita Kulkarni", "Manoj Prabhu", "Geeta Bhat", "Ramesh Nayak",
  ];

  const courses = ["BCA", "B.Sc CS", "MCA"];
  const semesters = ["1st", "2nd", "3rd", "4th", "5th", "6th"];
  const studentData: any[] = [];

  for (let i = 0; i < names.length; i++) {
    const course = courses[i % 3];
    const semester = semesters[i % 6];
    studentData.push({
      name: names[i],
      usn: `1RV2${Math.floor(i / 10)}CA${String(i + 1).padStart(3, "0")}`,
      course,
      department: course === "MCA" ? "Computer Applications (PG)" : "Computer Applications",
      semester: `${semester} Semester`,
      academicYear: "2026-2027",
      email: `${names[i].toLowerCase().replace(" ", ".")}@student.edu`,
      phone: `+91 ${Math.floor(7000000000 + Math.random() * 3000000000)}`,
      status: i < 42 ? "active" : i < 44 ? "inactive" : "graduated",
      qrId: `STU-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      avatarColor: COLORS[i % COLORS.length],
    });
  }

  const createdStudents = await insertManyReturning<any>(db, students, studentData);

  console.log("Creating batches...");
  const batch1 = await insertReturning<any>(db, batches, {
    batchName: "BCA 6th Semester Morning Batch",
    course: "BCA",
    department: "Computer Applications",
    semester: "6th Semester",
    academicYear: "2026-2027",
    capacity: 45,
    status: "active",
  });

  const batch2 = await insertReturning<any>(db, batches, {
    batchName: "BCA 4th Semester Afternoon Batch",
    course: "BCA",
    department: "Computer Applications",
    semester: "4th Semester",
    academicYear: "2026-2027",
    capacity: 40,
    status: "active",
  });

  const batch3 = await insertReturning<any>(db, batches, {
    batchName: "MCA 2nd Semester Evening Batch",
    course: "MCA",
    department: "Computer Applications (PG)",
    semester: "2nd Semester",
    academicYear: "2026-2027",
    capacity: 35,
    status: "active",
  });

  console.log("Assigning students to batches...");
  const assignments = createdStudents.map((student: any) => {
    let batchId = batch1.id;
    if (student.course === "MCA" && student.semester.includes("2nd")) batchId = batch3.id;
    else if (student.course === "BCA" && student.semester.includes("4th")) batchId = batch2.id;

    return { batchId, studentId: student.id, status: "active" };
  });
  await db.insert(batchStudents).values(assignments);

  console.log("Creating sample sessions...");
  const allComputers: any[] = await db.select().from(computers);
  const availableComputers = allComputers.filter(
    (c: { status: string }) => c.status === "available"
  );

  // 5 active sessions
  for (let i = 0; i < 5; i++) {
    const student = createdStudents[i];
    const computer = availableComputers[i];
    if (!student || !computer) continue;

    const startTime = new Date(Date.now() - (i + 1) * 30 * 60 * 1000);

    const session = await insertReturning<any>(db, labSessions, {
      batchId: batch1.id,
      studentId: student.id,
      computerId: computer.id,
      startedByAdminId: labAdmin.id,
      startTime,
      status: "active",
    });

    await db.insert(sessionActions).values({
      sessionId: session.id,
      studentId: student.id,
      computerId: computer.id,
      actionType: "session_started",
      description: `Session started on ${computer.computerNumber}`,
      timestamp: startTime,
    });

    await db
      .update(computers)
      .set({ status: "occupied", updatedAt: new Date() })
      .where(eq(computers.id, computer.id));
  }

  // 10 completed sessions for history
  for (let i = 5; i < 15; i++) {
    const student = createdStudents[i];
    const computer = availableComputers[i];
    if (!student || !computer) continue;

    const startTime = new Date(Date.now() - (i + 1) * 2 * 60 * 60 * 1000);
    const endTime = new Date(startTime.getTime() + 90 * 60 * 1000);
    const durationSeconds = Math.floor((endTime.getTime() - startTime.getTime()) / 1000);

    const session = await insertReturning<any>(db, labSessions, {
      batchId: batch1.id,
      studentId: student.id,
      computerId: computer.id,
      startedByAdminId: labAdmin.id,
      startTime,
      endTime,
      durationSeconds,
      status: "completed",
    });

    await db.insert(sessionActions).values([
      {
        sessionId: session.id,
        studentId: student.id,
        computerId: computer.id,
        actionType: "session_started",
        description: `Session started on ${computer.computerNumber}`,
        timestamp: startTime,
      },
      {
        sessionId: session.id,
        studentId: student.id,
        computerId: computer.id,
        actionType: "session_ended",
        description: `Session ended after ${durationSeconds} seconds`,
        timestamp: endTime,
      },
    ]);
  }

  console.log("Creating audit logs...");
  await db.insert(auditLogs).values([
    {
      adminId: superAdmin.id,
      action: "system_initialized",
      description: "Lab Action History Management System initialized",
      entityType: "system",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
    },
    {
      adminId: labAdmin.id,
      action: "login",
      description: `Admin ${labAdmin.email} logged in`,
      entityType: "admin",
      entityId: labAdmin.id,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    },
    {
      adminId: superAdmin.id,
      action: "admin_created",
      description: `Created lab admin account for ${labAdmin.email}`,
      entityType: "admin",
      entityId: labAdmin.id,
      timestamp: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    },
  ]);

  console.log("✅ Seeding complete!");
  console.log("");
  console.log("📝 Development credentials:");
  console.log("   Super Admin: admin@college.edu / admin123");
  console.log("   Lab Admin:   lab@college.edu / lab123");
}

seed()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .then(() => process.exit(0));
