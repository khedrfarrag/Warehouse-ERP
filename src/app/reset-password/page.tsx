"use client";

import React, { useState, useEffect, useTransition, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ResetPasswordSchema, ResetPasswordInput } from "@/lib/schemas/auth";
import { verifyResetToken, resetPasswordWithToken } from "@/server/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { toast } from "sonner";
import { motion } from "motion/react";
import Link from "next/link";
import {
  Building2,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";

function ResetPasswordContent() {
  const { t, isRtl } = useI18n();
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [isVerifying, setIsVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setIsVerifying(false);
        setTokenValid(false);
        return;
      }

      const res = await verifyResetToken(token);
      setIsVerifying(false);
      if (res.valid) {
        setTokenValid(true);
        setUserEmail(res.email || "");
        setUserName(res.name || "");
      } else {
        setTokenValid(false);
      }
    }

    checkToken();
  }, [token]);

  const onSubmit = (data: ResetPasswordInput) => {
    startTransition(async () => {
      const res = await resetPasswordWithToken(token, data.password);
      if (res.success) {
        setIsSuccess(true);
        toast.success(t.auth.passwordResetSuccess);
        setTimeout(() => {
          router.push("/login");
        }, 2500);
      } else {
        toast.error(res.error || "Failed to update password");
      }
    });
  };

  if (isVerifying) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-sky-600 mb-3" />
        <p className="text-sm text-slate-500">
          {isRtl ? "جاري التحقق من صلاحية الرابط..." : "Verifying reset token..."}
        </p>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-8 text-center"
      >
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 mb-4">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          {isRtl ? "الرابط غير صالح أو منتهي الصلاحية" : "Invalid or Expired Link"}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 max-w-xs mx-auto">
          {t.auth.invalidOrExpiredToken}
        </p>
        <Link
          href="/forgot-password"
          className="inline-flex items-center justify-center h-11 px-6 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-sky-600/20"
        >
          {isRtl ? "طلب رابط جديد" : "Request New Reset Link"}
        </Link>
      </motion.div>
    );
  }

  if (isSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl p-8 text-center"
      >
        <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 mb-4">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
          {isRtl ? "تم تعيين كلمة المرور بنجاح" : "Password Updated Successfully"}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
          {t.auth.passwordResetSuccess}
        </p>
        <Link
          href="/login"
          className="inline-flex items-center justify-center h-11 px-6 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-sky-600/20"
        >
          {t.auth.signInButton}
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none p-6 sm:p-8"
    >
      <div className="mb-6 pb-4 border-b border-slate-100 dark:border-slate-800 text-center">
        <p className="text-xs text-slate-500">
          {isRtl ? "إعادة تعيين كلمة المرور للحساب:" : "Resetting password for:"}
        </p>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5">
          {userName} ({userEmail})
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* New Password */}
        <div>
          <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
            {t.auth.newPassword} *
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
              placeholder={t.auth.newPasswordPlaceholder}
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

        {/* Confirm Password */}
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

        <Button
          type="submit"
          disabled={isPending}
          className="w-full h-11 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm gap-2 shadow-md shadow-sky-600/20 cursor-pointer mt-4"
        >
          {isPending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{isRtl ? "جاري الحفظ والتحديث..." : "Updating password..."}</span>
            </>
          ) : (
            <span>{t.auth.saveNewPassword}</span>
          )}
        </Button>
      </form>
    </motion.div>
  );
}

export default function ResetPasswordPage() {
  const { t } = useI18n();

  return (
    <div className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
      {/* Top bar with Language and Theme toggles */}
      <div className="flex items-center justify-end gap-3 max-w-5xl w-full mx-auto">
        <LanguageToggle />
        <ThemeToggle />
      </div>

      <div className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white shadow-lg shadow-sky-500/20 mb-4">
              <Building2 className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {t.auth.resetPasswordTitle}
            </h1>
            <p className="text-xs uppercase font-semibold tracking-wider text-sky-600 dark:text-sky-400 mt-1">
              {t.common.brand}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
              {t.auth.resetPasswordSubtitle}
            </p>
          </div>

          <Suspense fallback={<div className="text-center text-sm text-slate-400">Loading...</div>}>
            <ResetPasswordContent />
          </Suspense>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-[11px] text-slate-400 py-2">
        Sinoma CDI Contracting • Inventory & Warehouse Logistics ERP
      </div>
    </div>
  );
}

