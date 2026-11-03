"use client";

import React, { useState, useEffect } from "react";
import { PageTransition } from "@/components/motion/page-transition";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { UomModal } from "@/components/forms/uom-form";
import { UomEditModal } from "@/components/modals/uom-edit-modal";
import { getUnitsOfMeasure, deleteUnitOfMeasure } from "@/server/actions/units";
import { Scale, Trash2, Edit, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useI18n } from "@/lib/i18n";

export default function UnitsPage() {
  const { t } = useI18n();
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUom, setEditingUom] = useState<any | null>(null);
  const [deletingUom, setDeletingUom] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const loadData = () => {
    getUnitsOfMeasure().then((res) => {
      if (res.success && res.data) {
        setUnits(res.data);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteConfirm = async () => {
    if (!deletingUom) return;
    setIsDeleting(true);
    try {
      const res = await deleteUnitOfMeasure(deletingUom.id);
      if (res.success) {
        toast.success(t.units.deleteSuccess);
        setDeletingUom(null);
        loadData();
      } else {
        toast.error(res.error || t.units.deleteBlockedDesc);
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
              <Scale className="h-6 w-6" />
            </div>
            {t.units.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.units.subtitle}
          </p>
        </div>
        <UomModal onSuccess={loadData} />
      </div>

      <Card>
        <CardHeader className="py-4 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base text-slate-800 dark:text-slate-200">
            {t.units.title} ({units.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3">{t.units.code}</th>
                  <th className="px-6 py-3">{t.units.abbreviation}</th>
                  <th className="px-6 py-3">{t.units.unitName}</th>
                  <th className="px-6 py-3">{t.units.description}</th>
                  <th className="px-6 py-3 text-center">{t.units.assignedMaterials}</th>
                  <th className="px-6 py-3 text-center">{t.common.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      {t.common.loading}
                    </td>
                  </tr>
                ) : units.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-400">
                      {t.common.noRecords}
                    </td>
                  </tr>
                ) : (
                  units.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40">
                      <td className="px-6 py-4 font-mono font-bold text-sky-600 dark:text-sky-400">
                        <span dir="ltr">[{u.code}]</span>
                      </td>
                      <td className="px-6 py-4 font-mono font-bold text-slate-900 dark:text-white">
                        <span dir="ltr">{u.abbreviation}</span>
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                        {u.name}
                      </td>
                      <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                        {u.description || "—"}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          {u._count?.materials || 0}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => setEditingUom(u)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/50 transition-colors"
                            title={t.common.edit}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingUom(u)}
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

      {/* Edit UOM Modal */}
      {editingUom && (
        <UomEditModal
          uom={editingUom}
          isOpen={!!editingUom}
          onClose={() => setEditingUom(null)}
          onSuccess={loadData}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingUom && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.units.deleteConfirmTitle}
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t.units.deleteConfirmDesc}
            </p>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
              <p className="font-semibold text-slate-900 dark:text-white">
                {deletingUom.name} ({deletingUom.abbreviation})
              </p>
              <p className="text-slate-500">
                {t.units.assignedMaterials}: {deletingUom._count?.materials || 0}
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                onClick={() => setDeletingUom(null)}
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
