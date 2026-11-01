import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { admins, auditLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentAdmin, verifyPassword, hashPassword } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const current = await getCurrentAdmin();
    if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { currentPassword, newPassword, confirmPassword } = await request.json();

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 });
    }
    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

    // Strength check
    const strong =
      newPassword.length >= 8 &&
      /[A-Z]/.test(newPassword) &&
      /[a-z]/.test(newPassword) &&
      /[0-9]/.test(newPassword) &&
      /[^A-Za-z0-9]/.test(newPassword);
    if (!strong) {
      return NextResponse.json(
        {
          error:
            "Password must be 8+ chars with uppercase, lowercase, number, and special character",
        },
        { status: 400 }
      );
    }

    const [admin] = await db.select().from(admins).where(eq(admins.id, current.id)).limit(1);
    if (!admin) return NextResponse.json({ error: "Admin not found" }, { status: 404 });

    const valid = await verifyPassword(currentPassword, admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ error: "Current password is incorrect" }, { status: 400 });
    }

    const newHash = await hashPassword(newPassword);
    await db
      .update(admins)
      .set({ passwordHash: newHash, updatedAt: new Date() })
      .where(eq(admins.id, current.id));

    await db.insert(auditLogs).values({
      adminId: current.id,
      action: "password_changed",
      description: `Admin ${current.email} changed their password`,
      entityType: "admin",
      entityId: current.id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Change password error:", error);
    return NextResponse.json({ error: "Failed to change password" }, { status: 500 });
  }
}
