import { NextResponse } from "next/server";
import { db } from "@/db";
import { auditLogs, admins } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const logs = await db
      .select({
        id: auditLogs.id,
        adminId: auditLogs.adminId,
        adminName: admins.name,
        action: auditLogs.action,
        description: auditLogs.description,
        entityType: auditLogs.entityType,
        entityId: auditLogs.entityId,
        timestamp: auditLogs.timestamp,
        ipAddress: auditLogs.ipAddress,
      })
      .from(auditLogs)
      .leftJoin(admins, eq(auditLogs.adminId, admins.id))
      .orderBy(desc(auditLogs.timestamp))
      .limit(100);

    return NextResponse.json({ logs });
  } catch (error) {
    console.error("Audit logs error:", error);
    return NextResponse.json({ logs: [] }, { status: 200 });
  }
}
