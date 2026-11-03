import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

export const SESSION_COOKIE_NAME = "sinoma_session";

const SECRET_KEY = process.env.JWT_SECRET || "sinoma-contracting-warehouse-super-secure-jwt-key-2026-ci-cd";
const encodedKey = new TextEncoder().encode(SECRET_KEY);

export type UserRole = "ADMIN" | "STOREKEEPER" | "SITE_ENGINEER" | "VIEWER";

export interface AuthSessionPayload {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string | null;
}

/**
 * Hashes a plaintext password using bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

/**
 * Compares plaintext password against a bcrypt hash
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Signs an encrypted JWT session token using jose (Edge-compatible)
 */
export async function signSessionToken(
  payload: AuthSessionPayload,
  rememberMe: boolean = false
): Promise<string> {
  const expiration = rememberMe ? "30d" : "7d";
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiration)
    .sign(encodedKey);
}

/**
 * Verifies a JWT session token and returns the decoded payload, or null if invalid/expired
 */
export async function verifySessionToken(token: string): Promise<AuthSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: ["HS256"],
    });
    return payload as unknown as AuthSessionPayload;
  } catch {
    return null;
  }
}

/**
 * Sets the HTTP-only, secure session cookie
 */
export async function setSessionCookie(token: string, rememberMe: boolean = false) {
  const cookieStore = await cookies();
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // 30 days or 7 days

  cookieStore.set(SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  });
}

/**
 * Deletes the session cookie
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Reads the current session cookie and returns the active authenticated user
 */
export async function getCurrentUser(): Promise<AuthSessionPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return await verifySessionToken(token);
  } catch {
    return null;
  }
}

