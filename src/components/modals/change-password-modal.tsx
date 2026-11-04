"use client";

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ChangePasswordSchema, ChangePasswordInput } from "@/lib/schemas/auth";
import { changeUserPassword } from "@/server/actions/auth";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import {
  Lock,
  Eye,
  EyeOff,
  Loader2,
  X,
  KeyRound,
  ShieldCheck,
} from "lucide-react";

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ChangePasswordModal({ isOpen, onClose }: ChangePasswordModalProps) {
  const { t, isRtl } = useI18n();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ChangePasswordInput>({
    resolver: zodResolver(ChangePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit = (data: ChangePasswordInput) => {
    startTransition(async () => {
      const res = await changeUserPassword(data.currentPassword, data.newPassword);
      if (res.success) {
        toast.success(t.auth.changePasswordSuccess);
        reset();
        onClose();
      } else {
        toast.error(res.error || "Failed to change password");
      }
    });
  };

  const handleClose = () => {
    reset();
    onClose();
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
            {/* Close button */}
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
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-100 dark:border-sky-900/50">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.auth.changePassword}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isRtl ? "تحديث بيانات الأمان وكلمة المرور لحسابك" : "Update your account security password"}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* Current Password */}
              <div>
                <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                  {t.auth.currentPassword} *
                </label>
                <div className="relative">
                  <Lock
                    className={`absolute top-3 h-4 w-4 text-slate-400 ${
                      isRtl ? "right-3" : "left-3"
                    }`}
                  />
                  <Input
                    type={showCurrent ? "text" : "password"}
                    {...register("currentPassword")}
                    placeholder={t.auth.currentPasswordPlaceholder}
                    className={`h-11 ${isRtl ? "pr-9 pl-10" : "pl-9 pr-10"}`}
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className={`absolute top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ${
                      isRtl ? "left-3" : "right-3"
                    }`}
                    tabIndex={-1}
                  >
                    {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.currentPassword && (
                  <p className="text-xs text-rose-500 mt-1">
                    {errors.currentPassword.message}
                  </p>
                )}
              </div>

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
                    type={showNew ? "text" : "password"}
                    {...register("newPassword")}
                    placeholder={t.auth.newPasswordPlaceholder}
                    className={`h-11 ${isRtl ? "pr-9 pl-10" : "pl-9 pr-10"}`}
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className={`absolute top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ${
                      isRtl ? "left-3" : "right-3"
                    }`}
                    tabIndex={-1}
                  >
                    {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-xs text-rose-500 mt-1">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm New Password */}
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
                    type={showNew ? "text" : "password"}
                    {...register("confirmPassword")}
                    placeholder={t.auth.confirmPasswordPlaceholder}
                    className={`h-11 ${isRtl ? "pr-9 pl-10" : "pl-9 pr-10"}`}
                    dir="ltr"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-rose-500 mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Actions */}
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
                  className="bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl gap-2 shadow-md shadow-sky-600/20"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>{isRtl ? "جاري الحفظ..." : "Saving..."}</span>
                    </>
                  ) : (
                    <span>{isRtl ? "تحديث كلمة المرور" : "Update Password"}</span>
                  )}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

