import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { students, auditLogs } from "@/db/schema";
import { eq, ilike, or, and, sql, count, desc } from "drizzle-orm";
import { getCurrentAdmin } from "@/lib/auth";
import { insertReturning } from "@/db/compat";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const course = searchParams.get("course");
    const semester = searchParams.get("semester");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const includeDeleted = searchParams.get("includeDeleted") === "true";

    const conditions = [];
    if (!includeDeleted) conditions.push(sql`${students.deletedAt} IS NULL`);
    if (status) conditions.push(eq(students.status, status));
    if (course) conditions.push(eq(students.course, course));
    if (semester) conditions.push(eq(students.semester, semester));
    if (search) {
      conditions.push(
        or(
          ilike(students.name, `%${search}%`),
          ilike(students.usn, `%${search}%`),
          ilike(students.email, `%${search}%`)
        )
      );
    }

    const where = conditions.length > 0 ? and(...conditions) : undefined;

    const rows = await db
      .select()
      .from(students)
      .where(where)
      .orderBy(desc(students.createdAt))
      .limit(limit)
      .offset((page - 1) * limit);

    const [totalResult] = await db
      .select({ count: count() })
      .from(students)
      .where(where);

    return NextResponse.json({
      students: rows,
      total: totalResult.count,
      page,
      limit,
      totalPages: Math.ceil(totalResult.count / limit),
    });
  } catch (error) {
    console.error("Students list error:", error);
    return NextResponse.json(
      { error: "Failed to fetch students" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();

    // Validate required fields
    if (!data.name || !data.usn || !data.course || !data.department || !data.semester || !data.academicYear) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Check duplicate USN
    const [existing] = await db
      .select()
      .from(students)
      .where(eq(students.usn, data.usn))
      .limit(1);

    if (existing) {
      return NextResponse.json(
        { error: `USN ${data.usn} is already registered` },
        { status: 409 }
      );
    }

    const colors = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#3b82f6"];
    const avatarColor = colors[Math.floor(Math.random() * colors.length)];

    const newStudent = await insertReturning<any>(db, students, {
      name: data.name,
      usn: data.usn.toUpperCase(),
      course: data.course,
      department: data.department,
      semester: data.semester,
      academicYear: data.academicYear,
      email: data.email || null,
      phone: data.phone || null,
      status: data.status || "active",
      qrId: `STU-${Date.now()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      avatarColor,
    });

    // Audit log
    await db.insert(auditLogs).values({
      adminId: admin.id,
      action: "student_created",
      description: `Created student ${newStudent.name} (${newStudent.usn})`,
      entityType: "student",
      entityId: newStudent.id,
    });

    return NextResponse.json({ student: newStudent }, { status: 201 });
  } catch (error) {
    console.error("Create student error:", error);
    return NextResponse.json(
      { error: "Failed to create student" },
      { status: 500 }
    );
  }
}
