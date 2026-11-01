import { NextResponse } from "next/server";
import { db } from "@/db";
import { students, batches, computers, labSessions, batchStudents } from "@/db/schema";
import { eq, and, isNull, sql, count } from "drizzle-orm";

export async function GET() {
  try {
    // Students stats
    const [totalStudents] = await db.select({ count: count() }).from(students);
    const [activeStudents] = await db
      .select({ count: count() })
      .from(students)
      .where(eq(students.status, "active"));
    const [inactiveStudents] = await db
      .select({ count: count() })
      .from(students)
      .where(eq(students.status, "inactive"));
    const [graduatedStudents] = await db
      .select({ count: count() })
      .from(students)
      .where(eq(students.status, "graduated"));
    const [suspendedStudents] = await db
      .select({ count: count() })
      .from(students)
      .where(eq(students.status, "suspended"));

    // Batches stats
    const [totalBatches] = await db.select({ count: count() }).from(batches);
    const [activeBatches] = await db
      .select({ count: count() })
      .from(batches)
      .where(eq(batches.status, "active"));

    // Computers stats
    const [totalComputers] = await db.select({ count: count() }).from(computers);
    const [availableComputers] = await db
      .select({ count: count() })
      .from(computers)
      .where(eq(computers.status, "available"));
    const [occupiedComputers] = await db
      .select({ count: count() })
      .from(computers)
      .where(eq(computers.status, "occupied"));
    const [maintenanceComputers] = await db
      .select({ count: count() })
      .from(computers)
      .where(eq(computers.status, "maintenance"));
    const [offlineComputers] = await db
      .select({ count: count() })
      .from(computers)
      .where(eq(computers.status, "offline"));

    // Sessions stats
    const [activeSessions] = await db
      .select({ count: count() })
      .from(labSessions)
      .where(eq(labSessions.status, "active"));
    const [totalSessions] = await db.select({ count: count() }).from(labSessions);

    // Today's sessions
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySessions = await db
      .select({ count: count() })
      .from(labSessions)
      .where(sql`${labSessions.startTime} >= ${today}`);

    // Active batches with student counts
    const activeBatchesWithStudents = await db
      .select({
        id: batches.id,
        batchName: batches.batchName,
        course: batches.course,
        semester: batches.semester,
        studentCount: count(batchStudents.id),
      })
      .from(batches)
      .leftJoin(batchStudents, eq(batches.id, batchStudents.batchId))
      .where(eq(batches.status, "active"))
      .groupBy(batches.id);

    return NextResponse.json({
      students: {
        total: totalStudents.count,
        active: activeStudents.count,
        inactive: inactiveStudents.count,
        graduated: graduatedStudents.count,
        suspended: suspendedStudents.count,
      },
      batches: {
        total: totalBatches.count,
        active: activeBatches.count,
      },
      computers: {
        total: totalComputers.count,
        available: availableComputers.count,
        occupied: occupiedComputers.count,
        maintenance: maintenanceComputers.count,
        offline: offlineComputers.count,
      },
      sessions: {
        active: activeSessions.count,
        total: totalSessions.count,
        today: todaySessions[0]?.count || 0,
      },
      activeBatchesWithStudents,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}
