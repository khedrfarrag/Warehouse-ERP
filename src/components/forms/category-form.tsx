"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Loader2 } from "lucide-react";
import { CategorySchema, CategoryInput } from "@/lib/schemas/category";
import { createCategory } from "@/server/actions/categories";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";

interface CategoryModalProps {
  onSuccess?: () => void;
}

export function CategoryModal({ onSuccess }: CategoryModalProps) {
  const { t } = useI18n();
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CategoryInput>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: "",
      code: "",
      description: "",
    },
  });

  const onSubmit = async (data: CategoryInput) => {
    setLoading(true);
    try {
      const res = await createCategory(data);
      if (res.success) {
        toast.success(t.categories.createSuccess);
        reset();
        setIsOpen(false);
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || "Failed to create category");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="gap-2 bg-sky-600 hover:bg-sky-700 text-white shadow-sm"
      >
        <Plus className="h-4 w-4" />
        {t.categories.newCategory}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-10 overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {t.categories.newCategory}
                </h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                    {t.categories.categoryName} *
                  </label>
                  <Input
                    {...register("name")}
                    placeholder="e.g. Electrical Cables"
                  />
                  {errors.name && (
                    <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                    {t.categories.code} (1-999) *
                  </label>
                  <Input
                    {...register("code")}
                    placeholder="e.g. 1"
                    dir="ltr"
                  />
                  {errors.code && (
                    <p className="text-xs text-rose-500 mt-1">{errors.code.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-600 dark:text-slate-300 mb-1">
                    {t.categories.description}
                  </label>
                  <textarea
                    {...register("description")}
                    rows={3}
                    placeholder={t.categories.description}
                    className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsOpen(false)}
                  >
                    {t.common.cancel}
                  </Button>
                  <Button
                    type="submit"
                    disabled={loading}
                    className="gap-2 bg-sky-600 hover:bg-sky-700 text-white"
                  >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {t.common.create}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
