"use client";

import React, { useState, useEffect, useMemo, useTransition } from "react";
import Link from "next/link";
import { PageTransition } from "@/components/motion/page-transition";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMaterialInVouchers } from "@/server/actions/material-in";
import { formatDate } from "@/lib/utils";
import {
  Plus,
  ArrowDownToLine,
  FileText,
  Eye,
  Printer,
  RefreshCw,
  Search,
  X,
  Filter,
  Building,
  Loader2,
  Calendar,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { VoucherDetailModal } from "@/components/modals/voucher-detail-modal";
import { PrintVoucherModal } from "@/components/modals/print-voucher-modal";

export default function MaterialInListPage() {
  const { t, direction } = useI18n();
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState<any | null>(null);
  const [printingVoucher, setPrintingVoucher] = useState<any | null>(null);

  // Live search and filter states
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [supplierFilter, setSupplierFilter] = useState<string>("ALL");
  const [isSearching, startTransition] = useTransition();

  const loadData = () => {
    setLoading(true);
    getMaterialInVouchers().then((res) => {
      if (res.success && res.data) {
        setVouchers(res.data);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  // Debounce search query (200ms) for ultra-fast instant live search
  useEffect(() => {
    const timer = setTimeout(() => {
      startTransition(() => {
        setDebouncedQuery(query);
      });
    }, 200);
    return () => clearTimeout(timer);
  }, [query]);

  // Extract unique supplier names for the filter dropdown
  const uniqueSuppliers = useMemo(() => {
    const set = new Set<string>();
    vouchers.forEach((v) => {
      if (v.supplierName?.trim()) {
        set.add(v.supplierName.trim());
      }
    });
    return Array.from(set).sort();
  }, [vouchers]);

  // Instant filtering across all voucher fields AND contained line items
  const filteredVouchers = useMemo(() => {
    const q = debouncedQuery.toLowerCase().trim();

    return vouchers.filter((v) => {
      // 1. Status filter
      if (statusFilter !== "ALL" && v.status !== statusFilter) {
        return false;
      }

      // 2. Supplier filter
      if (supplierFilter !== "ALL" && v.supplierName !== supplierFilter) {
        return false;
      }

      // 3. Search query matching
      if (!q) return true;

      // Match Voucher Header fields
      const matchVoucherNo = v.voucherNo?.toLowerCase().includes(q);
      const matchSupplier = v.supplierName?.toLowerCase().includes(q);
      const matchPo = v.poNumber?.toLowerCase().includes(q);
      const matchDelivery = v.deliveryNote?.toLowerCase().includes(q);
      const matchReceivedBy = v.receivedBy?.toLowerCase().includes(q);
      const matchNotes = v.notes?.toLowerCase().includes(q);

      if (
        matchVoucherNo ||
        matchSupplier ||
        matchPo ||
        matchDelivery ||
        matchReceivedBy ||
        matchNotes
      ) {
        return true;
      }

      // Match ANY line item inside the voucher (SKU or Material Name)
      const matchItems = (v.items || []).some((line: any) => {
        const itemCode = line.material?.itemCode?.toLowerCase() || "";
        const name = line.material?.name?.toLowerCase() || "";
        const itemNotes = line.notes?.toLowerCase() || "";
        return itemCode.includes(q) || name.includes(q) || itemNotes.includes(q);
      });

      return matchItems;
    });
  }, [vouchers, debouncedQuery, statusFilter, supplierFilter]);

  const hasActiveFilters =
    Boolean(query) || statusFilter !== "ALL" || supplierFilter !== "ALL";

  const handleResetFilters = () => {
    setQuery("");
    setDebouncedQuery("");
    setStatusFilter("ALL");
    setSupplierFilter("ALL");
  };

  return (
    <PageTransition className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <ArrowDownToLine className="h-6 w-6" />
            </div>
            {t.vouchers.inTitle}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.vouchers.inSubtitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="gap-2 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {t.common.refresh}
          </Button>
          <Link href="/material-in/new">
            <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm cursor-pointer">
              <Plus className="h-4 w-4" />
              {t.vouchers.newMaterialIn}
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Table Card */}
      <Card>
        {/* Search & Filter Header */}
        <CardHeader className="py-4 border-b border-slate-100 dark:border-slate-800 space-y-3">
          <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-3">
            {/* Live Instant Search Input */}
            <div className="relative flex-1">
              <Search
                className={`absolute top-2.5 h-4 w-4 text-slate-400 ${
                  direction === "rtl" ? "right-3" : "left-3"
                }`}
              />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.vouchers.searchVouchersPlaceholder}
                className={direction === "rtl" ? "pr-9 pl-9 text-xs" : "pl-9 pr-9 text-xs"}
              />
              {isSearching && (
                <div
                  className={`absolute top-2.5 ${
                    direction === "rtl" ? "left-3" : "right-3"
                  }`}
                >
                  <Loader2 className="h-4 w-4 animate-spin text-emerald-600" />
                </div>
              )}
              {!isSearching && query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("");
                    setDebouncedQuery("");
                  }}
                  className={`absolute top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer ${
                    direction === "rtl" ? "left-3" : "right-3"
                  }`}
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-2">
              {/* Status Filter */}
              <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1">
                <Filter className="h-4 w-4 text-slate-400 shrink-0" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-transparent text-xs text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer py-1"
                >
                  <option value="ALL">{t.vouchers.allStatuses}</option>
                  <option value="COMPLETED">{t.vouchers.completed}</option>
                  <option value="CANCELLED">{t.vouchers.cancelled}</option>
                </select>
              </div>

              {/* Supplier Filter */}
              {uniqueSuppliers.length > 0 && (
                <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1">
                  <Building className="h-4 w-4 text-slate-400 shrink-0" />
                  <select
                    value={supplierFilter}
                    onChange={(e) => setSupplierFilter(e.target.value)}
                    className="bg-transparent text-xs text-slate-900 dark:text-slate-100 focus:outline-none cursor-pointer py-1 max-w-[150px] truncate"
                  >
                    <option value="ALL">{t.vouchers.allSuppliers}</option>
                    {uniqueSuppliers.map((sup) => (
                      <option key={sup} value={sup}>
                        {sup}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Reset Filters Button */}
              {hasActiveFilters && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-8 px-2.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5 mr-1 rtl:ml-1" />
                  {t.common.clearFilters}
                </Button>
              )}
            </div>
          </div>

          {/* Results Summary Subtitle */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-1">
            <span>
              {t.vouchers.showingResults}{" "}
              <strong className="text-slate-900 dark:text-slate-100 font-semibold font-mono">
                {filteredVouchers.length}
              </strong>{" "}
              {t.vouchers.ofTotal}{" "}
              <strong className="font-mono">{vouchers.length}</strong> {t.vouchers.inTitle}
            </span>
          </div>
        </CardHeader>

        {/* Vouchers Table */}
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3">{t.vouchers.voucherNo}</th>
                  <th className="px-6 py-3">{t.common.date}</th>
                  <th className="px-6 py-3">{t.vouchers.supplierName}</th>
                  <th className="px-6 py-3">Reference (DN / PO)</th>
                  <th className="px-6 py-3">{t.vouchers.receivedBy}</th>
                  <th className="px-6 py-3">{t.vouchers.itemsCount}</th>
                  <th className="px-6 py-3">{t.common.status}</th>
                  <th className="px-6 py-3 text-center">{t.common.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                        <span>{t.common.loading}</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredVouchers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400">
                      <FileText className="h-10 w-10 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                      <p className="text-sm font-medium">{t.common.noRecords}</p>
                      {hasActiveFilters && (
                        <Button
                          variant="link"
                          size="sm"
                          onClick={handleResetFilters}
                          className="mt-2 text-xs text-emerald-600"
                        >
                          {t.common.clearFilters}
                        </Button>
                      )}
                    </td>
                  </tr>
                ) : (
                  filteredVouchers.map((v) => {
                    const isCancelled = v.status === "CANCELLED";
                    return (
                      <tr
                        key={v.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono font-bold text-sky-700 dark:text-sky-400 whitespace-nowrap">
                          <span dir="ltr">{v.voucherNo}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {formatDate(v.date)}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                          <div className="flex items-center gap-1.5">
                            <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <span>{v.supplierName}</span>
                          </div>
                        </td>
                        <td
                          className="px-6 py-4 text-slate-500 dark:text-slate-400 font-mono text-xs whitespace-nowrap"
                          dir="ltr"
                        >
                          {v.deliveryNote ? `DN: ${v.deliveryNote}` : ""}
                          {v.poNumber ? ` (PO: ${v.poNumber})` : ""}
                          {!v.deliveryNote && !v.poNumber && "-"}
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300 whitespace-nowrap">
                          {v.receivedBy}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {v.items?.length || 0}
                          </span>{" "}
                          {t.common.items}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              isCancelled
                                ? "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300"
                                : "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                            }`}
                          >
                            {isCancelled ? t.vouchers.cancelled : t.vouchers.completed}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* The Eye Icon button with tooltip */}
                            <button
                              type="button"
                              onClick={() => setSelectedVoucher(v)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/50 transition-colors cursor-pointer"
                              title={direction === "rtl" ? "عرض تفاصيل الإذن بالكامل" : "View Complete Voucher Details"}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPrintingVoucher(v)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/50 transition-colors cursor-pointer"
                              title={t.common.print}
                            >
                              <Printer className="h-4 w-4" />
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
        </CardContent>
      </Card>

      {/* Complete Voucher Detail Modal */}
      {selectedVoucher && (
        <VoucherDetailModal
          voucher={selectedVoucher}
          type="in"
          isOpen={!!selectedVoucher}
          onClose={() => setSelectedVoucher(null)}
          onPrint={(v) => {
            setSelectedVoucher(null);
            setPrintingVoucher(v);
          }}
          onSuccess={loadData}
        />
      )}

      {/* Print View Modal */}
      {printingVoucher && (
        <PrintVoucherModal
          voucher={printingVoucher}
          type="in"
          isOpen={!!printingVoucher}
          onClose={() => setPrintingVoucher(null)}
        />
      )}
    </PageTransition>
  );
}
