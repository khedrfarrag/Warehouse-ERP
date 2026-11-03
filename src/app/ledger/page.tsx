"use client";

import React, { useState, useEffect, useTransition, useMemo } from "react";
import { PageTransition } from "@/components/motion/page-transition";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getInventoryLedger } from "@/server/actions/ledger";
import { getMaterials } from "@/server/actions/materials";
import { formatDateTime, formatNumber } from "@/lib/utils";
import {
  History,
  ArrowDownToLine,
  ArrowUpFromLine,
  Filter,
  RefreshCw,
  FileSpreadsheet,
  Sliders,
  Search,
  X,
  RotateCcw,
  Calendar,
  Layers,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { exportLedgerExcelReport } from "@/lib/export-excel";
import { toast } from "sonner";

export default function LedgerPage() {
  const { t, direction } = useI18n();
  const isRtl = direction === "rtl";

  const [entries, setEntries] = useState<any[]>([]);
  const [materials, setMaterials] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMaterial, setSelectedMaterial] = useState("ALL");
  const [transactionType, setTransactionType] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isPending, startTransition] = useTransition();

  const loadLedger = (opts?: {
    materialId?: string;
    type?: string;
    start?: string;
    end?: string;
  }) => {
    startTransition(async () => {
      const res = await getInventoryLedger({
        materialId: opts?.materialId ?? selectedMaterial,
        transactionType: opts?.type ?? transactionType,
        startDate: (opts?.start !== undefined ? opts.start : startDate) || undefined,
        endDate: (opts?.end !== undefined ? opts.end : endDate) || undefined,
      });
      if (res.success && res.data) {
        setEntries(res.data);
      }
    });
  };

  useEffect(() => {
    getMaterials({ limit: 500 }).then((res) => {
      if (res.success && res.data) {
        setMaterials(res.data);
      }
    });
  }, []);

  // Reload when primary dropdown or dates change
  useEffect(() => {
    loadLedger();
  }, [selectedMaterial, transactionType, startDate, endDate]);

  const handleClearFilters = () => {
    setSearchQuery("");
    setSelectedMaterial("ALL");
    setTransactionType("ALL");
    setStartDate("");
    setEndDate("");
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedMaterial !== "ALL" ||
    transactionType !== "ALL" ||
    startDate !== "" ||
    endDate !== "";

  // Instant real-time filtering: Keystroke-instant search (0ms latency)
  const filteredEntries = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return entries;

    return entries.filter((e) => {
      const ref = (e.voucherReference || "").toLowerCase();
      const op = (e.operator || "").toLowerCase();
      const notes = (e.notes || "").toLowerCase();
      const matName = (e.material?.name || "").toLowerCase();
      const itemCode = (e.material?.itemCode || "").toLowerCase();
      const unit = (e.material?.unit || "").toLowerCase();
      const category = (e.material?.category || "").toLowerCase();
      const location = (e.material?.location || "").toLowerCase();

      return (
        ref.includes(q) ||
        op.includes(q) ||
        notes.includes(q) ||
        matName.includes(q) ||
        itemCode.includes(q) ||
        unit.includes(q) ||
        category.includes(q) ||
        location.includes(q)
      );
    });
  }, [entries, searchQuery]);

  // Movement Statistics
  const totalMovements = entries.length;
  const inCount = entries.filter((e) => e.transactionType === "MATERIAL_IN").length;
  const outCount = entries.filter((e) => e.transactionType === "MATERIAL_OUT").length;
  const adjCount = entries.filter((e) => e.transactionType === "ADJUSTMENT").length;

  const handleExportExcel = async () => {
    const exportData = filteredEntries;
    if (exportData.length === 0) {
      toast.info(t.common.noRecords);
      return;
    }
    const filename = `sinoma_inventory_ledger_${new Date().toISOString().split("T")[0]}.xlsx`;
    try {
      await exportLedgerExcelReport(
        filename,
        exportData.map((e) => ({
          timestamp: e.timestamp,
          transactionType: e.transactionType,
          voucherReference: e.voucherReference,
          materialCode: e.material?.itemCode || "-",
          materialName: e.material?.name || "-",
          quantityDelta: e.quantityDelta,
          balanceAfter: e.balanceAfter,
          operator: e.operator,
          notes: e.notes || "",
        })),
        { isArabic: isRtl }
      );
      toast.success(t.common.success);
    } catch (err: any) {
      console.error("Ledger Excel export error:", err);
      toast.error(err.message || "Failed to generate Excel ledger");
    }
  };

  return (
    <PageTransition className="space-y-6">
      {/* Page Title & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
              <History className="h-6 w-6" />
            </div>
            {t.ledger.title}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.ledger.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportExcel}
            className="gap-2 text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 cursor-pointer"
            title="Download formatted Excel ledger (.xlsx)"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>{isRtl ? "تصدير السجل (Excel)" : "Export Ledger (Excel)"}</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadLedger()}
            disabled={isPending}
            className="gap-2 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isPending ? "animate-spin" : ""}`} />
            {t.common.refresh}
          </Button>
        </div>
      </div>

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 uppercase mb-1">
            <span>{isRtl ? "إجمالي الحركات" : "Total Movements"}</span>
            <Layers className="h-4 w-4 text-slate-400" />
          </div>
          <div className="text-xl font-black text-slate-900 dark:text-white">
            {totalMovements}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase mb-1">
            <span>{t.ledger.typeIn}</span>
            <ArrowDownToLine className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black text-emerald-600 dark:text-emerald-400">
            {inCount}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase mb-1">
            <span>{t.ledger.typeOut}</span>
            <ArrowUpFromLine className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-xl font-black text-amber-600 dark:text-amber-400">
            {outCount}
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase mb-1">
            <span>{t.ledger.typeAdjustment}</span>
            <Sliders className="h-4 w-4 text-purple-500" />
          </div>
          <div className="text-xl font-black text-purple-600 dark:text-purple-400">
            {adjCount}
          </div>
        </div>
      </div>

      <Card>
        {/* Instant Search & Multi-Filter Control Toolbar */}
        <CardHeader className="py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 space-y-3">
          {/* Row 1: Instant Search Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="relative flex-1">
              <Search
                className={`absolute top-3 h-4 w-4 text-slate-400 ${
                  isRtl ? "right-3.5" : "left-3.5"
                }`}
              />
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.ledger.searchPlaceholder}
                className={`h-11 bg-white dark:bg-slate-900 text-sm border-slate-300 dark:border-slate-700 rounded-xl shadow-xs transition-all focus-visible:ring-sky-500 ${
                  isRtl ? "pr-10 pl-10" : "pl-10 pr-10"
                }`}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className={`absolute top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer ${
                    isRtl ? "left-3" : "right-3"
                  }`}
                  title={t.ledger.clearSearch}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleClearFilters}
                className="h-11 px-3 text-xs gap-1.5 rounded-xl border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 shrink-0 cursor-pointer"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>{isRtl ? "إعادة تعيين الفلاتر" : "Reset Filters"}</span>
              </Button>
            )}
          </div>

          {/* Row 2: Secondary Dropdown & Date Filters */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end pt-1">
            {/* Filter: Material */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">
                {t.materials.name}
              </label>
              <select
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <option value="ALL">{t.ledger.allMaterials}</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    [{m.itemCode}] {m.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Filter: Transaction Type */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">
                {t.ledger.transactionType}
              </label>
              <select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                className="h-10 w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-xs text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-500"
              >
                <option value="ALL">{t.common.all}</option>
                <option value="MATERIAL_IN">{t.ledger.typeIn}</option>
                <option value="MATERIAL_OUT">{t.ledger.typeOut}</option>
                <option value="ADJUSTMENT">{t.ledger.typeAdjustment}</option>
              </select>
            </div>

            {/* Filter: From Date */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">
                {t.ledger.fromDate}
              </label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="h-10 text-xs rounded-xl"
                dir="ltr"
              />
            </div>

            {/* Filter: To Date */}
            <div>
              <label className="block text-xs font-semibold uppercase text-slate-500 dark:text-slate-400 mb-1">
                {t.ledger.toDate}
              </label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="h-10 text-xs rounded-xl"
                dir="ltr"
              />
            </div>
          </div>

          {/* Row 3: Result Summary Info */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800/80">
            <span>
              {t.ledger.showingMovements}{" "}
              <strong className="text-slate-900 dark:text-white font-mono">
                {filteredEntries.length}
              </strong>{" "}
              {t.ledger.ofMovements}{" "}
              <strong className="text-slate-700 dark:text-slate-300 font-mono">
                {totalMovements}
              </strong>{" "}
              {t.ledger.movements}
            </span>

            {searchQuery && (
              <span className="text-[11px] text-sky-600 dark:text-sky-400">
                {isRtl ? "تصفية فورية نشطة" : "Active instant search"}
              </span>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3">{t.ledger.timestamp}</th>
                  <th className="px-6 py-3">{t.ledger.transactionType}</th>
                  <th className="px-6 py-3">{t.ledger.voucherReference}</th>
                  <th className="px-6 py-3">{t.ledger.material}</th>
                  <th className="px-6 py-3 text-right rtl:text-left">{t.ledger.delta}</th>
                  <th className="px-6 py-3 text-right rtl:text-left">{t.ledger.balanceAfter}</th>
                  <th className="px-6 py-3">{t.ledger.operator}</th>
                  <th className="px-6 py-3">{t.ledger.notes}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <FileSpreadsheet className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                      <p className="font-medium text-slate-600 dark:text-slate-300">
                        {searchQuery
                          ? isRtl
                            ? `لا توجد نتائج مطابقة لبحثك: "${searchQuery}"`
                            : `No ledger records matching "${searchQuery}"`
                          : t.common.noRecords}
                      </p>
                      {hasActiveFilters && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleClearFilters}
                          className="mt-3 text-xs text-sky-600 hover:text-sky-700 underline cursor-pointer"
                        >
                          {isRtl ? "إلغاء البحث والفلاتر" : "Clear search and filters"}
                        </Button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => {
                    const isIn = entry.transactionType === "MATERIAL_IN";
                    const isAdj = entry.transactionType === "ADJUSTMENT";
                    return (
                      <tr
                        key={entry.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
                      >
                        <td className="px-6 py-4 text-xs font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap" dir="ltr">
                          {formatDateTime(entry.timestamp)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                              isIn
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                                : isAdj
                                ? "bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300"
                                : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                            }`}
                          >
                            {isIn ? (
                              <ArrowDownToLine className="h-3 w-3" />
                            ) : isAdj ? (
                              <Sliders className="h-3 w-3" />
                            ) : (
                              <ArrowUpFromLine className="h-3 w-3" />
                            )}
                            {isIn
                              ? t.ledger.typeIn
                              : isAdj
                              ? t.ledger.typeAdjustment
                              : t.ledger.typeOut}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                          <span dir="ltr">{entry.voucherReference}</span>
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                          <span className="font-mono text-xs text-sky-600 dark:text-sky-400 mr-1.5 ml-1.5" dir="ltr">
                            [{entry.material?.itemCode}]
                          </span>
                          {entry.material?.name}
                        </td>
                        <td
                          className={`px-6 py-4 text-right rtl:text-left font-mono font-bold tabular-nums whitespace-nowrap ${
                            isIn
                              ? "text-emerald-600 dark:text-emerald-400"
                              : isAdj
                              ? "text-purple-600 dark:text-purple-400"
                              : "text-amber-600 dark:text-amber-400"
                          }`}
                          dir="ltr"
                        >
                          {entry.quantityDelta > 0
                            ? `+${entry.quantityDelta}`
                            : entry.quantityDelta}{" "}
                          {entry.material?.unit}
                        </td>
                        <td className="px-6 py-4 text-right rtl:text-left font-mono font-bold text-slate-900 dark:text-white tabular-nums whitespace-nowrap" dir="ltr">
                          {formatNumber(entry.balanceAfter)} {entry.material?.unit}
                        </td>
                        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 whitespace-nowrap">
                          {entry.operator}
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 dark:text-slate-400 max-w-xs truncate" title={entry.notes || ""}>
                          {entry.notes || "—"}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageTransition>
  );
}
