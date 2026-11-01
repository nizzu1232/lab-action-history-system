import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { batches, batchStudents, auditLogs } from "@/db/schema";
import { eq, and, count, desc, sql } from "drizzle-orm";
import { getCurrentAdmin } from "@/lib/auth";
import { insertReturning } from "@/db/compat";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const course = searchParams.get("course");
    const search = searchParams.get("search");

    const conditions = [];
    if (status) conditions.push(eq(batches.status, status));
    if (course) conditions.push(eq(batches.course, course));
    if (search) conditions.push(sql`${batches.batchName} ILIKE ${`%${search}%`}`);

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db
      .select({
        id: batches.id,
        batchName: batches.batchName,
        course: batches.course,
        department: batches.department,
        semester: batches.semester,
        academicYear: batches.academicYear,
        capacity: batches.capacity,
        status: batches.status,
        createdAt: batches.createdAt,
        studentCount: count(batchStudents.id),
      })
      .from(batches)
      .leftJoin(batchStudents, eq(batches.id, batchStudents.batchId))
      .where(where)
      .groupBy(batches.id)
      .orderBy(desc(batches.createdAt));

    return NextResponse.json({ batches: rows });
  } catch (error) {
    console.error("Batches list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch batches" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const data = await request.json();
    if (!data.batchName || !data.course || !data.department || !data.semester || !data.academicYear || !data.capacity) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newBatch = await insertReturning<any>(db, batches, {
      batchName: data.batchName,
      course: data.course,
      department: data.department,
      semester: data.semester,
      academicYear: data.academicYear,
      capacity: parseInt(data.capacity),
      status: data.status || "active",
    });

    await db.insert(auditLogs).values({
      adminId: admin.id,
      action: "batch_created",
      description: `Created batch ${newBatch.batchName}`,
      entityType: "batch",
      entityId: newBatch.id,
    });

    return NextResponse.json({ batch: newBatch }, { status: 201 });
  } catch (error) {
    console.error("Create batch error:", error);
    return NextResponse.json({ error: "Failed to create batch" }, { status: 500 });
  }
}
