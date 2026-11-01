import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { students, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentAdmin } from "@/lib/auth";
import { insertReturning } from "@/db/compat";

export const dynamic = "force-dynamic";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4", "#3b82f6"];

interface ParsedRow {
  row: number;
  name: string;
  usn: string;
  course: string;
  department: string;
  semester: string;
  academicYear: string;
  email: string;
  phone: string;
  errors: string[];
  duplicate: boolean;
}

// POST with { rows: [...], commit: boolean }
export async function POST(request: NextRequest) {
  try {
    const admin = await getCurrentAdmin();
    if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { rows, commit } = await request.json();
    if (!Array.isArray(rows)) {
      return NextResponse.json({ error: "rows array required" }, { status: 400 });
    }

    const existingUsns = new Set(
      (await db.select({ usn: students.usn }).from(students)).map((r: { usn: string }) =>
        r.usn.toUpperCase()
      )
    );

    const parsed: ParsedRow[] = [];
    const seenInFile = new Set<string>();

    rows.forEach((raw: Record<string, string>, i: number) => {
      const name = (raw.name || raw.Name || "").trim();
      const usn = (raw.usn || raw.USN || "").trim().toUpperCase();
      const course = (raw.course || raw.Course || "").trim();
      const department = (raw.department || raw.Department || "").trim();
      const semester = (raw.semester || raw.Semester || "").trim();
      const academicYear = (raw.academicYear || raw["Academic Year"] || raw.academic_year || "").trim();
      const email = (raw.email || raw.Email || "").trim();
      const phone = (raw.phone || raw.Phone || "").trim();

      const errors: string[] = [];
      if (!name) errors.push("Name required");
      if (!usn) errors.push("USN required");
      if (!course) errors.push("Course required");
      if (!department) errors.push("Department required");
      if (!semester) errors.push("Semester required");
      if (!academicYear) errors.push("Academic year required");
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push("Invalid email");

      let duplicate = false;
      if (usn) {
        if (existingUsns.has(usn) || seenInFile.has(usn)) {
          duplicate = true;
          errors.push("Duplicate USN");
        }
        seenInFile.add(usn);
      }

      parsed.push({
        row: i + 1,
        name, usn, course, department, semester, academicYear, email, phone,
        errors, duplicate,
      });
    });

    const valid = parsed.filter((p) => p.errors.length === 0);
    const invalid = parsed.filter((p) => p.errors.length > 0);

    // Preview mode
    if (!commit) {
      return NextResponse.json({
        preview: true,
        total: parsed.length,
        validCount: valid.length,
        invalidCount: invalid.length,
        rows: parsed,
      });
    }

    // Commit mode - insert valid rows only
    let imported = 0;
    for (const p of valid) {
      await insertReturning(db, students, {
        name: p.name,
        usn: p.usn,
        course: p.course,
        department: p.department,
        semester: p.semester,
        academicYear: p.academicYear,
        email: p.email || null,
        phone: p.phone || null,
        status: "active",
        qrId: `STU-${Date.now()}-${imported}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
        avatarColor: COLORS[imported % COLORS.length],
      });
      imported++;
    }

    await db.insert(auditLogs).values({
      adminId: admin.id,
      action: "csv_imported",
      description: `Imported ${imported} students via CSV`,
      entityType: "student",
    });

    return NextResponse.json({
      committed: true,
      imported,
      skipped: invalid.length,
    });
  } catch (error) {
    console.error("Import error:", error);
    return NextResponse.json({ error: "Failed to import students" }, { status: 500 });
  }
}
