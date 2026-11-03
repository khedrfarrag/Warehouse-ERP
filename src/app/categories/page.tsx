"use client";

import React, { useState, useEffect } from "react";
import { PageTransition } from "@/components/motion/page-transition";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { CategoryModal } from "@/components/forms/category-form";
import { CategoryEditModal } from "@/components/modals/category-edit-modal";
import { getCategories, deleteCategory } from "@/server/actions/categories";
import { FolderTree, Trash2, Tag, Edit, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

export default function CategoriesPage() {
  const { t } = useI18n();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState<any | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = () => {
    getCategories().then((res) => {
      if (res.success && res.data) {
        setCategories(res.data);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deletingCategory) return;
    setIsDeleting(true);
    try {
      const res = await deleteCategory(deletingCategory.id);
      if (res.success) {
        toast.success(t.categories.deleteSuccess);
        setDeletingCategory(null);
        loadData();
      } else {
        toast.error(res.error || t.categories.deleteBlockedDesc);
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <FolderTree className="h-6 w-6" />
            </div>
            {t.categories.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.categories.subtitle}
          </p>
        </div>
        <CategoryModal onSuccess={loadData} />
      </div>

      <Card>
        <CardHeader className="py-4 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base text-slate-800 dark:text-slate-200">
            {t.categories.title} ({categories.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3">{t.categories.code}</th>
                  <th className="px-6 py-3">{t.categories.categoryName}</th>
                  <th className="px-6 py-3">{t.categories.description}</th>
                  <th className="px-6 py-3 text-center">{t.categories.assignedMaterials}</th>
                  <th className="px-6 py-3 text-center">{t.common.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      {t.common.loading}
                    </td>
                  </tr>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-slate-400">
                      {t.common.noRecords}
                    </td>
                  </tr>
                ) : (
                  categories.map((c) => (
                    <tr key={c.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40">
                      <td className="px-6 py-4 font-mono font-bold text-sky-600 dark:text-sky-400">
                        <span dir="ltr">[{c.code}]</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-900 dark:text-white flex items-center gap-2">
                        <Tag className="h-4 w-4 text-slate-400" />
                        {c.name}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        {c.description || "—"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {c._count?.materials || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingCategory(c)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/50 transition-colors"
                            title={t.common.edit}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingCategory(c)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                            title={t.common.delete}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Category Modal */}
      {editingCategory && (
        <CategoryEditModal
          category={editingCategory}
          isOpen={!!editingCategory}
          onClose={() => setEditingCategory(null)}
          onSuccess={loadData}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.categories.deleteConfirmTitle}
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t.categories.deleteConfirmDesc}
            </p>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
              <p className="font-semibold text-slate-900 dark:text-white">
                {deletingCategory.name}
              </p>
              <p className="text-slate-500">
                {t.categories.assignedMaterials}: {deletingCategory._count?.materials || 0}
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                onClick={() => setDeletingCategory(null)}
                disabled={isDeleting}
              >
                {t.common.cancel}
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteConfirm}
                disabled={isDeleting}
                className="gap-2 bg-rose-600 hover:bg-rose-700 text-white"
              >
                {isDeleting && <Loader2 className="h-4 w-4 animate-spin" />}
                {t.common.delete}
              </Button>
            </div>
          </div>
        </div>
      )}
    </PageTransition>
  );
}
