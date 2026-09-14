import { cookies } from "next/headers";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db/db";

export const SESSION_COOKIE_NAME = "badu_admin_session";
const SESSION_DURATION_DAYS = 7;

export interface AdminUserSession {
  id: string;
  email: string;
  role: string;
}

export function verifyCredentials(
  emailInput: string,
  passwordInput: string
): AdminUserSession | null {
  const emailClean = emailInput.trim().toLowerCase();
  const user = db
    .prepare("SELECT id, email, password_hash, role FROM admin_users WHERE email = ?")
    .get(emailClean) as { id: string; email: string; password_hash: string; role: string } | undefined;

  if (!user) return null;

  const valid = bcrypt.compareSync(passwordInput, user.password_hash);
  if (!valid) return null;

  return {
    id: user.id,
    email: user.email,
    role: user.role,
  };
}

export async function createSession(userId: string): Promise<string> {
  const token = crypto.randomBytes(32).toString("hex");
  const sessionId = `sess-${crypto.randomUUID()}`;
  const now = new Date();
  const expiresAt = new Date(now.getTime() + SESSION_DURATION_DAYS * 24 * 60 * 60 * 1000).toISOString();

  db.prepare(`
    INSERT INTO admin_sessions (id, user_id, token, expires_at, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(sessionId, userId, token, expiresAt, now.toISOString());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: new Date(expiresAt),
  });

  return token;
}

export async function verifyAdminSession(): Promise<AdminUserSession | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;

    const row = db
      .prepare(`
        SELECT u.id, u.email, u.role, s.expires_at
        FROM admin_sessions s
        JOIN admin_users u ON s.user_id = u.id
        WHERE s.token = ?
      `)
      .get(token) as { id: string; email: string; role: string; expires_at: string } | undefined;

    if (!row) return null;

    if (new Date(row.expires_at) < new Date()) {
      // Session expired, delete record
      db.prepare("DELETE FROM admin_sessions WHERE token = ?").run(token);
      return null;
    }

    return {
      id: row.id,
      email: row.email,
      role: row.role,
    };
  } catch {
    return null;
  }
}

export async function destroySession(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (token) {
      db.prepare("DELETE FROM admin_sessions WHERE token = ?").run(token);
    }
    cookieStore.delete(SESSION_COOKIE_NAME);
  } catch {
    // Session already clear
  }
}
