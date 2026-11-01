import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { students, batches, labSessions, batchStudents, computers } from "@/db/schema";
import { eq, and, sql, count, isNull, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const kind = request.nextUrl.searchParams.get("kind") || "student";

    if (kind === "student") {
      const notDeleted = isNull(students.deletedAt);

      const [total] = await db.select({ c: count() }).from(students).where(notDeleted);
      const byStatus = await db
        .select({ status: students.status, c: count() })
        .from(students)
        .where(notDeleted)
        .groupBy(students.status);

      const byCourse = await db
        .select({ course: students.course, c: count() })
        .from(students)
        .where(notDeleted)
        .groupBy(students.course);

      const bySemester = await db
        .select({ semester: students.semester, c: count() })
        .from(students)
        .where(notDeleted)
        .groupBy(students.semester);

      const [inLab] = await db
        .select({ c: sql<number>`COUNT(DISTINCT ${labSessions.studentId})` })
        .from(labSessions)
        .where(eq(labSessions.status, "active"));

      const [totalSessions] = await db.select({ c: count() }).from(labSessions);

      const statusMap: Record<string, number> = {};
      byStatus.forEach((r: { status: string; c: number }) => (statusMap[r.status] = r.c));

      return NextResponse.json({
        kind,
        total: total.c,
        active: statusMap["active"] || 0,
        inactive: statusMap["inactive"] || 0,
        graduated: statusMap["graduated"] || 0,
        suspended: statusMap["suspended"] || 0,
        inLab: inLab?.c || 0,
        totalSessions: totalSessions.c,
        byCourse,
        bySemester,
      });
    }

    // batch stats
    const [totalBatches] = await db.select({ c: count() }).from(batches);
    const byStatus = await db
      .select({ status: batches.status, c: count() })
      .from(batches)
      .groupBy(batches.status);

    const [totalAssigned] = await db.select({ c: count() }).from(batchStudents);

    const perBatch = await db
      .select({
        id: batches.id,
        batchName: batches.batchName,
        studentCount: count(batchStudents.id),
      })
      .from(batches)
      .leftJoin(batchStudents, eq(batches.id, batchStudents.batchId))
      .groupBy(batches.id)
      .orderBy(desc(count(batchStudents.id)));

    const [activeSessions] = await db
      .select({ c: count() })
      .from(labSessions)
      .where(eq(labSessions.status, "active"));

    const [completedSessions] = await db
      .select({ c: count() })
      .from(labSessions)
      .where(eq(labSessions.status, "completed"));

    const statusMap: Record<string, number> = {};
    byStatus.forEach((r: { status: string; c: number }) => (statusMap[r.status] = r.c));

    return NextResponse.json({
      kind: "batch",
      total: totalBatches.c,
      active: statusMap["active"] || 0,
      inactive: statusMap["inactive"] || 0,
      completed: statusMap["completed"] || 0,
      totalAssigned: totalAssigned.c,
      activeSessions: activeSessions.c,
      completedSessions: completedSessions.c,
      perBatch,
    });
  } catch (error) {
    console.error("Stats error:", error);
    return NextResponse.json({ error: "Failed to fetch statistics" }, { status: 500 });
  }
}
