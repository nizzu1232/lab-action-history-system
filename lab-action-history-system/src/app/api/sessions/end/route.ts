import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { labSessions, computers, sessionActions, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentAdmin } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json({ error: "Session ID required" }, { status: 400 });
    }

    return await db.transaction(async (tx: any) => {
      // Find session
      const [session] = await tx
        .select()
        .from(labSessions)
        .where(eq(labSessions.id, sessionId))
        .limit(1);

      if (!session) {
        return NextResponse.json({ error: "Session not found" }, { status: 404 });
      }

      if (session.status !== "active") {
        return NextResponse.json({ error: "Session is not active" }, { status: 400 });
      }

      const now = new Date();
      const durationSeconds = Math.floor(
        (now.getTime() - new Date(session.startTime).getTime()) / 1000
      );

      // Update session
      await tx
        .update(labSessions)
        .set({
          endTime: now,
          durationSeconds,
          status: "completed",
          updatedAt: now,
        })
        .where(eq(labSessions.id, sessionId));

      // Update computer status
      await tx
        .update(computers)
        .set({ status: "available", updatedAt: now })
        .where(eq(computers.id, session.computerId));

      // Record action
      await tx.insert(sessionActions).values({
        sessionId,
        studentId: session.studentId,
        computerId: session.computerId,
        actionType: "session_ended",
        description: `Session ended after ${durationSeconds} seconds`,
        timestamp: now,
      });

      // Audit log
      await tx.insert(auditLogs).values({
        adminId: admin.id,
        action: "session_ended",
        description: `Ended session ${sessionId}`,
        entityType: "session",
        entityId: sessionId,
      });

      return NextResponse.json({
        success: true,
        message: "Session ended successfully",
        durationSeconds,
      });
    });
  } catch (error) {
    console.error("End session error:", error);
    return NextResponse.json({ error: "Failed to end session" }, { status: 500 });
  }
}
