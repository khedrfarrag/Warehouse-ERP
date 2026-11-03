"use client";

import React, { useState, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, ChevronLeft, ChevronRight, Check, Boxes, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StockBadge } from "@/components/ui/stock-badge";
import { getMaterials } from "@/server/actions/materials";
import { getCategories } from "@/server/actions/categories";
import { useI18n } from "@/lib/i18n";

export interface SelectedMaterial {
  id: string;
  itemCode: string;
  name: string;
  category: string;
  unit: string;
  currentStock: number;
  location: string;
  imageUrl?: string | null;
}

interface MaterialSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (material: SelectedMaterial) => void;
  selectedId?: string;
}

export function MaterialSelectorModal({
  isOpen,
  onClose,
  onSelect,
  selectedId,
}: MaterialSelectorModalProps) {
  const { t, direction } = useI18n();
  const [materials, setMaterials] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [categoryId, setCategoryId] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [isPending, startTransition] = useTransition();

  const fetchMaterials = (targetPage = 1) => {
    startTransition(async () => {
      const res = await getMaterials({
        query,
        categoryId: categoryId === "ALL" ? undefined : categoryId,
        page: targetPage,
        limit: 20, // Strict limit: 20 items per page
      });

      if (res.success && res.data) {
        setMaterials(res.data);
        if (res.pagination) {
          setPage(res.pagination.page);
          setTotalPages(res.pagination.totalPages);
          setTotalCount(res.pagination.total);
        }
      }
    });
  };

  useEffect(() => {
    if (isOpen) {
      getCategories().then((res) => {
        if (res.success && res.data) setCategories(res.data);
      });
      fetchMaterials(1);
    }
  }, [isOpen, categoryId]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMaterials(1);
  };

  const handleSelectMaterial = (material: any) => {
    onSelect(material);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.2 }}
            className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 z-10 overflow-hidden flex flex-col max-h-[88vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-sky-100 dark:bg-sky-950 text-sky-600 dark:text-sky-400">
                  <Boxes className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    {t.materials.catalogTitle} (20 {t.common.rowsPerPage})
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {totalCount} {t.common.items}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Bar */}
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
              <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search
                    className={`absolute top-2.5 h-4 w-4 text-slate-400 ${
                      direction === "rtl" ? "right-3" : "left-3"
                    }`}
                  />
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={t.common.search}
                    className={`h-9 text-xs ${direction === "rtl" ? "pr-9" : "pl-9"}`}
                  />
                </div>

                <select
                  value={categoryId}
                  onChange={(e) => {
                    setCategoryId(e.target.value);
                  }}
                  className="h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 text-xs text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
                >
                  <option value="ALL">{t.common.all}</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      [{c.code}] {c.name}
                    </option>
                  ))}
                </select>

                <Button type="submit" size="sm" variant="secondary" className="gap-1.5 h-9">
                  <Search className="h-3.5 w-3.5" />
                  {t.common.search}
                </Button>
              </form>
            </div>

            {/* Material List Table */}
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left rtl:text-right text-xs text-slate-600 dark:text-slate-300">
                <thead className="bg-slate-50 dark:bg-slate-900/60 sticky top-0 uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="px-4 py-2.5 w-12">{t.materials.photo}</th>
                    <th className="px-4 py-2.5">{t.materials.itemCode}</th>
                    <th className="px-4 py-2.5">{t.materials.name}</th>
                    <th className="px-4 py-2.5">{t.materials.category}</th>
                    <th className="px-4 py-2.5">{t.materials.location}</th>
                    <th className="px-4 py-2.5 text-right rtl:text-left">{t.materials.currentStock}</th>
                    <th className="px-4 py-2.5 text-center w-20">{t.common.select}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {isPending ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        {t.common.loading}
                      </td>
                    </tr>
                  ) : materials.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Boxes className="h-8 w-8 mx-auto mb-2 text-slate-300" />
                        <p>{t.common.noRecords}</p>
                      </td>
                    </tr>
                  ) : (
                    materials.map((m) => {
                      const isSelected = selectedId === m.id;
                      return (
                        <tr
                          key={m.id}
                          onClick={() => handleSelectMaterial(m)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-sky-50 dark:bg-sky-950/40"
                              : "hover:bg-slate-50/80 dark:hover:bg-slate-900/40"
                          }`}
                        >
                          <td className="px-4 py-2">
                            {m.imageUrl ? (
                              <div className="h-8 w-8 rounded overflow-hidden border border-slate-200 dark:border-slate-700">
                                <img
                                  src={m.imageUrl}
                                  alt={m.name}
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            ) : (
                              <div className="h-8 w-8 rounded bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                                <ImageIcon className="h-4 w-4" />
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-2 font-mono font-bold text-sky-700 dark:text-sky-400">
                            <span dir="ltr">{m.itemCode}</span>
                          </td>
                          <td className="px-4 py-2 font-medium text-slate-900 dark:text-white">
                            {m.name}
                          </td>
                          <td className="px-4 py-2">
                            <span className="px-2 py-0.5 rounded text-[11px] bg-slate-100 dark:bg-slate-800">
                              {m.category}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-slate-500 dark:text-slate-400">
                            {m.location}
                          </td>
                          <td className="px-4 py-2 text-right rtl:text-left">
                            <StockBadge
                              currentStock={m.currentStock}
                              minStock={m.minStock}
                              unit={m.unit}
                            />
                          </td>
                          <td className="px-4 py-2 text-center">
                            <Button
                              type="button"
                              size="sm"
                              variant={isSelected ? "default" : "outline"}
                              className="h-7 text-xs px-2.5"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleSelectMaterial(m);
                              }}
                            >
                              {isSelected ? (
                                <Check className="h-3 w-3" />
                              ) : (
                                t.common.select
                              )}
                            </Button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                {t.common.page} {page} {t.common.of} {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchMaterials(page - 1)}
                  disabled={page <= 1 || isPending}
                  className="h-7 px-2"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => fetchMaterials(page + 1)}
                  disabled={page >= totalPages || isPending}
                  className="h-7 px-2"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
