"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PageTransition } from "@/components/motion/page-transition";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getMaterialOutVouchers } from "@/server/actions/material-out";
import { formatDate } from "@/lib/utils";
import {
  Plus,
  ArrowUpFromLine,
  FileText,
  MapPin,
  Eye,
  Printer,
  RefreshCw,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { VoucherDetailModal } from "@/components/modals/voucher-detail-modal";
import { PrintVoucherModal } from "@/components/modals/print-voucher-modal";

export default function MaterialOutListPage() {
  const { t, direction } = useI18n();
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVoucher, setSelectedVoucher] = useState<any | null>(null);
  const [printingVoucher, setPrintingVoucher] = useState<any | null>(null);

  const loadData = () => {
    setLoading(true);
    getMaterialOutVouchers().then((res) => {
      if (res.success && res.data) {
        setVouchers(res.data);
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <PageTransition className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
              <ArrowUpFromLine className="h-6 w-6" />
            </div>
            {t.vouchers.outTitle}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {t.vouchers.outSubtitle}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            {t.common.refresh}
          </Button>
          <Link href="/material-out/new">
            <Button className="gap-2 bg-amber-600 hover:bg-amber-700 text-white shadow-sm">
              <Plus className="h-4 w-4" />
              {t.vouchers.newMaterialOut}
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="py-4 border-b border-slate-100 dark:border-slate-800">
          <CardTitle className="text-base text-slate-800 dark:text-slate-200">
            {t.vouchers.outTitle} ({vouchers.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right text-sm text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-900/60 text-xs uppercase font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="px-6 py-3">{t.vouchers.voucherNo}</th>
                  <th className="px-6 py-3">{t.common.date}</th>
                  <th className="px-6 py-3">{t.vouchers.projectName}</th>
                  <th className="px-6 py-3">{t.vouchers.siteLocation}</th>
                  <th className="px-6 py-3">{t.vouchers.requisitionNo}</th>
                  <th className="px-6 py-3">{t.vouchers.recipient}</th>
                  <th className="px-6 py-3">{t.vouchers.itemsCount}</th>
                  <th className="px-6 py-3">{t.common.status}</th>
                  <th className="px-6 py-3 text-center">{t.common.actions}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {loading ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      {t.common.loading}
                    </td>
                  </tr>
                ) : vouchers.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="py-12 text-center text-slate-400">
                      <FileText className="h-10 w-10 mx-auto mb-2 text-slate-300" />
                      <p>{t.common.noRecords}</p>
                    </td>
                  </tr>
                ) : (
                  vouchers.map((v) => {
                    const isCancelled = v.status === "CANCELLED";
                    return (
                      <tr
                        key={v.id}
                        className="hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
                      >
                        <td className="px-6 py-4 font-mono font-bold text-amber-700 dark:text-amber-400">
                          <span dir="ltr">{v.voucherNo}</span>
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                          {formatDate(v.date)}
                        </td>
                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">
                          {v.projectName}
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                          <span className="inline-flex items-center gap-1 font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded text-xs">
                            <MapPin className="h-3 w-3 text-amber-500" />
                            {v.siteLocation || "Site General"}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-mono text-xs text-slate-500 dark:text-slate-400" dir="ltr">
                          {v.requisitionNo}
                        </td>
                        <td className="px-6 py-4 text-slate-700 dark:text-slate-300">
                          {v.recipient}
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-semibold text-slate-800 dark:text-slate-200">
                            {v.items?.length || 0}
                          </span>{" "}
                          {t.common.items}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              isCancelled
                                ? "bg-rose-100 dark:bg-rose-950 text-rose-800 dark:text-rose-300"
                                : "bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300"
                            }`}
                          >
                            {isCancelled ? t.vouchers.cancelled : t.vouchers.completed}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => setSelectedVoucher(v)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/50 transition-colors"
                              title={t.common.view}
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => setPrintingVoucher(v)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50 transition-colors"
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

      {/* Voucher Detail Modal */}
      {selectedVoucher && (
        <VoucherDetailModal
          voucher={selectedVoucher}
          type="out"
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
          type="out"
          isOpen={!!printingVoucher}
          onClose={() => setPrintingVoucher(null)}
        />
      )}
    </PageTransition>
  );
}
