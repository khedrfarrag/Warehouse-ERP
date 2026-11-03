import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const SESSION_COOKIE_NAME = "sinoma_session";
const SECRET_KEY = process.env.JWT_SECRET || "sinoma-contracting-warehouse-super-secure-jwt-key-2026-ci-cd";
const encodedKey = new TextEncoder().encode(SECRET_KEY);

const PUBLIC_PATHS = [
  "/login",
  "/forgot-password",
  "/reset-password",
  "/set-password",
  "/api/upload",
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Bypass static assets, internal Next.js files, and public uploads
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/uploads") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // 2. Fix /dashboard alias: automatically redirect to root dashboard /
  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // 3. Verify session token & decode user role
  const sessionToken = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  let isAuthenticated = false;
  let userRole: string | null = null;

  if (sessionToken) {
    try {
      const { payload } = await jwtVerify(sessionToken, encodedKey, { algorithms: ["HS256"] });
      isAuthenticated = true;
      userRole = (payload as any).role || null;
    } catch {
      isAuthenticated = false;
    }
  }

  const isPublicPath = PUBLIC_PATHS.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  // 4. If already authenticated and accessing login or password reset, redirect to dashboard
  if (
    isAuthenticated &&
    (pathname === "/login" ||
      pathname === "/signup" ||
      pathname === "/forgot-password" ||
      pathname === "/reset-password")
  ) {
    const returnUrl = request.nextUrl.searchParams.get("returnUrl") || "/";
    return NextResponse.redirect(new URL(returnUrl, request.url));
  }

  // 5. If public path, allow request
  if (isPublicPath) {
    return NextResponse.next();
  }

  // 6. If unauthenticated, redirect to /login with returnUrl
  if (!isAuthenticated) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized access. Please log in." },
        { status: 401 }
      );
    }

    const loginUrl = new URL("/login", request.url);
    if (pathname !== "/") {
      loginUrl.searchParams.set("returnUrl", pathname);
    }
    return NextResponse.redirect(loginUrl);
  }

  // 7. Role-Based Access Control (RBAC Guard)
  // Protected Admin Routes: /users, /admin/*
  if (pathname.startsWith("/users") || pathname.startsWith("/admin")) {
    if (userRole !== "ADMIN") {
      const redirectUrl = new URL("/", request.url);
      redirectUrl.searchParams.set("error", "unauthorized_role");
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc)
     */
    "/((?!_next/static|_next/image|favicon.ico|uploads/).*)",
  ],
};
