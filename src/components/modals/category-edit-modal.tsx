"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { X, Loader2 } from "lucide-react";
import { CategorySchema, CategoryInput } from "@/lib/schemas/category";
import { updateCategory } from "@/server/actions/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";

interface CategoryEditModalProps {
  category: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function CategoryEditModal({
  category,
  isOpen,
  onClose,
  onSuccess,
}: CategoryEditModalProps) {
  const { t } = useI18n();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(CategorySchema),
  });

  useEffect(() => {
    if (isOpen && category) {
      reset({
        name: category.name,
        code: category.code,
        description: category.description || "",
      });
    }
  }, [isOpen, category, reset]);

  const onSubmit = async (data: CategoryInput) => {
    if (!category) return;
    setLoading(true);
    try {
      const res = await updateCategory(category.id, data);
      if (res.success) {
        toast.success(t.categories.editSuccess);
        onClose();
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || "Failed to update category");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !category) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {t.categories.editCategory}
            </h2>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.categories.categoryName} <span className="text-rose-500">*</span>
              </label>
              <Input {...register("name")} placeholder={t.categories.categoryName} />
              {errors.name && (
                <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.categories.code} (1-999) <span className="text-rose-500">*</span>
              </label>
              <Input {...register("code")} placeholder="e.g. 1" dir="ltr" />
              {errors.code && (
                <p className="text-xs text-rose-500 mt-1">{errors.code.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {t.categories.description}
              </label>
              <textarea
                {...register("description")}
                rows={3}
                placeholder={t.categories.description}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-200 dark:border-slate-800">
              <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                {t.common.cancel}
              </Button>
              <Button type="submit" disabled={loading} className="gap-2 bg-sky-600 hover:bg-sky-700 text-white">
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {t.common.save}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

