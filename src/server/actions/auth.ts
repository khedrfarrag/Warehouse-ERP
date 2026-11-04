"use server";

import { prisma } from "@/lib/db";
import {
  hashPassword,
  verifyPassword,
  signSessionToken,
  setSessionCookie,
  clearSessionCookie,
  getCurrentUser,
  AuthSessionPayload,
} from "@/lib/auth";
import { LoginSchema, LoginInput, SignupSchema, SignupInput } from "@/lib/schemas/auth";
import { revalidatePath } from "next/cache";
import { sendPasswordResetEmail, sendStaffActivationEmail } from "@/lib/email";
import crypto from "crypto";

function getAppUrl(): string {
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`;
  }
  return "http://localhost:3000";
}


/**
 * Automatically ensures default administrative & warehouse accounts exist in the database.
 */
export async function ensureDefaultUsers() {
  try {
    const adminExists = await prisma.user.findUnique({
      where: { email: "admin@sinoma.com" },
    });

    if (!adminExists) {
      const hashedPassword = await hashPassword("admin123");
      await prisma.user.create({
        data: {
          name: "Sinoma System Admin",
          email: "admin@sinoma.com",
          password: hashedPassword,
          role: "ADMIN",
        },
      });
    }

    const storekeeperExists = await prisma.user.findUnique({
      where: { email: "storekeeper@sinoma.com" },
    });

    if (!storekeeperExists) {
      const hashedPassword = await hashPassword("sinoma123");
      await prisma.user.create({
        data: {
          name: "Warehouse Storekeeper",
          email: "storekeeper@sinoma.com",
          password: hashedPassword,
          role: "STOREKEEPER",
        },
      });
    }
  } catch (err) {
    console.error("Error creating default users:", err);
  }
}

/**
 * Authenticates user credentials, sets session cookie, and returns user profile
 */
export async function loginUser(input: LoginInput) {
  try {
    await ensureDefaultUsers();

    const validated = LoginSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Invalid input data",
      };
    }

    const { email, password, rememberMe } = validated.data;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (!user) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return {
        success: false,
        error: "Invalid email or password",
      };
    }

    const sessionPayload: AuthSessionPayload = {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role as any,
      avatarUrl: user.avatarUrl,
    };

    const token = await signSessionToken(sessionPayload, rememberMe);
    await setSessionCookie(token, rememberMe);

    revalidatePath("/", "layout");

    return {
      success: true,
      user: sessionPayload,
    };
  } catch (error: any) {
    console.error("Login action error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred during login",
    };
  }
}

/**
 * Registers a new user account, encrypts password, and signs into active session
 */
export async function signupUser(input: SignupInput) {
  try {
    const validated = SignupSchema.safeParse(input);
    if (!validated.success) {
      return {
        success: false,
        error: validated.error.errors[0]?.message || "Validation failed",
      };
    }

    const { name, email, password, role } = validated.data;
    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      return {
        success: false,
        error: "An account with this email already exists",
      };
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        role: role as any,
      },
    });

    const sessionPayload: AuthSessionPayload = {
      userId: newUser.id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role as any,
      avatarUrl: newUser.avatarUrl,
    };

    const token = await signSessionToken(sessionPayload, false);
    await setSessionCookie(token, false);

    revalidatePath("/", "layout");

    return {
      success: true,
      user: sessionPayload,
    };
  } catch (error: any) {
    console.error("Signup action error:", error);
    return {
      success: false,
      error: error.message || "An unexpected error occurred during registration",
    };
  }
}

/**
 * Terminates user session and removes authentication cookie
 */
export async function logoutUser() {
  try {
    await clearSessionCookie();
    revalidatePath("/", "layout");
    return { success: true };
  } catch (error: any) {
    console.error("Logout error:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Returns current authenticated user session
 */
export async function getSessionUser() {
  try {
    const user = await getCurrentUser();
    return { success: true, user };
  } catch (error: any) {
    return { success: false, user: null, error: error.message };
  }
}

/**
 * Initiates Forgot Password flow by generating a 60-min token and sending an email via Resend
 */
export async function requestPasswordReset(email: string) {
  try {
    const normalizedEmail = email.toLowerCase().trim();
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      return {
        success: false,
        error: "لا يوجد حساب مسجل بهذا البريد الإلكتروني في نظام المستودعات (No account found with this email).",
      };
    }

    // Generate new secure password (e.g. Sinoma@481923)
    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const newPassword = `Sinoma@${randomSuffix}`;
    const hashedPassword = await hashPassword(newPassword);

    // Directly update password in database and ensure active status
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        status: "ACTIVE",
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    const loginUrl = `${getAppUrl()}/login`;
    const emailRes = await sendPasswordResetEmail({
      to: user.email,
      name: user.name,
      newPassword,
      loginUrl,
    });

    if (!emailRes.success) {
      console.warn("Resend email warning:", emailRes.error);
      return {
        success: false,
        error: emailRes.error || "فشل إرسال رسالة كلمة المرور الجديدة عبر Resend",
        temporaryPassword: newPassword,
      };
    }

    return {
      success: true,
      message: "تم إنشاء كلمة مرور جديدة وإرسالها إلى بريدك الإلكتروني بنجاح عبر Resend.",
      temporaryPassword: newPassword,
    };
  } catch (err: any) {
    console.error("requestPasswordReset error:", err);
    return { success: false, error: err.message || "Failed to process password reset request" };
  }
}

/**
 * Validates whether a password reset token is valid and unexpired
 */
export async function verifyResetToken(token: string) {
  try {
    if (!token) return { valid: false };

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return { valid: false };
    }

    return {
      valid: true,
      email: user.email,
      name: user.name,
    };
  } catch (err) {
    return { valid: false };
  }
}

/**
 * Resets user password using a verified reset token
 */
export async function resetPasswordWithToken(token: string, newPassword: string) {
  try {
    if (!token || !newPassword || newPassword.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return {
        success: false,
        error: "Reset link is invalid or has expired. Please request a new one.",
      };
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    return { success: true };
  } catch (err: any) {
    console.error("resetPasswordWithToken error:", err);
    return { success: false, error: err.message || "Failed to reset password" };
  }
}

/**
 * Changes password for currently authenticated user
 */
export async function changeUserPassword(currentPassword: string, newPassword: string) {
  try {
    const session = await getCurrentUser();
    if (!session?.userId) {
      return { success: false, error: "Unauthorized access" };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "New password must be at least 6 characters" };
    }

    const user = await prisma.user.findUnique({
      where: { id: session.userId },
    });

    if (!user) {
      return { success: false, error: "User not found" };
    }

    const isMatch = await verifyPassword(currentPassword, user.password);
    if (!isMatch) {
      return { success: false, error: "Current password is incorrect" };
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    });

    return { success: true };
  } catch (err: any) {
    console.error("changeUserPassword error:", err);
    return { success: false, error: err.message || "Failed to change password" };
  }
}

/**
 * ADMIN ONLY: Creates a new staff member account (Storekeeper, Engineer, Viewer)
 * and dispatches invitation email via Resend
 */
export async function adminCreateStaffUser(data: {
  name: string;
  email: string;
  role: "ADMIN" | "STOREKEEPER" | "SITE_ENGINEER" | "VIEWER";
  sendInvite?: boolean;
  initialPassword?: string;
}) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Access Denied: Only administrators can create staff accounts" };
    }

    const normalizedEmail = data.email.toLowerCase().trim();
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return { success: false, error: "An account with this email already exists" };
    }

    const rawPassword = data.initialPassword || crypto.randomBytes(8).toString("hex") + "Aa1!";
    const hashedPassword = await hashPassword(rawPassword);
    const activationToken = crypto.randomBytes(32).toString("hex");

    const newUser = await prisma.user.create({
      data: {
        name: data.name.trim(),
        email: normalizedEmail,
        role: data.role,
        password: hashedPassword,
        status: data.initialPassword ? "ACTIVE" : "PENDING_ACTIVATION",
        activationToken,
        invitedBy: session.name || session.email,
      },
    });

    if (data.sendInvite !== false) {
      const activationUrl = `${getAppUrl()}/set-password?token=${activationToken}`;
      await sendStaffActivationEmail({
        to: newUser.email,
        name: newUser.name,
        role: newUser.role,
        activationUrl,
        invitedByName: session.name,
      });
    }

    revalidatePath("/users");

    return {
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        status: newUser.status,
      },
    };
  } catch (err: any) {
    console.error("adminCreateStaffUser error:", err);
    return { success: false, error: err.message || "Failed to create staff member" };
  }
}

/**
 * ADMIN ONLY: Fetches all registered system users
 */
export async function adminGetUsers() {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Access Denied: Administrator role required", data: [] };
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
        updatedAt: true,
        invitedBy: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: users };
  } catch (err: any) {
    return { success: false, error: err.message, data: [] };
  }
}

/**
 * ADMIN ONLY: Deletes a user account
 */
export async function adminDeleteUser(userId: string) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Access Denied" };
    }

    if (session.userId === userId) {
      return { success: false, error: "You cannot delete your own administrator account" };
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    revalidatePath("/users");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete user" };
  }
}

/**
 * ADMIN ONLY: Toggles user active / suspended status
 */
export async function adminToggleUserStatus(userId: string, newStatus: "ACTIVE" | "SUSPENDED") {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Access Denied" };
    }

    if (session.userId === userId) {
      return { success: false, error: "You cannot suspend your own administrator account" };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { status: newStatus },
    });

    revalidatePath("/users");
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update user status" };
  }
}

/**
 * ADMIN ONLY: Directly resets a staff member's password
 */
export async function adminResetStaffPassword(userId: string, newPassword: string) {
  try {
    const session = await getCurrentUser();
    if (!session || session.role !== "ADMIN") {
      return { success: false, error: "Access Denied: Administrator role required" };
    }

    if (!newPassword || newPassword.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
        status: "ACTIVE",
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    revalidatePath("/users");
    return { success: true };
  } catch (err: any) {
    console.error("adminResetStaffPassword error:", err);
    return { success: false, error: err.message || "Failed to update staff password" };
  }
}

/**
 * Validates staff activation token
 */
export async function verifyActivationToken(token: string) {
  try {
    if (!token) return { valid: false };

    const user = await prisma.user.findFirst({
      where: {
        activationToken: token,
      },
    });

    if (!user) {
      return { valid: false };
    }

    return {
      valid: true,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  } catch (err) {
    return { valid: false };
  }
}

/**
 * Activates invited staff account (e.g. Storekeeper), updates password, and logs them in
 */
export async function activateStaffAccountWithPassword(token: string, newPassword: string) {
  try {
    if (!token || !newPassword || newPassword.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }

    const user = await prisma.user.findFirst({
      where: {
        activationToken: token,
      },
    });

    if (!user) {
      return {
        success: false,
        error: "Activation link is invalid or has expired.",
      };
    }

    const hashedPassword = await hashPassword(newPassword);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        status: "ACTIVE",
        activationToken: null,
      },
    });

    const sessionPayload: AuthSessionPayload = {
      userId: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      role: updatedUser.role as any,
      avatarUrl: updatedUser.avatarUrl,
    };

    const sessionToken = await signSessionToken(sessionPayload, true);
    await setSessionCookie(sessionToken, true);

    revalidatePath("/", "layout");

    return {
      success: true,
      user: sessionPayload,
    };
  } catch (err: any) {
    console.error("activateStaffAccountWithPassword error:", err);
    return { success: false, error: err.message || "Failed to activate staff account" };
  }
}

