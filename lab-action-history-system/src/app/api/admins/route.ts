import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { admins, auditLogs } from "@/db/schema";
import { eq, ne, desc } from "drizzle-orm";
import { getCurrentAdmin, hashPassword } from "@/lib/auth";
import { insertReturning } from "@/db/compat";

export const dynamic = "force-dynamic";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#06b6d4"];

export async function GET() {
  try {
    const current = await getCurrentAdmin();
    if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (current.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden — Super Admin only" }, { status: 403 });
    }

    const rows = await db
      .select({
        id: admins.id,
        name: admins.name,
        email: admins.email,
        role: admins.role,
        status: admins.status,
        avatarColor: admins.avatarColor,
        lastLogin: admins.lastLogin,
        createdAt: admins.createdAt,
      })
      .from(admins)
      .orderBy(desc(admins.createdAt));

    return NextResponse.json({ admins: rows });
  } catch (error) {
    console.error("Admins list error:", error);
    return NextResponse.json({ error: "Failed to fetch admins" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const current = await getCurrentAdmin();
    if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (current.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden — Super Admin only" }, { status: 403 });
    }

    const data = await request.json();
    if (!data.name || !data.email || !data.password) {
      return NextResponse.json({ error: "Name, email and password required" }, { status: 400 });
    }

    const [existing] = await db.select().from(admins).where(eq(admins.email, data.email)).limit(1);
    if (existing) {
      return NextResponse.json({ error: "Email already in use" }, { status: 409 });
    }

    const passwordHash = await hashPassword(data.password);
    const newAdmin = await insertReturning<any>(db, admins, {
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role === "super_admin" ? "super_admin" : "lab_admin",
      status: "active",
      avatarColor: COLORS[Math.floor(Math.random() * COLORS.length)],
    });

    await db.insert(auditLogs).values({
      adminId: current.id,
      action: "admin_created",
      description: `Created admin ${newAdmin.email} (${newAdmin.role})`,
      entityType: "admin",
      entityId: newAdmin.id,
    });

    return NextResponse.json({
      admin: {
        id: newAdmin.id,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        status: newAdmin.status,
      },
    }, { status: 201 });
  } catch (error) {
    console.error("Create admin error:", error);
    return NextResponse.json({ error: "Failed to create admin" }, { status: 500 });
  }
}

// PATCH — change role, status, or reset password
export async function PATCH(request: NextRequest) {
  try {
    const current = await getCurrentAdmin();
    if (!current) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (current.role !== "super_admin") {
      return NextResponse.json({ error: "Forbidden — Super Admin only" }, { status: 403 });
    }

    const { id, role, status, newPassword } = await request.json();
    if (!id) return NextResponse.json({ error: "Admin id required" }, { status: 400 });

    if (id === current.id && (status === "inactive" || role === "lab_admin")) {
      return NextResponse.json(
        { error: "You cannot deactivate or demote your own account" },
        { status: 400 }
      );
    }

    const updates: Record<string, unknown> = { updatedAt: new Date() };
    let auditAction = "admin_updated";
    let auditDesc = `Updated admin #${id}`;

    if (role) {
      updates.role = role === "super_admin" ? "super_admin" : "lab_admin";
      auditAction = "admin_role_changed";
      auditDesc = `Changed admin #${id} role to ${updates.role}`;
    }
    if (status) {
      updates.status = status;
      auditAction = status === "active" ? "admin_activated" : "admin_deactivated";
      auditDesc = `Set admin #${id} status to ${status}`;
    }
    if (newPassword) {
      updates.passwordHash = await hashPassword(newPassword);
      auditAction = "admin_password_reset";
      auditDesc = `Reset password for admin #${id}`;
    }

    await db.update(admins).set(updates).where(eq(admins.id, id));

    await db.insert(auditLogs).values({
      adminId: current.id,
      action: auditAction,
      description: auditDesc,
      entityType: "admin",
      entityId: id,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update admin error:", error);
    return NextResponse.json({ error: "Failed to update admin" }, { status: 500 });
  }
}
