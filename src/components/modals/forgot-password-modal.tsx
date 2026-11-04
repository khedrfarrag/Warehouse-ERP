"use client";

import React, { useState, useTransition, useEffect } from "react";
import { requestPasswordReset } from "@/server/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import {
  Mail,
  Loader2,
  X,
  KeyRound,
  ShieldCheck,
  CheckCircle2,
  Copy,
  Check,
  Send,
  RotateCcw,
} from "lucide-react";

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export function ForgotPasswordModal({
  isOpen,
  onClose,
  defaultEmail = "",
}: ForgotPasswordModalProps) {
  const { t, isRtl } = useI18n();
  const [email, setEmail] = useState(defaultEmail);
  const [isPending, startTransition] = useTransition();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState("");
  const [tempPassword, setTempPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (defaultEmail) {
      setEmail(defaultEmail);
    }
  }, [defaultEmail]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMsg(
        isRtl ? "يرجى إدخال البريد الإلكتروني" : "Please enter your email"
      );
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setErrorMsg(
        isRtl
          ? "البريد الإلكتروني غير صالح"
          : "Please enter a valid email address"
      );
      return;
    }

    startTransition(async () => {
      const res = await requestPasswordReset(trimmedEmail);

      if (res.success) {
        setSubmittedEmail(trimmedEmail);
        if (res.temporaryPassword) {
          setTempPassword(res.temporaryPassword);
        }
        setIsSubmitted(true);
        toast.success(
          isRtl
            ? "تم توليد كلمة مرور جديدة وإرسالها إلى بريدك الإلكتروني عبر Resend"
            : "New password generated and sent to your email via Resend"
        );
      } else {
        if (res.temporaryPassword) {
          setSubmittedEmail(trimmedEmail);
          setTempPassword(res.temporaryPassword);
          setIsSubmitted(true);
          toast.warning(
            isRtl
              ? "تم تحديث كلمة المرور، لكن تعذر تسليم الإيميل عبر Resend"
              : "Password reset completed, but Resend email delivery failed"
          );
        } else {
          setErrorMsg(res.error || "Failed to process request");
          toast.error(res.error || "Failed to process request");
        }
      }
    });
  };

  const handleCopy = () => {
    if (!tempPassword) return;
    navigator.clipboard.writeText(tempPassword);
    setCopied(true);
    toast.success(isRtl ? "تم نسخ كلمة المرور" : "Password copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClose = () => {
    setIsSubmitted(false);
    setTempPassword(null);
    setErrorMsg(null);
    setCopied(false);
    onClose();
  };

  const handleResetForm = () => {
    setIsSubmitted(false);
    setTempPassword(null);
    setErrorMsg(null);
    setCopied(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 relative overflow-hidden"
          >
            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className={`absolute top-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                isRtl ? "left-5" : "right-5"
              }`}
            >
              <X className="h-5 w-5" />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-200/50 dark:border-amber-900/50 shrink-0">
                <Mail className="h-5 w-5" />
              </div>
              <div className="min-w-0 pr-6">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {isRtl ? "استرجاع كلمة المرور" : "Forgot / Reset Password"}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {isRtl
                    ? "إرسال كلمة مرور جديدة مباشرة إلى البريد الإلكتروني"
                    : "Generate and send new password to email via Resend"}
                </p>
              </div>
            </div>

            {isSubmitted ? (
              /* Success / Result View */
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 text-center">
                  <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 mb-2">
                    <CheckCircle2 className="h-6 w-6" />
                  </div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {isRtl
                      ? "تم توليد كلمة المرور بنجاح"
                      : "Password Generated Successfully"}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                    {isRtl
                      ? `تم إرسال كلمة المرور الجديدة إلى البريد:`
                      : `Sent to email address:`}
                  </p>
                  <p className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-300 mt-0.5 break-all">
                    {submittedEmail}
                  </p>
                </div>

                {/* Direct Temporary Password Box */}
                {tempPassword && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        {isRtl ? "كلمة المرور الجديدة" : "New Temporary Password"}
                      </span>
                      <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200/50 dark:border-amber-900/50">
                        {isRtl ? "فعّالة الآن" : "Active Now"}
                      </span>
                    </div>

                    <div className="flex items-center justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-3.5 py-2.5">
                      <span className="font-mono text-sm font-black text-sky-600 dark:text-sky-400 tracking-wider">
                        {tempPassword}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-lg bg-sky-50 hover:bg-sky-100 dark:bg-sky-950/60 dark:hover:bg-sky-900/60 text-sky-600 dark:text-sky-400 border border-sky-200 dark:border-sky-800 transition-colors cursor-pointer"
                        title={isRtl ? "نسخ كلمة المرور" : "Copy Password"}
                      >
                        {copied ? (
                          <>
                            <Check className="h-3.5 w-3.5 text-emerald-600" />
                            <span>{isRtl ? "تم النسخ" : "Copied"}</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3.5 w-3.5" />
                            <span>{isRtl ? "نسخ" : "Copy"}</span>
                          </>
                        )}
                      </button>
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                      {isRtl
                        ? "يمكنك استخدام هذه الكلمة فوراً لتسجيل الدخول أو الاحتفاظ بها من الرسالة المستلمة في بريدك."
                        : "You can sign in immediately with this password or find it in your email inbox."}
                    </p>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between gap-2.5">
                  <button
                    type="button"
                    onClick={handleResetForm}
                    className="inline-flex items-center gap-1 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 underline cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>{isRtl ? "إرسال لإيميل آخر" : "Send to another email"}</span>
                  </button>
                  <Button
                    type="button"
                    onClick={handleClose}
                    className="bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl text-xs h-9 px-4 cursor-pointer"
                  >
                    {isRtl ? "إغلاق" : "Done"}
                  </Button>
                </div>
              </div>
            ) : (
              /* Request Input Form */
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="p-3 rounded-xl bg-sky-50/70 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/40 text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                  {isRtl
                    ? "أدخل البريد الإلكتروني للمستخدم، وسيقوم النظام بتوليد كلمة مرور مؤمنة وتحديثها في قاعدة البيانات وإرسالها فوراً إلى صندوق البريد عبر Resend."
                    : "Enter the user account email. A new secure password will be generated, updated in the database, and dispatched via Resend."}
                </div>

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
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMsg) setErrorMsg(null);
                      }}
                      placeholder={t.auth.emailPlaceholder}
                      className={`h-11 ${isRtl ? "pr-9" : "pl-9"}`}
                      dir="ltr"
                      autoComplete="email"
                      disabled={isPending}
                    />
                  </div>
                  {errorMsg && (
                    <p className="text-xs text-rose-500 mt-1">{errorMsg}</p>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleClose}
                    disabled={isPending}
                    className="rounded-xl"
                  >
                    {isRtl ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isPending}
                    className="bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-xl gap-2 shadow-md shadow-amber-600/20 cursor-pointer"
                  >
                    {isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>
                          {isRtl ? "جاري الإرسال عبر Resend..." : "Sending via Resend..."}
                        </span>
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4" />
                        <span>
                          {isRtl ? "إرسال كلمة المرور للإيميل" : "Send Password to Email"}
                        </span>
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}

            <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
              <ShieldCheck className="h-3 w-3 text-emerald-500" />
              <span>Sinoma Enterprise Security & Resend Integration</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
