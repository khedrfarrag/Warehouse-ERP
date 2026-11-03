"use client";

import React from "react";
import { Building2, Printer, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { formatDate } from "@/lib/utils";

interface PrintVoucherModalProps {
  voucher: any | null;
  type: "in" | "out";
  isOpen: boolean;
  onClose: () => void;
}

export function PrintVoucherModal({
  voucher,
  type,
  isOpen,
  onClose,
}: PrintVoucherModalProps) {
  const { t, direction } = useI18n();

  if (!isOpen || !voucher) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      {/* Control bar above the print sheet - hidden during print */}
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl px-4 py-2 rounded-full no-print">
        <Button
          onClick={handlePrint}
          size="sm"
          className="gap-2 bg-sky-600 hover:bg-sky-700 text-white rounded-full shadow"
        >
          <Printer className="h-4 w-4" />
          <span>{t.common.print}</span>
        </Button>
        <Button
          onClick={onClose}
          variant="ghost"
          size="sm"
          className="rounded-full text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          <X className="h-4 w-4" />
          <span>{t.common.close}</span>
        </Button>
      </div>

      {/* The Printable A4 Sheet */}
      <div className="print-area w-full max-w-4xl bg-white text-black p-8 sm:p-12 rounded-2xl shadow-2xl my-8 font-sans border border-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between border-b-2 border-black pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-lg bg-sky-900 flex items-center justify-center text-white">
              <Building2 className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-slate-900">
                SINOMA CDI CONTRACTING
              </h1>
              <span className="text-xs font-semibold text-slate-600 tracking-wider uppercase block">
                Warehouse & Logistics Management System
              </span>
            </div>
          </div>

          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-black text-white text-xs font-bold uppercase rounded">
              {type === "in" ? "MATERIAL IN VOUCHER" : "MATERIAL OUT / GATE PASS"}
            </span>
            <div className="font-mono font-bold text-sm text-slate-900 mt-1" dir="ltr">
              {voucher.voucherNo}
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6">
          <h2 className="text-lg font-black uppercase tracking-wide text-slate-800">
            {type === "in"
              ? "Official Material Intake & Receiving Slip"
              : "Official Material Dispatch & Gate Pass"}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sinoma Construction Site Warehouse Division
          </p>
        </div>

        {/* Voucher Metadata Grid */}
        <div className="grid grid-cols-2 gap-4 border border-black rounded-lg p-4 mb-6 text-xs bg-slate-50/50">
          <div className="space-y-1.5">
            <div className="flex">
              <span className="w-32 font-bold text-slate-700">Date:</span>
              <span className="font-mono text-slate-900">
                {formatDate(voucher.date)}
              </span>
            </div>
            {type === "in" ? (
              <>
                <div className="flex">
                  <span className="w-32 font-bold text-slate-700">Supplier:</span>
                  <span className="font-semibold text-slate-900">{voucher.supplierName}</span>
                </div>
                <div className="flex">
                  <span className="w-32 font-bold text-slate-700">PO Number:</span>
                  <span className="font-mono text-slate-900" dir="ltr">{voucher.poNumber || "N/A"}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex">
                  <span className="w-32 font-bold text-slate-700">Project Name:</span>
                  <span className="font-semibold text-slate-900">{voucher.projectName}</span>
                </div>
                <div className="flex">
                  <span className="w-32 font-bold text-slate-700">Work Area / Site:</span>
                  <span className="font-semibold text-sky-800">{voucher.siteLocation || "Site Wide"}</span>
                </div>
              </>
            )}
          </div>

          <div className="space-y-1.5">
            <div className="flex">
              <span className="w-32 font-bold text-slate-700">Status:</span>
              <span className="font-bold uppercase text-slate-900">{voucher.status}</span>
            </div>
            {type === "in" ? (
              <>
                <div className="flex">
                  <span className="w-32 font-bold text-slate-700">Delivery Note:</span>
                  <span className="font-mono text-slate-900" dir="ltr">{voucher.deliveryNote || "N/A"}</span>
                </div>
                <div className="flex">
                  <span className="w-32 font-bold text-slate-700">Received By:</span>
                  <span className="font-semibold text-slate-900">{voucher.receivedBy}</span>
                </div>
              </>
            ) : (
              <>
                <div className="flex">
                  <span className="w-32 font-bold text-slate-700">Requisition No:</span>
                  <span className="font-mono text-slate-900" dir="ltr">{voucher.requisitionNo}</span>
                </div>
                <div className="flex">
                  <span className="w-32 font-bold text-slate-700">Site Receiver:</span>
                  <span className="font-semibold text-slate-900">{voucher.recipient}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Line Items Table */}
        <div className="border border-black rounded-lg overflow-hidden mb-6">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-200 border-b border-black font-bold uppercase text-slate-900">
              <tr>
                <th className="p-2 border-r border-black w-8 text-center">#</th>
                <th className="p-2 border-r border-black w-36">Item Code (SKU)</th>
                <th className="p-2 border-r border-black">Material Description</th>
                <th className="p-2 border-r border-black w-24 text-right">Quantity</th>
                <th className="p-2 border-r border-black w-16 text-center">Unit</th>
                <th className="p-2 w-32">Remarks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/30">
              {voucher.items?.map((line: any, idx: number) => (
                <tr key={line.id}>
                  <td className="p-2 border-r border-black text-center text-slate-500 font-mono">
                    {idx + 1}
                  </td>
                  <td className="p-2 border-r border-black font-mono font-bold text-slate-900" dir="ltr">
                    {line.material?.itemCode}
                  </td>
                  <td className="p-2 border-r border-black font-medium text-slate-900">
                    {line.material?.name}
                    {line.material?.location && (
                      <span className="text-[10px] text-slate-500 block">
                        Location: {line.material?.location}
                      </span>
                    )}
                  </td>
                  <td className="p-2 border-r border-black text-right font-mono font-bold text-slate-900" dir="ltr">
                    {line.quantity}
                  </td>
                  <td className="p-2 border-r border-black text-center font-semibold text-slate-800">
                    {line.material?.unit}
                  </td>
                  <td className="p-2 text-slate-600">
                    {line.notes || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Notes if any */}
        {voucher.notes && (
          <div className="border border-black/40 rounded-lg p-3 text-xs mb-8 bg-slate-50">
            <span className="font-bold block text-slate-700">Official Voucher Notes:</span>
            <p className="text-slate-900 mt-0.5">{voucher.notes}</p>
          </div>
        )}

        {/* 3-Tier Official Signature Blocks */}
        <div className="grid grid-cols-3 gap-6 pt-6 border-t-2 border-black text-center text-xs">
          {/* 1. Storekeeper */}
          <div className="flex flex-col items-center">
            <span className="font-bold text-slate-900 uppercase">
              {t.vouchers.storekeeperSign}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">
              (Issued / Handed Over By)
            </span>
            <div className="w-full h-16 border-b border-dashed border-black mt-4 flex items-end justify-center pb-1 font-signature text-sm italic text-slate-700">
              {type === "in" ? voucher.receivedBy : "Store Officer"}
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Signature & Date</span>
          </div>

          {/* 2. Site Engineer / Receiver */}
          <div className="flex flex-col items-center">
            <span className="font-bold text-slate-900 uppercase">
              {t.vouchers.siteEngineerSign}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">
              (Acknowledged & Received By)
            </span>
            <div className="w-full h-16 border-b border-dashed border-black mt-4 flex items-end justify-center pb-1 font-signature text-sm italic text-slate-700">
              {type === "out" ? voucher.recipient : voucher.supplierName}
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Signature & Date</span>
          </div>

          {/* 3. Security Gatekeeper */}
          <div className="flex flex-col items-center">
            <span className="font-bold text-slate-900 uppercase">
              {t.vouchers.securitySign}
            </span>
            <span className="text-[10px] text-slate-500 mt-0.5">
              (Main Site Gate Clearance)
            </span>
            <div className="w-full h-16 border-b border-dashed border-black mt-4 flex items-center justify-center text-slate-400 text-[10px]">
              [ Official Site Stamp ]
            </div>
            <span className="text-[10px] text-slate-500 mt-1">Stamp & Gate Pass Date</span>
          </div>
        </div>
      </div>
    </div>
  );
}

