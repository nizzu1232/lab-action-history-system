import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { sessionActions, students, computers } from "@/db/schema";
import { eq, and, ilike, or, sql, desc, count } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const sp = request.nextUrl.searchParams;
    const search = sp.get("search");
    const actionType = sp.get("actionType");
    const page = parseInt(sp.get("page") || "1");
    const limit = parseInt(sp.get("limit") || "20");

    const conditions = [];
    if (actionType) conditions.push(eq(sessionActions.actionType, actionType));
    if (search) {
      conditions.push(
        or(
          ilike(students.name, `%${search}%`),
          ilike(students.usn, `%${search}%`),
          ilike(sessionActions.description, `%${search}%`)
        )
      );
    }
    const where = conditions.length ? and(...conditions) : undefined;

    const rows = await db
      .select({
        id: sessionActions.id,
        actionType: sessionActions.actionType,
        description: sessionActions.description,
        timestamp: sessionActions.timestamp,
        sessionId: sessionActions.sessionId,
        studentName: students.name,
        studentUsn: students.usn,
        computerNumber: computers.computerNumber,
      })
      .from(sessionActions)
      .leftJoin(students, eq(sessionActions.studentId, students.id))
      .leftJoin(computers, eq(sessionActions.computerId, computers.id))
      .where(where)
      .orderBy(desc(sessionActions.timestamp))
      .limit(limit)
      .offset((page - 1) * limit);

    const [totalRow] = await db
      .select({ c: count() })
      .from(sessionActions)
      .leftJoin(students, eq(sessionActions.studentId, students.id))
      .where(where);

    return NextResponse.json({
      rows,
      total: totalRow.c,
      page,
      totalPages: Math.ceil(totalRow.c / limit),
    });
  } catch (error) {
    console.error("Action history error:", error);
    return NextResponse.json({ error: "Failed to fetch action history" }, { status: 500 });
  }
}
