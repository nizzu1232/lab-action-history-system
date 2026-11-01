import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { computers } from "@/db/schema";
import { eq, asc } from "drizzle-orm";
import { insertReturning, updateReturning } from "@/db/compat";

export async function GET() {
  try {
    const rows = await db.select().from(computers).orderBy(asc(computers.computerNumber));
    return NextResponse.json({ computers: rows });
  } catch (error) {
    console.error("Computers list error:", error);
    return NextResponse.json({ error: "Failed to fetch computers" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    if (!data.computerNumber) {
      return NextResponse.json({ error: "Computer number required" }, { status: 400 });
    }
    const newComputer = await insertReturning<any>(db, computers, {
      computerNumber: data.computerNumber,
      status: data.status || "available",
      location: data.location || "Lab A",
    });
    return NextResponse.json({ computer: newComputer }, { status: 201 });
  } catch (error) {
    console.error("Create computer error:", error);
    return NextResponse.json({ error: "Failed to create computer" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status } = await request.json();
    if (!id || !status) {
      return NextResponse.json({ error: "ID and status required" }, { status: 400 });
    }

    // Direct update + select to ensure cross-dialect compatibility
    await db
      .update(computers)
      .set({ status, updatedAt: new Date() })
      .where(eq(computers.id, id));

    const [updated] = await db
      .select()
      .from(computers)
      .where(eq(computers.id, id))
      .limit(1);

    if (!updated) {
      return NextResponse.json({ error: "Computer not found" }, { status: 404 });
    }

    return NextResponse.json({ computer: updated });
  } catch (error) {
    console.error("Update computer error:", error);
    return NextResponse.json({ error: "Failed to update computer" }, { status: 500 });
  }
}
