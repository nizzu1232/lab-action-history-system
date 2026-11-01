import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import {
  students,
  batches,
  computers,
  labSessions,
  sessionActions,
  batchStudents,
} from "@/db/schema";
import { eq, and, gte, lte, sql, count, desc } from "drizzle-orm";
import { isMySQL } from "@/db";

export const dynamic = "force-dynamic";

function dateRange(range: string | null, from: string | null, to: string | null) {
  const now = new Date();
  let start = new Date(0);
  let end = new Date();

  switch (range) {
    case "today": {
      start = new Date(now);
      start.setHours(0, 0, 0, 0);
      break;
    }
    case "yesterday": {
      start = new Date(now);
      start.setDate(start.getDate() - 1);
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setHours(23, 59, 59, 999);
      break;
    }
    case "week": {
      start = new Date(now);
      start.setDate(start.getDate() - 7);
      break;
    }
    case "month": {
      start = new Date(now);
      start.setMonth(start.getMonth() - 1);
      break;
    }
    case "custom": {
      if (from) start = new Date(from);
      if (to) {
        end = new Date(to);
        end.setHours(23, 59, 59, 999);
      }
      break;
    }
    default:
      start = new Date(0);
  }
  return { start, end };
}

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const type = sp.get("type") || "session";
    const range = sp.get("range");
    const from = sp.get("from");
    const to = sp.get("to");
    const { start, end } = dateRange(range, from, to);

    const withinRange = and(
      gte(labSessions.startTime, start),
      lte(labSessions.startTime, end)
    );

    if (type === "student") {
      const rows = await db
        .select({
          studentId: students.id,
          name: students.name,
          usn: students.usn,
          course: students.course,
          semester: students.semester,
          status: students.status,
          totalSessions: count(labSessions.id),
          totalDuration: sql<number>`COALESCE(SUM(${labSessions.durationSeconds}), 0)`,
        })
        .from(students)
        .leftJoin(
          labSessions,
          and(eq(labSessions.studentId, students.id), withinRange)
        )
        .where(sql`${students.deletedAt} IS NULL`)
        .groupBy(students.id)
        .orderBy(desc(count(labSessions.id)));
      return NextResponse.json({ type, range, rows });
    }

    if (type === "batch") {
      const rows = await db
        .select({
          batchId: batches.id,
          batchName: batches.batchName,
          course: batches.course,
          semester: batches.semester,
          status: batches.status,
          studentCount: sql<number>`COUNT(DISTINCT ${batchStudents.studentId})`,
          totalSessions: sql<number>`COUNT(DISTINCT ${labSessions.id})`,
          totalDuration: sql<number>`COALESCE(SUM(${labSessions.durationSeconds}), 0)`,
        })
        .from(batches)
        .leftJoin(batchStudents, eq(batchStudents.batchId, batches.id))
        .leftJoin(
          labSessions,
          and(eq(labSessions.batchId, batches.id), withinRange)
        )
        .groupBy(batches.id)
        .orderBy(desc(batches.createdAt));
      return NextResponse.json({ type, range, rows });
    }

    if (type === "computer") {
      const rows = await db
        .select({
          computerId: computers.id,
          computerNumber: computers.computerNumber,
          location: computers.location,
          status: computers.status,
          totalSessions: count(labSessions.id),
          totalDuration: sql<number>`COALESCE(SUM(${labSessions.durationSeconds}), 0)`,
        })
        .from(computers)
        .leftJoin(
          labSessions,
          and(eq(labSessions.computerId, computers.id), withinRange)
        )
        .groupBy(computers.id)
        .orderBy(computers.computerNumber);
      return NextResponse.json({ type, range, rows });
    }

    if (type === "action-history") {
      const rows = await db
        .select({
          id: sessionActions.id,
          actionType: sessionActions.actionType,
          description: sessionActions.description,
          timestamp: sessionActions.timestamp,
          studentName: students.name,
          studentUsn: students.usn,
          computerNumber: computers.computerNumber,
        })
        .from(sessionActions)
        .leftJoin(students, eq(sessionActions.studentId, students.id))
        .leftJoin(computers, eq(sessionActions.computerId, computers.id))
        .where(
          and(
            gte(sessionActions.timestamp, start),
            lte(sessionActions.timestamp, end)
          )
        )
        .orderBy(desc(sessionActions.timestamp))
        .limit(500);
      return NextResponse.json({ type, range, rows });
    }

    if (type === "daily" || type === "monthly") {
      const fmt = type === "daily" ? "YYYY-MM-DD" : "YYYY-MM";
      const mysqlFmt = type === "daily" ? "%Y-%m-%d" : "%Y-%m";
      const bucket = isMySQL
        ? sql<string>`DATE_FORMAT(${labSessions.startTime}, ${mysqlFmt})`
        : sql<string>`TO_CHAR(${labSessions.startTime}, ${fmt})`;
      const rows = await db
        .select({
          period: bucket,
          totalSessions: count(labSessions.id),
          totalDuration: sql<number>`COALESCE(SUM(${labSessions.durationSeconds}), 0)`,
          uniqueStudents: sql<number>`COUNT(DISTINCT ${labSessions.studentId})`,
        })
        .from(labSessions)
        .where(withinRange)
        .groupBy(bucket)
        .orderBy(bucket);
      return NextResponse.json({ type, range, rows });
    }

    // default: session report
    const rows = await db
      .select({
        id: labSessions.id,
        studentName: students.name,
        studentUsn: students.usn,
        batchName: batches.batchName,
        computerNumber: computers.computerNumber,
        startTime: labSessions.startTime,
        endTime: labSessions.endTime,
        durationSeconds: labSessions.durationSeconds,
        status: labSessions.status,
      })
      .from(labSessions)
      .leftJoin(students, eq(labSessions.studentId, students.id))
      .leftJoin(batches, eq(labSessions.batchId, batches.id))
      .leftJoin(computers, eq(labSessions.computerId, computers.id))
      .where(withinRange)
      .orderBy(desc(labSessions.startTime))
      .limit(500);

    return NextResponse.json({ type: "session", range, rows });
  } catch (error) {
    console.error("Reports error:", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
