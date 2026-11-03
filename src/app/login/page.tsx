"use client";

import React, { useState, useTransition, Suspense } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoginSchema, LoginInput } from "@/lib/schemas/auth";
import { loginUser } from "@/server/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/components/providers/auth-provider";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ShieldAlert,
} from "lucide-react";

function LoginForm() {
  const { t, isRtl } = useI18n();
  const { setUser, refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get("returnUrl") || "/";

  const [showPassword, setShowPassword] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = (data: LoginInput) => {
    startTransition(async () => {
      const res = await loginUser(data);
      if (res.success && res.user) {
        setUser(res.user);
        toast.success(
          isRtl
            ? `مرحباً بعودتك، ${res.user?.name || ""}`
            : `Welcome back, ${res.user?.name || ""}`
        );
        router.push(returnUrl);
        router.refresh();
      } else {
        toast.error(res.error || "Login failed");
      }
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Top Brand Logo & Header */}
      <div className="text-center mb-8">
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
          {t.auth.loginSubtitle}
        </p>
      </div>

      {/* Main Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none p-6 sm:p-8"
      >
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300">
                {t.auth.password} *
              </label>
              <Link
                href="/forgot-password"
                className="text-xs font-medium text-sky-600 hover:text-sky-700 dark:text-sky-400 hover:underline"
              >
                {t.auth.forgotPassword}
              </Link>
            </div>
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
                autoComplete="current-password"
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

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                {...register("rememberMe")}
                className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400">
                {t.auth.rememberMe}
              </span>
            </label>
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
                <span>{t.auth.signingIn}</span>
              </>
            ) : (
              <span>{t.auth.signInButton}</span>
            )}
          </Button>
        </form>

        {/* Security / Admin Provisioning Notice */}
        <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-700/60 text-slate-500 dark:text-slate-400 text-xs">
            <ShieldAlert className="h-4 w-4 text-sky-600 dark:text-sky-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              {t.auth.staffProvisionNotice}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
      {/* Top bar with Language and Theme toggles */}
      <div className="flex items-center justify-end gap-3 max-w-5xl w-full mx-auto">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center py-8">
        <Suspense fallback={<div className="text-center text-sm text-slate-400">Loading...</div>}>
          <LoginForm />
        </Suspense>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-slate-400 py-2">
        Sinoma CDI Contracting • Inventory & Warehouse Logistics ERP
      </div>
    </div>
  );
}
