"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ForgotPasswordSchema, ForgotPasswordInput } from "@/lib/schemas/auth";
import { requestPasswordReset } from "@/server/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { LanguageToggle } from "@/components/layout/language-toggle";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  Building2,
  Mail,
  Loader2,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  Copy,
  Check,
  KeyRound,
} from "lucide-react";

export default function ForgotPasswordPage() {
  const { t, isRtl } = useI18n();
  const [isPending, startTransition] = useTransition();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(ForgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: ForgotPasswordInput) => {
    startTransition(async () => {
      const res = await requestPasswordReset(data.email);
      if (res.success) {
        setSubmittedEmail(data.email);
        if (res.temporaryPassword) {
          setTempPassword(res.temporaryPassword);
        }
        setIsSubmitted(true);
        toast.success(
          isRtl
            ? "تم إنشاء كلمة المرور الجديدة وإرسالها بالبريد بنجاح"
            : "New password generated and dispatched to your email"
        );
      } else {
        if (res.temporaryPassword) {
          setSubmittedEmail(data.email);
          setTempPassword(res.temporaryPassword);
          setIsSubmitted(true);
          toast.warning(
            isRtl
              ? "تم تعيين كلمة المرور الجديدة، ولكن تعذر إرسال البريد عبر Resend"
              : "Password reset completed, but Resend email dispatch failed"
          );
        } else {
          toast.error(res.error || "Failed to process request");
        }
      }
    });
  };

  const BackIcon = isRtl ? ArrowRight : ArrowLeft;

  return (
    <div className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 bg-slate-50 dark:bg-slate-950">
      {/* Top bar with Language and Theme toggles */}
      <div className="flex items-center justify-between max-w-5xl w-full mx-auto">
        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
        >
          <BackIcon className="h-4 w-4" />
          <span>{t.auth.backToLogin}</span>
        </Link>
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center py-8">
        <div className="w-full max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-gradient-to-tr from-sky-600 to-cyan-500 text-white shadow-lg shadow-sky-500/20 mb-4">
              <Building2 className="h-8 w-8" />
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">
              {t.auth.forgotPasswordTitle}
            </h1>
            <p className="text-xs uppercase font-semibold tracking-wider text-sky-600 dark:text-sky-400 mt-1">
              {t.common.brand}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm mx-auto">
              {t.auth.forgotPasswordSubtitle}
            </p>
          </div>

          {/* Form Card or Success Confirmation */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-xl shadow-slate-200/50 dark:shadow-none p-6 sm:p-8"
          >
            {isSubmitted ? (
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60 mb-1">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  {isRtl ? "تم إرسال كلمة المرور الجديدة" : "New Password Issued & Dispatched"}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isRtl
                    ? "تم إنشاء كلمة مرور جديدة لحسابك وتحديثها فورياً في النظام، وتم إرسال تفاصيل الدخول إلى بريدك الإلكتروني التالي:"
                    : "A new secure password has been generated, updated in the system, and dispatched to your email address:"}
                </p>
                <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 font-mono break-all font-semibold">
                  {submittedEmail}
                </div>

                {/* Direct Password Display & Copy Box */}
                {tempPassword && (
                  <div className="p-4 rounded-2xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/60 text-center space-y-2">
                    <span className="text-[11px] font-semibold text-sky-800 dark:text-sky-300 uppercase tracking-wider block">
                      {isRtl ? "كلمة المرور الجديدة لتسجيل الدخول" : "Your New Login Password"}
                    </span>
                    <div className="flex items-center justify-center gap-2">
                      <span
                        className="font-mono text-xl font-black tracking-widest text-sky-800 dark:text-sky-300 select-all"
                        dir="ltr"
                      >
                        {tempPassword}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(tempPassword);
                          setCopied(true);
                          toast.success(isRtl ? "تم نسخ كلمة المرور" : "Password copied!");
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="p-1.5 rounded-lg border border-sky-300 dark:border-sky-700 bg-white dark:bg-slate-800 text-sky-600 hover:bg-sky-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        title="Copy password"
                      >
                        {copied ? (
                          <Check className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <Copy className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      {isRtl
                        ? "تم إرسال الكلمة بالبريد، كما يمكنك نسخها من هنا والدخول فوراً."
                        : "Sent to email. You can also copy and sign in immediately."}
                    </p>
                  </div>
                )}

                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    href="/login"
                    className="w-full inline-flex items-center justify-center h-11 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm shadow-md shadow-sky-600/20"
                  >
                    {t.auth.backToLogin}
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitted(false);
                      setTempPassword(null);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline py-2 cursor-pointer"
                  >
                    {isRtl ? "جرب بريداً إلكترونياً آخر" : "Try another email"}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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

                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-11 bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-sm gap-2 shadow-md shadow-sky-600/20 cursor-pointer mt-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{t.auth.sendingResetLink}</span>
                    </>
                  ) : (
                    <span>{t.auth.sendResetLink}</span>
                  )}
                </Button>

                <div className="pt-2 text-center">
                  <Link
                    href="/login"
                    className="text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                  >
                    {t.auth.backToLogin}
                  </Link>
                </div>
              </form>
            )}

            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-2 text-[11px] text-slate-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>Sinoma Enterprise Identity Protection & Resend Delivery</span>
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

