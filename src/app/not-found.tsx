"use client";

import React from "react";
import Link from "next/link";
import { Building2, Home, AlertCircle, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-center">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800/60 mb-5">
          <AlertCircle className="h-8 w-8" />
        </div>

        <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          404
        </h1>
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-200 mb-2">
          Page Not Found / الصفحة غير موجودة
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          The warehouse page or document you requested does not exist or has been relocated.
          <br />
          الصفحة أو السند المطلوب غير موجود في النظام أو تم نقله.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link href="/" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white rounded-xl gap-2 font-semibold shadow-md shadow-sky-600/20">
              <Home className="h-4 w-4" />
              <span>Return to Dashboard / لوحة التحكم</span>
            </Button>
          </Link>
        </div>
      </div>

      <div className="text-center text-[11px] text-slate-400 mt-8">
        Sinoma CDI Contracting • Inventory & Warehouse Logistics ERP
      </div>
    </div>
  );
}

