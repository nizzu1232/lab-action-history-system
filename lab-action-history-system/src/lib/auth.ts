import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { cookies, headers } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { admins } from "@/db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "lab-action-history-secret-key-change-in-production";
export const COOKIE_NAME = "auth_token";

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(adminId: number): string {
  return jwt.sign({ adminId }, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string): { adminId: number } | null {
  try {
    return jwt.verify(token, JWT_SECRET) as { adminId: number };
  } catch {
    return null;
  }
}

export function getCookieOptions() {
  // SameSite=None + Secure is required when the app is previewed inside an iframe
  // (cross-site). On localhost HTTP we keep Lax + insecure so cookies still work.
  const isProd = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: (isProd ? "none" : "lax") as "none" | "lax",
    maxAge: 60 * 60 * 24,
    path: "/",
  };
}

function tokenFromRequest(request?: NextRequest): string | undefined {
  if (request) {
    const header = request.headers.get("authorization");
    if (header?.startsWith("Bearer ")) return header.slice(7);
    const fromCookie = request.cookies.get(COOKIE_NAME)?.value;
    if (fromCookie) return fromCookie;
  }
  return undefined;
}

export async function getCurrentAdmin(request?: NextRequest) {
  let token = tokenFromRequest(request);

  if (!token) {
    try {
      const headerStore = await headers();
      const auth = headerStore.get("authorization");
      if (auth?.startsWith("Bearer ")) token = auth.slice(7);
    } catch {
      /* headers() unavailable outside a request */
    }
  }

  if (!token) {
    try {
      const cookieStore = await cookies();
      token = cookieStore.get(COOKIE_NAME)?.value;
    } catch {
      token = undefined;
    }
  }

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const [admin] = await db
    .select()
    .from(admins)
    .where(eq(admins.id, payload.adminId))
    .limit(1);

  if (!admin || admin.status !== "active") return null;

  return {
    id: admin.id,
    name: admin.name,
    email: admin.email,
    role: admin.role,
    avatarColor: admin.avatarColor || "#6366f1",
    lastLogin: admin.lastLogin,
  };
}

export function applyAuthCookie(response: NextResponse, token: string) {
  response.cookies.set(COOKIE_NAME, token, getCookieOptions());
  return response;
}

export function applyClearAuthCookie(response: NextResponse) {
  response.cookies.set(COOKIE_NAME, "", { ...getCookieOptions(), maxAge: 0 });
  return response;
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, getCookieOptions());
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export function isSuperAdmin(admin: { role: string } | null): boolean {
  return admin?.role === "super_admin";
}
