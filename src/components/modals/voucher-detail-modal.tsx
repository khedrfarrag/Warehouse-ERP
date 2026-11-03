"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X,
  Printer,
  Ban,
  Calendar,
  Building,
  MapPin,
  FileText,
  User,
  Boxes,
  Loader2,
  AlertCircle,
  Copy,
  Check,
  Tag,
  DollarSign,
  Package,
  Clock,
  HardHat,
  Hash,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { toast } from "sonner";
import { formatDate, formatDateTime, formatNumber } from "@/lib/utils";
import { cancelMaterialInVoucher } from "@/server/actions/material-in";
import { cancelMaterialOutVoucher } from "@/server/actions/material-out";

interface VoucherDetailModalProps {
  voucher: any | null;
  type: "in" | "out";
  isOpen: boolean;
  onClose: () => void;
  onPrint?: (voucher: any) => void;
  onSuccess?: () => void;
}

export function VoucherDetailModal({
  voucher,
  type,
  isOpen,
  onClose,
  onPrint,
  onSuccess,
}: VoucherDetailModalProps) {
  const { t, direction } = useI18n();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!isOpen || !voucher) return null;

  const isCancelled = voucher.status === "CANCELLED";

  const handleCopyVoucherNo = () => {
    if (voucher?.voucherNo) {
      navigator.clipboard.writeText(voucher.voucherNo);
      setCopied(true);
      toast.success(direction === "rtl" ? "تم نسخ رقم الإذن" : "Voucher number copied");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCancelVoucher = async () => {
    setCancelling(true);
    try {
      const res =
        type === "in"
          ? await cancelMaterialInVoucher(voucher.id, cancelReason)
          : await cancelMaterialOutVoucher(voucher.id, cancelReason);

      if (res.success) {
        toast.success(t.vouchers.cancelSuccess);
        setShowCancelConfirm(false);
        onClose();
        if (onSuccess) onSuccess();
      } else {
        toast.error(res.error || t.vouchers.cancelFailed);
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setCancelling(false);
    }
  };

  // Calculate totals
  const totalQuantity = (voucher.items || []).reduce(
    (sum: number, line: any) => sum + (Number(line.quantity) || 0),
    0
  );

  const totalValue = (voucher.items || []).reduce(
    (sum: number, line: any) =>
      sum + (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0),
    0
  );

  const hasPrices = (voucher.items || []).some(
    (line: any) => line.unitPrice !== null && line.unitPrice !== undefined && line.unitPrice > 0
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-10 max-h-[92vh] flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/80">
            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold tracking-wide ${
                  type === "in"
                    ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                    : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800"
                }`}
              >
                {type === "in" ? t.nav.materialIn : t.nav.materialOut}
              </span>

              <div className="flex items-center gap-2">
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white font-mono" dir="ltr">
                  {voucher.voucherNo}
                </h2>
                <button
                  type="button"
                  onClick={handleCopyVoucherNo}
                  className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                  title="Copy voucher number"
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </button>
              </div>

              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  isCancelled
                    ? "bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800"
                    : "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                }`}
              >
                {isCancelled ? t.vouchers.cancelled : t.vouchers.completed}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {onPrint && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onPrint(voucher)}
                  className="gap-1.5 h-8 px-2.5 text-xs text-slate-700 dark:text-slate-200"
                >
                  <Printer className="h-3.5 w-3.5 text-sky-600" />
                  <span className="hidden sm:inline">{t.common.print}</span>
                </Button>
              )}
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Details Body */}
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {/* Quick KPI Stat Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                  <Hash className="h-4 w-4 text-sky-600" />
                  <span className="text-xs font-medium">{t.vouchers.itemsCount}</span>
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white">
                  {voucher.items?.length || 0}{" "}
                  <span className="text-xs font-normal text-slate-500">{t.common.items}</span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                  <Package className="h-4 w-4 text-emerald-600" />
                  <span className="text-xs font-medium">{t.vouchers.totalQuantity}</span>
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white font-mono" dir="ltr">
                  {formatNumber(totalQuantity)}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                  <DollarSign className="h-4 w-4 text-amber-600" />
                  <span className="text-xs font-medium">{t.vouchers.totalValue}</span>
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-white font-mono" dir="ltr">
                  {hasPrices ? `$${formatNumber(totalValue)}` : "-"}
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800">
                <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 mb-1">
                  <Calendar className="h-4 w-4 text-indigo-600" />
                  <span className="text-xs font-medium">{t.common.date}</span>
                </div>
                <div className="text-sm font-bold text-slate-900 dark:text-white truncate">
                  {formatDate(voucher.date)}
                </div>
              </div>
            </div>

            {/* Key Voucher Information Grid */}
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                {direction === "rtl" ? "بيانات الإذن والجهات المعنية" : "Voucher & Parties Information"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                {type === "in" ? (
                  <>
                    <div>
                      <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                        <Building className="h-3.5 w-3.5 text-slate-400" />
                        {t.vouchers.supplierName}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white text-sm block">
                        {voucher.supplierName}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                        {t.vouchers.poNumber}
                      </span>
                      <span className="font-mono text-slate-900 dark:text-white text-sm block" dir="ltr">
                        {voucher.poNumber || "-"}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                        {t.vouchers.deliveryNote}
                      </span>
                      <span className="font-mono text-slate-900 dark:text-white text-sm block" dir="ltr">
                        {voucher.deliveryNote || "-"}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                        <User className="h-3.5 w-3.5 text-slate-400" />
                        {t.vouchers.receivedBy}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white text-sm block">
                        {voucher.receivedBy}
                      </span>
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                        <Building className="h-3.5 w-3.5 text-slate-400" />
                        {t.vouchers.projectName}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white text-sm block">
                        {voucher.projectName}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" />
                        {t.vouchers.siteLocation}
                      </span>
                      <span className="font-semibold text-sky-600 dark:text-sky-400 text-sm block">
                        {voucher.siteLocation || "-"}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                        <FileText className="h-3.5 w-3.5 text-slate-400" />
                        {t.vouchers.requisitionNo}
                      </span>
                      <span className="font-mono text-slate-900 dark:text-white text-sm block" dir="ltr">
                        {voucher.requisitionNo}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 flex items-center gap-1.5 mb-1">
                        <HardHat className="h-3.5 w-3.5 text-slate-400" />
                        {t.vouchers.recipient}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white text-sm block">
                        {voucher.recipient}
                      </span>
                    </div>
                  </>
                )}
              </div>

              {/* Timestamp & Notes */}
              <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-slate-400" />
                  <span>
                    {t.vouchers.createdAt}:{" "}
                    <strong className="text-slate-600 dark:text-slate-300 font-mono" dir="ltr">
                      {formatDateTime(voucher.createdAt || voucher.date)}
                    </strong>
                  </span>
                </div>
                {voucher.notes && (
                  <div className="text-slate-600 dark:text-slate-300">
                    <strong className="text-slate-700 dark:text-slate-200">{t.common.notes}:</strong> {voucher.notes}
                  </div>
                )}
              </div>
            </div>

            {/* Line items complete detail table */}
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Boxes className="h-4 w-4 text-sky-600" />
                  <span>{t.vouchers.itemsTable}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-normal">
                    {voucher.items?.length || 0}
                  </span>
                </h3>
              </div>

              <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-xs text-left rtl:text-right">
                    <thead className="bg-slate-50 dark:bg-slate-800/80 font-semibold text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800 uppercase tracking-wider text-[11px]">
                      <tr>
                        <th className="px-3 py-3 w-10 text-center">#</th>
                        <th className="px-3 py-3 text-center">{t.vouchers.photo}</th>
                        <th className="px-4 py-3">{t.materials.itemCode}</th>
                        <th className="px-4 py-3">{t.materials.name}</th>
                        <th className="px-3 py-3">{t.vouchers.category}</th>
                        <th className="px-3 py-3">{t.vouchers.storageLocation}</th>
                        <th className="px-3 py-3 text-center">{t.vouchers.currentStock}</th>
                        <th className="px-4 py-3 text-right rtl:text-left">{t.vouchers.quantity}</th>
                        {type === "in" && (
                          <>
                            <th className="px-4 py-3 text-right rtl:text-left">{t.vouchers.unitPrice}</th>
                            <th className="px-4 py-3 text-right rtl:text-left">{t.vouchers.lineTotal}</th>
                          </>
                        )}
                        <th className="px-4 py-3">{t.common.notes}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 bg-white dark:bg-slate-900">
                      {voucher.items?.map((line: any, idx: number) => {
                        const lineTotal =
                          (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0);
                        const mat = line.material;

                        return (
                          <tr
                            key={line.id}
                            className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                          >
                            <td className="px-3 py-2.5 text-center text-slate-400 font-mono">
                              {idx + 1}
                            </td>

                            {/* Item Photo Thumbnail */}
                            <td className="px-3 py-2.5 text-center">
                              <div className="h-10 w-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden mx-auto">
                                {mat?.imageUrl ? (
                                  <img
                                    src={mat.imageUrl}
                                    alt={mat.name || ""}
                                    className="h-full w-full object-contain p-0.5"
                                  />
                                ) : (
                                  <Boxes className="h-5 w-5 text-slate-300 dark:text-slate-600" />
                                )}
                              </div>
                            </td>

                            {/* SKU Code */}
                            <td className="px-4 py-2.5 font-mono font-bold text-sky-600 dark:text-sky-400 whitespace-nowrap">
                              <span dir="ltr">[{mat?.itemCode || "-"}]</span>
                            </td>

                            {/* Material Name */}
                            <td className="px-4 py-2.5 font-semibold text-slate-900 dark:text-white">
                              <div>{mat?.name || "-"}</div>
                              {mat?.description && (
                                <div className="text-[11px] text-slate-400 font-normal line-clamp-1">
                                  {mat.description}
                                </div>
                              )}
                            </td>

                            {/* Category */}
                            <td className="px-3 py-2.5 whitespace-nowrap">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                                {mat?.categoryRel?.name || mat?.category || "-"}
                              </span>
                            </td>

                            {/* Storage Location */}
                            <td className="px-3 py-2.5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                              <span className="inline-flex items-center gap-1 font-medium">
                                <MapPin className="h-3 w-3 text-slate-400" />
                                {mat?.location || "-"}
                              </span>
                            </td>

                            {/* Current Stock */}
                            <td className="px-3 py-2.5 text-center whitespace-nowrap">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold font-mono ${
                                  (mat?.currentStock || 0) <= (mat?.minStock || 0)
                                    ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                                    : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                                }`}
                                dir="ltr"
                              >
                                {mat?.currentStock ?? "-"} {mat?.unit || ""}
                              </span>
                            </td>

                            {/* Quantity */}
                            <td
                              className="px-4 py-2.5 text-right rtl:text-left font-mono font-bold text-sm text-slate-900 dark:text-white whitespace-nowrap"
                              dir="ltr"
                            >
                              {formatNumber(line.quantity)} {mat?.unit || ""}
                            </td>

                            {/* Unit Price & Total (For Material In) */}
                            {type === "in" && (
                              <>
                                <td
                                  className="px-4 py-2.5 text-right rtl:text-left font-mono text-slate-600 dark:text-slate-300 whitespace-nowrap"
                                  dir="ltr"
                                >
                                  {line.unitPrice ? `$${formatNumber(line.unitPrice)}` : "-"}
                                </td>
                                <td
                                  className="px-4 py-2.5 text-right rtl:text-left font-mono font-bold text-slate-900 dark:text-white whitespace-nowrap"
                                  dir="ltr"
                                >
                                  {lineTotal > 0 ? `$${formatNumber(lineTotal)}` : "-"}
                                </td>
                              </>
                            )}

                            {/* Notes */}
                            <td className="px-4 py-2.5 text-slate-500 dark:text-slate-400 text-[11px] max-w-[140px] truncate">
                              {line.notes || "-"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>

                    {/* Table Totals Footer */}
                    <tfoot className="bg-slate-50 dark:bg-slate-800/80 font-bold border-t-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white">
                      <tr>
                        <td colSpan={7} className="px-4 py-3 text-end">
                          {direction === "rtl" ? "الإجمالي الكلي:" : "GRAND TOTAL:"}
                        </td>
                        <td className="px-4 py-3 text-right rtl:text-left font-mono text-sm" dir="ltr">
                          {formatNumber(totalQuantity)}
                        </td>
                        {type === "in" && (
                          <>
                            <td className="px-4 py-3"></td>
                            <td className="px-4 py-3 text-right rtl:text-left font-mono text-sm text-emerald-600 dark:text-emerald-400" dir="ltr">
                              {totalValue > 0 ? `$${formatNumber(totalValue)}` : "-"}
                            </td>
                          </>
                        )}
                        <td className="px-4 py-3"></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/60">
            <div>
              {!isCancelled && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCancelConfirm(true)}
                  className="gap-2 text-rose-600 border-rose-200 hover:bg-rose-50 dark:hover:bg-rose-950/50 cursor-pointer"
                >
                  <Ban className="h-4 w-4" />
                  {t.vouchers.cancelVoucherTitle}
                </Button>
              )}
            </div>

            <div className="flex items-center gap-2">
              {onPrint && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onPrint(voucher)}
                  className="gap-2 cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  {t.common.print}
                </Button>
              )}
              <Button variant="default" size="sm" onClick={onClose} className="cursor-pointer">
                {t.common.close}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Cancellation Confirmation Sub-dialog */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60">
                <AlertCircle className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {t.vouchers.cancelVoucherTitle}
              </h3>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {t.vouchers.cancelVoucherDesc}
            </p>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {direction === "rtl" ? "سبب الإلغاء (اختياري):" : "Reason for cancellation (optional):"}
              </label>
              <input
                type="text"
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder={direction === "rtl" ? "مثال: خطأ في العد، رفض الشحنة من المهندس" : "e.g. Returned by contractor, mistake in count"}
                className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 text-xs bg-white dark:bg-slate-950 focus:outline-none"
              />
            </div>
            <div className="flex items-center justify-end gap-2.5 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCancelConfirm(false)}
                disabled={cancelling}
              >
                {t.common.cancel}
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleCancelVoucher}
                disabled={cancelling}
                className="gap-2 bg-rose-600 hover:bg-rose-700 text-white cursor-pointer"
              >
                {cancelling && <Loader2 className="h-4 w-4 animate-spin" />}
                {t.vouchers.cancelConfirmButton}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
}
