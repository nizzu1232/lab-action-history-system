import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { labSessions, computers, batchStudents, students, auditLogs, sessionActions, batches } from "@/db/schema";
import { eq, and, desc, sql, count } from "drizzle-orm";
import { getCurrentAdmin } from "@/lib/auth";
import { insertReturning } from "@/db/compat";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const studentId = searchParams.get("studentId");
    const batchId = searchParams.get("batchId");

    const conditions = [];
    if (status) conditions.push(eq(labSessions.status, status));
    if (studentId) conditions.push(eq(labSessions.studentId, parseInt(studentId)));
    if (batchId) conditions.push(eq(labSessions.batchId, parseInt(batchId)));

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db
      .select({
        id: labSessions.id,
        studentId: labSessions.studentId,
        computerId: labSessions.computerId,
        batchId: labSessions.batchId,
        startTime: labSessions.startTime,
        endTime: labSessions.endTime,
        durationSeconds: labSessions.durationSeconds,
        status: labSessions.status,
        studentName: students.name,
        studentUsn: students.usn,
        computerNumber: computers.computerNumber,
      })
      .from(labSessions)
      .leftJoin(students, eq(labSessions.studentId, students.id))
      .leftJoin(computers, eq(labSessions.computerId, computers.id))
      .where(where)
      .orderBy(desc(labSessions.startTime))
      .limit(200);

    return NextResponse.json({ sessions: rows });
  } catch (error) {
    console.error("Sessions list error:", error);
    return NextResponse.json({ error: "Failed to fetch sessions" }, { status: 500 });
  }
}

// Start a batch session - core workflow
export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { batchId, studentIds } = await request.json();

    if (!batchId || !studentIds || !Array.isArray(studentIds) || studentIds.length === 0) {
      return NextResponse.json({ error: "batchId and studentIds required" }, { status: 400 });
    }

    // Use transaction
    return await db.transaction(async (tx: any) => {
      // 1. Verify batch exists and is active
      const [batch] = await tx
        .select()
        .from(batches)
        .where(eq(batches.id, batchId))
        .limit(1);

      if (!batch) {
        return NextResponse.json({ error: "Batch not found" }, { status: 404 });
      }
      if (batch.status !== "active") {
        return NextResponse.json({ error: "Batch is not active" }, { status: 400 });
      }

      // 2. Verify students belong to batch and are active
      const assignments = await tx
        .select()
        .from(batchStudents)
        .where(
          and(
            eq(batchStudents.batchId, batchId),
            sql`${batchStudents.studentId} IN (${sql.join(studentIds.map((id) => sql`${id}`), sql`, `)})`
          )
        );

      if (assignments.length !== studentIds.length) {
        return NextResponse.json(
          { error: "Some students do not belong to this batch" },
          { status: 400 }
        );
      }

      // Verify student statuses
      const studentRows = await tx
        .select()
        .from(students)
        .where(sql`${students.id} IN (${sql.join(studentIds.map((id) => sql`${id}`), sql`, `)})`);

      const invalid = studentRows.filter((s: { status: string }) => s.status !== "active");
      if (invalid.length > 0) {
        return NextResponse.json(
          {
            error: `${invalid.length} student(s) are not active`,
            invalidStudents: invalid.map((s: { id: number; name: string; status: string }) => ({
              id: s.id,
              name: s.name,
              status: s.status,
            })),
          },
          { status: 400 }
        );
      }

      // 3. Check no existing active sessions for these students
      const existingActive = await tx
        .select()
        .from(labSessions)
        .where(
          and(
            eq(labSessions.status, "active"),
            sql`${labSessions.studentId} IN (${sql.join(studentIds.map((id) => sql`${id}`), sql`, `)})`
          )
        );

      if (existingActive.length > 0) {
        return NextResponse.json(
          {
            error: `${existingActive.length} student(s) already have active sessions`,
            existingSessions: existingActive.map((s: { studentId: number; id: number }) => ({
              studentId: s.studentId,
              sessionId: s.id,
            })),
          },
          { status: 400 }
        );
      }

      // 4. Find available computers (lock rows)
      const available = await tx
        .select()
        .from(computers)
        .where(eq(computers.status, "available"))
        .orderBy(computers.computerNumber)
        .limit(studentIds.length);

      if (available.length < studentIds.length) {
        return NextResponse.json(
          {
            error: `Only ${available.length} computers available for ${studentIds.length} students`,
            availableCount: available.length,
            requestedCount: studentIds.length,
          },
          { status: 400 }
        );
      }

      // 5. Create sessions, assign computers, update statuses
      const createdSessions = [];
      const now = new Date();

      for (let i = 0; i < studentIds.length; i++) {
        const studentId = studentIds[i];
        const computer = available[i];

        // Create session
        const session = await insertReturning<any>(tx, labSessions, {
          batchId,
          studentId,
          computerId: computer.id,
          startedByAdminId: admin.id,
          startTime: now,
          status: "active",
        });

        // Update computer status
        await tx
          .update(computers)
          .set({ status: "occupied", updatedAt: now })
          .where(eq(computers.id, computer.id));

        // Record action
        await tx.insert(sessionActions).values({
          sessionId: session.id,
          studentId,
          computerId: computer.id,
          actionType: "session_started",
          description: `Session started on ${computer.computerNumber}`,
          timestamp: now,
        });

        createdSessions.push({
          ...session,
          computerNumber: computer.computerNumber,
        });
      }

      // Audit log
      await tx.insert(auditLogs).values({
        adminId: admin.id,
        action: "batch_session_started",
        description: `Started batch session for ${batch.batchName} with ${studentIds.length} students`,
        entityType: "batch",
        entityId: batchId,
      });

      return NextResponse.json({
        success: true,
        message: `Started ${createdSessions.length} sessions successfully`,
        sessions: createdSessions,
        batchName: batch.batchName,
      });
    });
  } catch (error) {
    console.error("Start session error:", error);
    return NextResponse.json({ error: "Failed to start session" }, { status: 500 });
  }
}
