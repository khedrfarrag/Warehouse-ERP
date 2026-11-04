"use client";

import React, { useState, useEffect, useTransition } from "react";
import { PageTransition } from "@/components/motion/page-transition";
import { MaterialModal } from "@/components/forms/material-form";
import { MaterialEditModal } from "@/components/modals/material-edit-modal";
import { StockBadge } from "@/components/ui/stock-badge";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Pagination } from "@/components/ui/pagination";
import { getMaterials, deleteMaterial } from "@/server/actions/materials";
import { getCategories } from "@/server/actions/categories";
import {
  Search,
  Boxes,
  MapPin,
  Tag,
  RefreshCw,
  Image as ImageIcon,
  X,
  Edit,
  Trash2,
  Download,
  AlertCircle,
  Loader2,
  Filter,
  FileSpreadsheet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { exportToCsv, exportReorderReportToCsv } from "@/lib/export-csv";
import {
  exportProfessionalExcelReport,
  exportMaterialsCatalogExcel,
} from "@/lib/export-excel";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

export default function MaterialsPage() {
  const { t, direction } = useI18n();
  const [materials, setMaterials] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [stockStatus, setStockStatus] = useState<"ALL" | "LOW_STOCK" | "OUT_OF_STOCK" | "IN_STOCK">("ALL");
  const [maxStock, setMaxStock] = useState<string>("");
  const [debouncedMaxStock, setDebouncedMaxStock] = useState<string>("");

  const [previewPhoto, setPreviewPhoto] = useState<string | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<any | null>(null);
  const [deletingMaterial, setDeletingMaterial] = useState<any | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPending, startTransition] = useTransition();

  // Multi-Selection Map: material id -> material item
  const [selectedMaterials, setSelectedMaterials] = useState<Map<string, any>>(new Map());

  // Pagination state
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });

  // Debounce query changes (250ms) for instant as-you-type search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);
    return () => clearTimeout(handler);
  }, [query]);

  // Debounce max stock input (300ms)
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedMaxStock(maxStock);
    }, 300);
    return () => clearTimeout(handler);
  }, [maxStock]);

  // Load categories once on mount
  useEffect(() => {
    getCategories().then((res) => {
      if (res.success && res.data) {
        setCategories(res.data);
      }
    });
  }, []);

  const loadData = (
    targetPage = page,
    targetPageSize = pageSize,
    searchQuery = debouncedQuery,
    searchMaxStock = debouncedMaxStock
  ) => {
    startTransition(async () => {
      const parsedMaxStock =
        searchMaxStock.trim() !== "" && !isNaN(Number(searchMaxStock))
          ? Number(searchMaxStock)
          : undefined;

      const matRes = await getMaterials({
        query: searchQuery,
        categoryId: selectedCategory,
        stockStatus,
        maxStock: parsedMaxStock,
        page: targetPage,
        limit: targetPageSize,
      });

      if (matRes.success && matRes.data) {
        setMaterials(matRes.data);
        if (matRes.pagination) {
          setPagination(matRes.pagination);
          setPage(matRes.pagination.page);
        }
      }
    });
  };

  // Re-fetch automatically whenever debouncedQuery, debouncedMaxStock, selectedCategory, or stockStatus change!
  useEffect(() => {
    loadData(1, pageSize, debouncedQuery, debouncedMaxStock);
  }, [debouncedQuery, debouncedMaxStock, selectedCategory, stockStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedQuery(query);
    setDebouncedMaxStock(maxStock);
    loadData(1, pageSize, query, maxStock);
  };

  const handleResetFilters = () => {
    setQuery("");
    setDebouncedQuery("");
    setSelectedCategory("ALL");
    setStockStatus("ALL");
    setMaxStock("");
    setDebouncedMaxStock("");
    startTransition(async () => {
      const [matRes] = await Promise.all([
        getMaterials({ page: 1, limit: pageSize }),
      ]);
      if (matRes.success && matRes.data) {
        setMaterials(matRes.data);
        if (matRes.pagination) {
          setPagination(matRes.pagination);
          setPage(1);
        }
      }
    });
  };

  // Selection handlers
  const isAllCurrentPageSelected =
    materials.length > 0 && materials.every((m) => selectedMaterials.has(m.id));

  const handleToggleSelectAll = () => {
    const next = new Map(selectedMaterials);
    if (isAllCurrentPageSelected) {
      materials.forEach((m) => next.delete(m.id));
    } else {
      materials.forEach((m) => next.set(m.id, m));
    }
    setSelectedMaterials(next);
  };

  const handleToggleSelectRow = (item: any) => {
    const next = new Map(selectedMaterials);
    if (next.has(item.id)) {
      next.delete(item.id);
    } else {
      next.set(item.id, item);
    }
    setSelectedMaterials(next);
  };

  const handleClearSelection = () => {
    setSelectedMaterials(new Map());
  };

  // Export Reorder & Shortage Report (Professional Native Excel .xlsx)
  const handleExportSelectedToExcel = async () => {
    const selectedList = Array.from(selectedMaterials.values());
    if (selectedList.length === 0) {
      toast.info(t.common.noRecords);
      return;
    }
    const filename = `sinoma_reorder_report_${new Date().toISOString().split("T")[0]}.xlsx`;
    try {
      await exportProfessionalExcelReport(filename, selectedList, {
        isArabic: direction === "rtl",
        reportTitle: t.materials.reorderReportTitle,
        categoryFilter: categories.find((c) => c.id === selectedCategory)?.name || selectedCategory,
        stockStatusFilter: stockStatus,
        thresholdFilter: maxStock,
        searchQuery: query,
      });
      toast.success(t.common.success);
    } catch (err: any) {
      console.error("Excel export error:", err);
      toast.error(err.message || "Failed to generate Excel report");
    }
  };

  const handleExportAllFilteredToExcel = async () => {
    if (materials.length === 0) {
      toast.info(t.common.noRecords);
      return;
    }
    const filename = `sinoma_filtered_report_page_${page}_${new Date().toISOString().split("T")[0]}.xlsx`;
    try {
      await exportProfessionalExcelReport(filename, materials, {
        isArabic: direction === "rtl",
        reportTitle: t.materials.reorderReportTitle,
        categoryFilter: categories.find((c) => c.id === selectedCategory)?.name || selectedCategory,
        stockStatusFilter: stockStatus,
        thresholdFilter: maxStock,
        searchQuery: query,
      });
      toast.success(t.common.success);
    } catch (err: any) {
      console.error("Excel export error:", err);
      toast.error(err.message || "Failed to generate Excel report");
    }
  };

  // Standard Catalog Export (Professional Native Excel .xlsx)
  const handleExportCatalogExcel = async () => {
    if (materials.length === 0) {
      toast.info(t.common.noRecords);
      return;
    }
    const filename = `sinoma_materials_catalog_${new Date().toISOString().split("T")[0]}.xlsx`;
    try {
      await exportMaterialsCatalogExcel(filename, materials, {
        isArabic: direction === "rtl",
      });
      toast.success(t.common.success);
    } catch (err: any) {
      console.error("Catalog Excel export error:", err);
      toast.error(err.message || "Failed to generate Excel catalog");
    }
  };

  const handleExportCatalogCsv = () => {
    if (materials.length === 0) {
      toast.info(t.common.noRecords);
      return;
    }
    const headers = [
      t.materials.itemCode,
      t.materials.name,
      t.materials.category,
      t.materials.location,
      t.materials.currentStock,
      t.materials.minStock,
      t.materials.unit,
      t.materials.description,
    ];
    const rows = materials.map((m) => [
      m.itemCode,
      m.name,
      m.category,
      m.location,
      m.currentStock,
      m.minStock,
      m.unit,
      m.description || "",
    ]);
    exportToCsv("materials_catalog.csv", headers, rows);
    toast.success(t.common.success);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingMaterial) return;
    setIsDeleting(true);
    try {
      const res = await deleteMaterial(deletingMaterial.id);
      if (res.success) {
        toast.success(t.materials.deleteSuccess);
        if (selectedMaterials.has(deletingMaterial.id)) {
          const next = new Map(selectedMaterials);
          next.delete(deletingMaterial.id);
          setSelectedMaterials(next);
        }
        setDeletingMaterial(null);
        loadData(page, pageSize);
      } else {
        toast.error(res.error || t.materials.cannotDeleteWithHistory);
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  const hasActiveFilters =
    Boolean(query) || selectedCategory !== "ALL" || stockStatus !== "ALL" || maxStock.trim() !== "";

  return (
    <PageTransition className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            {t.materials.catalogTitle}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {t.materials.catalogSubtitle}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {selectedMaterials.size > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportSelectedToExcel}
              className="gap-2 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            >
              <FileSpreadsheet className="h-4 w-4" />
              <span>
                {t.materials.exportSelectedExcel} ({selectedMaterials.size})
              </span>
            </Button>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportAllFilteredToExcel}
              className="gap-2 text-slate-700 dark:text-slate-300"
              title={t.materials.exportFilteredExcel}
            >
              <FileSpreadsheet className="h-4 w-4" />
              {t.materials.exportFilteredExcel}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCatalogExcel}
            className="gap-2 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
            title="Download formatted Excel workbook (.xlsx)"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>{direction === "rtl" ? "تصدير الكتالوج (Excel)" : "Export Catalog (Excel)"}</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => loadData(page, pageSize)}
            disabled={isPending}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
            {t.common.refresh}
          </Button>

          <MaterialModal onSuccess={() => loadData(1, pageSize)} />
        </div>
      </div>

      {/* Main Table Card */}
      <Card>
        {/* Filter Controls Header */}
        <CardHeader className="py-4 border-b border-slate-100 dark:border-slate-800">
          <form onSubmit={handleSearchSubmit} className="space-y-3">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
              {/* Search text input with instant live search */}
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
                  className={direction === "rtl" ? "pr-9 pl-9" : "pl-9 pr-9"}
                />
                {isPending && query && (
                  <div
                    className={`absolute top-2.5 ${
                      direction === "rtl" ? "left-3" : "right-3"
                    }`}
                  >
                    <Loader2 className="h-4 w-4 animate-spin text-sky-600" />
                  </div>
                )}
                {!isPending && query && (
                  <button
                    type="button"
                    onClick={() => {
                      setQuery("");
                      setDebouncedQuery("");
                    }}
                    className={`absolute top-2.5 text-slate-400 hover:text-slate-600 ${
                      direction === "rtl" ? "left-3" : "right-3"
                    }`}
                    title="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Filters Group */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Category Filter */}
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1">
                  <Tag className="h-4 w-4 text-slate-400 shrink-0" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-transparent text-xs text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer py-1 max-w-[150px] truncate"
                  >
                    <option value="ALL">{t.common.all}</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        [{c.code}] {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Stock Health Filter */}
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1">
                  <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                  <select
                    value={stockStatus}
                    onChange={(e) => setStockStatus(e.target.value as any)}
                    className="bg-transparent text-xs text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer py-1"
                  >
                    <option value="ALL">{t.materials.filterAllStock}</option>
                    <option value="LOW_STOCK">{t.materials.filterLowStock}</option>
                    <option value="OUT_OF_STOCK">{t.materials.filterOutOfStock}</option>
                    <option value="IN_STOCK">{t.materials.filterInStock}</option>
                  </select>
                </div>

                {/* Max Stock Threshold */}
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1">
                  <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">
                    {t.materials.filterMaxStock}
                  </span>
                  <input
                    type="number"
                    min="0"
                    value={maxStock}
                    onChange={(e) => setMaxStock(e.target.value)}
                    placeholder={t.materials.filterMaxStockPlaceholder}
                    dir="ltr"
                    className="w-16 bg-transparent text-xs text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                  {maxStock && (
                    <button
                      type="button"
                      onClick={() => {
                        setMaxStock("");
                        loadData(1, pageSize);
                      }}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>

                <Button type="submit" variant="secondary" size="sm" className="text-xs">
                  {t.common.filter}
                </Button>

                {hasActiveFilters && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleResetFilters}
                    className="text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    {t.common.cancel}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </CardHeader>

        {/* Catalog Table */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-4 py-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={isAllCurrentPageSelected}
                      onChange={handleToggleSelectAll}
                      aria-label={t.materials.selectAll}
                      className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                  </th>
                  <th className="px-5 py-3">{t.materials.photo}</th>
                  <th className="px-5 py-3">{t.materials.itemCode}</th>
                  <th className="px-5 py-3">{t.materials.name}</th>
                  <th className="px-5 py-3">{t.materials.category}</th>
                  <th className="px-5 py-3">{t.materials.location}</th>
                  <th className="px-5 py-3 text-right rtl:text-left">{t.materials.currentStock}</th>
                  <th className="px-5 py-3 text-center">{t.common.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {materials.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <Boxes className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                      <p>{t.common.noRecords}</p>
                    </td>
                  </tr>
                ) : (
                  materials.map((item) => {
                    const isSelected = selectedMaterials.has(item.id);
                    return (
                      <tr
                        key={item.id}
                        className={`transition-colors ${
                          isSelected
                            ? "bg-sky-50/70 dark:bg-sky-950/25 hover:bg-sky-50 dark:hover:bg-sky-950/40"
                            : "hover:bg-slate-50/80 dark:hover:bg-slate-900/40"
                        }`}
                      >
                        {/* Checkbox column */}
                        <td
                          className="px-4 py-4 text-center"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleSelectRow(item)}
                            aria-label={`Select ${item.name}`}
                            className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                          />
                        </td>

                        {/* Photo Thumbnail - Adaptive to all dimensions without cropping or distortion */}
                        <td className="px-5 py-3">
                          {item.imageUrl ? (
                            <button
                              type="button"
                              onClick={() => setPreviewPhoto(item.imageUrl)}
                              className="h-10 w-10 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5 flex items-center justify-center hover:opacity-80 transition-opacity"
                              title="Click to view photo"
                            >
                              <img
                                src={item.imageUrl}
                                alt={item.name}
                                className="h-full w-full object-contain"
                              />
                            </button>
                          ) : (
                            <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                              <ImageIcon className="h-5 w-5" />
                            </div>
                          )}
                        </td>

                        {/* SKU */}
                        <td className="px-5 py-4 font-mono font-bold text-sky-700 dark:text-sky-400 tracking-wide">
                          <span dir="ltr">{item.itemCode}</span>
                        </td>

                        {/* Name and description */}
                        <td className="px-5 py-4 font-medium text-slate-900 dark:text-white">
                          {item.name}
                          {item.description && (
                            <span className="block text-xs text-slate-400 font-normal line-clamp-1">
                              {item.description}
                            </span>
                          )}
                        </td>

                        {/* Category & Subcategory */}
                        <td className="px-5 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                            {item.category}
                          </span>
                          {item.subCategory && (
                            <span className="block text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                              {item.subCategory}
                            </span>
                          )}
                        </td>

                        {/* Storage Location */}
                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-5">
                          <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                          <span>{item.location}</span>
                        </td>

                        {/* Current Stock Badge */}
                        <td className="px-5 py-4 text-right rtl:text-left">
                          <StockBadge
                            currentStock={item.currentStock}
                            minStock={item.minStock}
                            unit={item.unit}
                          />
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setEditingMaterial(item)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/50 transition-colors"
                              title={t.common.edit}
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeletingMaterial(item)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
                              title={t.common.delete}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Interactive Pagination */}
          <div className="border-t border-slate-100 dark:border-slate-800 px-4">
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              totalItems={pagination.total}
              pageSize={pageSize}
              onPageChange={(p) => {
                setPage(p);
                loadData(p, pageSize);
              }}
              onPageSizeChange={(s) => {
                setPageSize(s);
                loadData(1, s);
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Floating Selection Action Bar */}
      <AnimatePresence>
        {selectedMaterials.size > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            className="fixed bottom-6 inset-x-0 mx-auto w-fit z-40 max-w-xl px-4 pointer-events-none"
          >
            <div className="bg-slate-900/95 dark:bg-slate-950/95 text-white backdrop-blur-md px-5 py-3 rounded-2xl shadow-2xl border border-slate-700/60 flex flex-wrap items-center justify-between gap-4 pointer-events-auto">
              <div className="flex items-center gap-2.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-xs font-bold text-white">
                  {selectedMaterials.size}
                </span>
                <span className="text-sm font-medium text-slate-200">
                  {selectedMaterials.size} {t.materials.selectedItems}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleExportSelectedToExcel}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs font-medium cursor-pointer"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  {t.materials.exportSelectedExcel}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleClearSelection}
                  className="text-slate-300 hover:text-white hover:bg-slate-800 text-xs cursor-pointer"
                >
                  <X className="h-4 w-4" />
                  {t.materials.clearSelection}
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      {editingMaterial && (
        <MaterialEditModal
          material={editingMaterial}
          isOpen={!!editingMaterial}
          onClose={() => setEditingMaterial(null)}
          onSuccess={() => loadData(page, pageSize)}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingMaterial && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.materials.deleteConfirmTitle}
              </h3>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300">
              {t.materials.deleteConfirmDesc}
            </p>
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs space-y-1">
              <p className="font-semibold text-slate-900 dark:text-white">
                {deletingMaterial.name}
              </p>
              <p className="font-mono text-slate-500" dir="ltr">
                {deletingMaterial.itemCode}
              </p>
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                onClick={() => setDeletingMaterial(null)}
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

      {/* Enlarged Photo Dialog */}
      {previewPhoto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
          onClick={() => setPreviewPhoto(null)}
        >
          <div className="relative max-w-2xl max-h-[85vh] bg-white dark:bg-slate-900 rounded-2xl overflow-hidden p-2 shadow-2xl">
            <button
              onClick={() => setPreviewPhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/60 text-white hover:bg-slate-900"
            >
              <X className="h-5 w-5" />
            </button>
            <img
              src={previewPhoto}
              alt="Enlarged Material Preview"
              className="max-h-[80vh] w-auto object-contain rounded-xl"
            />
          </div>
        </div>
      )}
    </PageTransition>
  );
}
