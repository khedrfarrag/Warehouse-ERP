"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { SignupSchema, SignupInput } from "@/lib/schemas/auth";
import { signupUser } from "@/server/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "motion/react";
import Link from "next/link";
import {
  Building2,
  Mail,
  Lock,
  User,
  Shield,
  Eye,
  EyeOff,
  Loader2,
} from "lucide-react";

export default function SignupPage() {
  const { t, direction, isRtl } = useI18n();
  const router = useRouter();

  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupInput>({
    resolver: zodResolver(SignupSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "STOREKEEPER",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: SignupInput) => {
    startTransition(async () => {
      const res = await signupUser(data);
      if (res.success) {
        toast.success(
          isRtl
            ? `تم إنشاء الحساب بنجاح، مرحباً بك ${res.user?.name || ""}`
            : `Account registered successfully! Welcome ${res.user?.name || ""}`
        );
        router.push("/");
        router.refresh();
      } else {
        toast.error(res.error || "Registration failed");
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
      {/* Top bar with Language and Theme toggles */}
      <div className="flex items-center justify-end gap-3 max-w-5xl w-full mx-auto">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md mx-auto">
          {/* Top Brand Logo & Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white shadow-lg shadow-sky-500/20 mb-4">
              <Building2 className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {t.common.brand}
            </h1>
            <p className="text-xs uppercase font-semibold tracking-wider text-sky-600 dark:text-sky-400 mt-1">
              {t.common.subBrand}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              {t.auth.signupSubtitle}
            </p>
          </div>

          {/* Main Signup Card */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none p-6 sm:p-8"
          >
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Full Name Field */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.auth.fullName} *
                </label>
                <div className="relative">
                  <User
                    className={`absolute top-3 h-4 w-4 text-slate-400 ${
                      isRtl ? "right-3" : "left-3"
                    }`}
                  />
                  <Input
                    {...register("name")}
                    placeholder={t.auth.fullNamePlaceholder}
                    className={`h-11 ${isRtl ? "pr-9" : "pl-9"}`}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>
                )}
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.auth.email} *
                </label>
                <div className="relative">
                  <Mail
                    className={`absolute top-3 h-4 w-4 text-slate-400 ${
                      isRtl ? "right-3" : "left-3"
                    }`}
                  />
                  <Input
                    type="email"
                    {...register("email")}
                    placeholder={t.auth.emailPlaceholder}
                    className={`h-11 ${isRtl ? "pr-9" : "pl-9"}`}
                    autoComplete="email"
                    dir="ltr"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-500 mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* Role Selection */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.auth.role} *
                </label>
                <div className="relative">
                  <Shield
                    className={`absolute top-3 h-4 w-4 text-slate-400 ${
                      isRtl ? "right-3" : "left-3"
                    }`}
                  />
                  <select
                    {...register("role")}
                    className={`w-full h-11 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer ${
                      isRtl ? "pr-9 pl-3" : "pl-9 pr-3"
                    }`}
                  >
                    <option value="STOREKEEPER">{t.auth.roles.STOREKEEPER}</option>
                    <option value="SITE_ENGINEER">{t.auth.roles.SITE_ENGINEER}</option>
                    <option value="ADMIN">{t.auth.roles.ADMIN}</option>
                    <option value="VIEWER">{t.auth.roles.VIEWER}</option>
                  </select>
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.auth.password} *
                </label>
                <div className="relative">
                  <Lock
                    className={`absolute top-3 h-4 w-4 text-slate-400 ${
                      isRtl ? "right-3" : "left-3"
                    }`}
                  />
                  <Input
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                    placeholder={t.auth.passwordPlaceholder}
                    className={`h-11 ${isRtl ? "pr-9 pl-10" : "pl-9 pr-10"}`}
                    autoComplete="new-password"
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ${
                      isRtl ? "left-3" : "right-3"
                    }`}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.auth.confirmPassword} *
                </label>
                <div className="relative">
                  <Lock
                    className={`absolute top-3 h-4 w-4 text-slate-400 ${
                      isRtl ? "right-3" : "left-3"
                    }`}
                  />
                  <Input
                    type={showPassword ? "text" : "password"}
                    {...register("confirmPassword")}
                    placeholder={t.auth.confirmPasswordPlaceholder}
                    className={`h-11 ${isRtl ? "pr-9 pl-10" : "pl-9 pr-10"}`}
                    autoComplete="new-password"
                    dir="ltr"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-500 mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isPending}
                className="w-full h-11 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm gap-2 shadow-md shadow-sky-600/20 cursor-pointer mt-2"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>{t.auth.signingUp}</span>
                  </>
                ) : (
                  <span>{t.auth.signUpButton}</span>
                )}
              </Button>
            </form>

            {/* Link to Login */}
            <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
              <span>{t.auth.haveAccount} </span>
              <Link
                href="/login"
                className="font-semibold text-sky-600 dark:text-sky-400 hover:underline"
              >
                {t.auth.loginHere}
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-slate-400 py-2">
        Sinoma CDI Contracting • Inventory & Warehouse Logistics ERP
      </div>
    </div>
  );
}

