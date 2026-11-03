import { z } from "zod";

export const LoginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean().optional().default(false),
});

export type LoginInput = z.infer<typeof LoginSchema>;

export const SignupSchema = z
  .object({
    name: z
      .string()
      .min(2, "Full name must be at least 2 characters")
      .max(60, "Name is too long"),
    email: z
      .string()
      .min(1, "Email is required")
      .email("Please enter a valid email address"),
    role: z
      .enum(["ADMIN", "STOREKEEPER", "SITE_ENGINEER", "VIEWER"])
      .default("STOREKEEPER"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Confirm password is required"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type SignupInput = z.infer<typeof SignupSchema>;

export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

export const ResetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(6, "Password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;

export const ChangePasswordSchema = z
  .object({
    currentPassword: z
      .string()
      .min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(6, "New password must be at least 6 characters"),
    confirmPassword: z
      .string()
      .min(6, "Please confirm your new password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"],
  });

export type ChangePasswordInput = z.infer<typeof ChangePasswordSchema>;

export const AdminCreateStaffSchema = z.object({
  name: z
    .string()
    .min(2, "Full name must be at least 2 characters")
    .max(60, "Name is too long"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  role: z.enum(["ADMIN", "STOREKEEPER", "SITE_ENGINEER", "VIEWER"]),
  sendInvite: z.boolean().default(true),
  initialPassword: z.string().optional(),
});

export type AdminCreateStaffInput = z.infer<typeof AdminCreateStaffSchema>;
