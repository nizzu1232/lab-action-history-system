import { NextResponse } from "next/server";
import { applyClearAuthCookie, getCurrentAdmin } from "@/lib/auth";
import { db } from "@/db";
import { auditLogs } from "@/db/schema";

export async function POST() {
  const admin = await getCurrentAdmin();
  if (admin) {
    await db.insert(auditLogs).values({
      adminId: admin.id,
      action: "logout",
      description: `Admin ${admin.email} logged out`,
      entityType: "admin",
      entityId: admin.id,
    });
  }
  return applyClearAuthCookie(NextResponse.json({ success: true }));
}
