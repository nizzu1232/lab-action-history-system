import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { batchStudents, students, batches } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { getCurrentAdmin } from "@/lib/auth";
import { insertReturning } from "@/db/compat";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const batchId = searchParams.get("batchId");

    if (!batchId) {
      return NextResponse.json({ error: "batchId required" }, { status: 400 });
    }

    const rows = await db
      .select({
        id: batchStudents.id,
        assignedDate: batchStudents.assignedDate,
        studentId: students.id,
        studentName: students.name,
        studentUsn: students.usn,
        course: students.course,
        semester: students.semester,
        status: students.status,
      })
      .from(batchStudents)
      .leftJoin(students, eq(batchStudents.studentId, students.id))
      .where(eq(batchStudents.batchId, parseInt(batchId)));

    return NextResponse.json({ students: rows });
  } catch (error) {
    console.error("Batch students error:", error);
    return NextResponse.json({ error: "Failed to fetch batch students" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { batchId, studentIds } = await request.json();

    if (!batchId || !studentIds || !Array.isArray(studentIds)) {
      return NextResponse.json({ error: "batchId and studentIds required" }, { status: 400 });
    }

    // Verify batch exists
    const [batch] = await db.select().from(batches).where(eq(batches.id, batchId)).limit(1);
    if (!batch) {
      return NextResponse.json({ error: "Batch not found" }, { status: 404 });
    }

    const assigned = [];
    const errors = [];

    for (const studentId of studentIds) {
      // Check if student exists
      const [student] = await db.select().from(students).where(eq(students.id, studentId)).limit(1);
      if (!student) {
        errors.push({ studentId, error: "Student not found" });
        continue;
      }

      // Check if already assigned
      const [existing] = await db
        .select()
        .from(batchStudents)
        .where(and(eq(batchStudents.batchId, batchId), eq(batchStudents.studentId, studentId)))
        .limit(1);

      if (existing) {
        errors.push({ studentId, studentName: student.name, error: "Already assigned" });
        continue;
      }

      // Assign
      const assignment = await insertReturning<any>(db, batchStudents, {
        batchId,
        studentId,
        assignedDate: new Date(),
        status: "active",
      });

      assigned.push(assignment);
    }

    return NextResponse.json({
      success: true,
      assigned: assigned.length,
      errors,
      assignments: assigned,
    });
  } catch (error) {
    console.error("Assign students error:", error);
    return NextResponse.json({ error: "Failed to assign students" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { batchId, studentId } = await request.json();

    if (!batchId || !studentId) {
      return NextResponse.json({ error: "batchId and studentId required" }, { status: 400 });
    }

    await db
      .delete(batchStudents)
      .where(and(eq(batchStudents.batchId, batchId), eq(batchStudents.studentId, studentId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Remove student error:", error);
    return NextResponse.json({ error: "Failed to remove student" }, { status: 500 });
  }
}
