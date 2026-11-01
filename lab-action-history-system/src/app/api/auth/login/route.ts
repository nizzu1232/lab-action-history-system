import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { admins, loginAttempts, auditLogs } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { verifyPassword, generateToken, applyAuthCookie } from "@/lib/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    // Check for rate limiting
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentAttempts = await db
      .select()
      .from(loginAttempts)
      .where(
        and(
          eq(loginAttempts.email, email),
          eq(loginAttempts.success, false)
        )
      );

    const recentFailedAttempts = recentAttempts.filter(
      (a: { timestamp: Date | null }) => a.timestamp && a.timestamp > oneHourAgo
    );

    if (recentFailedAttempts.length >= 5) {
      await db.insert(loginAttempts).values({
        email,
        success: false,
        reason: "rate_limited",
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      });

      return NextResponse.json(
        { error: "Too many failed attempts. Please try again later." },
        { status: 429 }
      );
    }

    // Find admin
    const [admin] = await db
      .select()
      .from(admins)
      .where(eq(admins.email, email))
      .limit(1);

    if (!admin) {
      await db.insert(loginAttempts).values({
        email,
        success: false,
        reason: "invalid_email",
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      });

      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (admin.status !== "active") {
      return NextResponse.json(
        { error: "Account is inactive. Contact administrator." },
        { status: 403 }
      );
    }

    // Verify password
    const isValid = await verifyPassword(password, admin.passwordHash);

    if (!isValid) {
      await db.insert(loginAttempts).values({
        email,
        adminId: admin.id,
        success: false,
        reason: "invalid_password",
        ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      });

      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Success - generate token
    const token = generateToken(admin.id);

    // Update last login
    await db
      .update(admins)
      .set({ lastLogin: new Date() })
      .where(eq(admins.id, admin.id));

    // Record successful login
    await db.insert(loginAttempts).values({
      email,
      adminId: admin.id,
      success: true,
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
    });

    // Audit log
    await db.insert(auditLogs).values({
      adminId: admin.id,
      action: "login",
      description: `Admin ${admin.email} logged in successfully`,
      entityType: "admin",
      entityId: admin.id,
      ipAddress: request.headers.get("x-forwarded-for") || "unknown",
      userAgent: request.headers.get("user-agent"),
    });

    const response = NextResponse.json({
      success: true,
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
      },
    });
    return applyAuthCookie(response, token);
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "An error occurred during login" },
      { status: 500 }
    );
  }
}
