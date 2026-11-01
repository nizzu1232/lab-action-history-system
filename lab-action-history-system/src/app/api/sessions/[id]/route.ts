import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { labSessions, students, computers, batches, sessionActions } from "@/db/schema";
import { eq, asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionId = parseInt(id);

    const [session] = await db
      .select({
        id: labSessions.id,
        startTime: labSessions.startTime,
        endTime: labSessions.endTime,
        durationSeconds: labSessions.durationSeconds,
        status: labSessions.status,
        studentName: students.name,
        studentUsn: students.usn,
        computerNumber: computers.computerNumber,
        batchName: batches.batchName,
      })
      .from(labSessions)
      .leftJoin(students, eq(labSessions.studentId, students.id))
      .leftJoin(computers, eq(labSessions.computerId, computers.id))
      .leftJoin(batches, eq(labSessions.batchId, batches.id))
      .where(eq(labSessions.id, sessionId))
      .limit(1);

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const timeline = await db
      .select({
        id: sessionActions.id,
        actionType: sessionActions.actionType,
        description: sessionActions.description,
        timestamp: sessionActions.timestamp,
      })
      .from(sessionActions)
      .where(eq(sessionActions.sessionId, sessionId))
      .orderBy(asc(sessionActions.timestamp));

    return NextResponse.json({ session, timeline });
  } catch (error) {
    console.error("Session detail error:", error);
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}
