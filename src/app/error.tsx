"use client";

import React, { useEffect } from "react";
import { AlertOctagon, RotateCcw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Sinoma ERP Global Runtime Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 text-center">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-xl">
        <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/60 mb-5">
          <AlertOctagon className="h-8 w-8" />
        </div>

        <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
          System Encountered an Error
        </h1>
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          حدث خطأ غير متوقع في معالجة العملية
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 leading-relaxed">
          {error.message || "An unexpected exception was caught by the application error boundary."}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            onClick={() => reset()}
            className="w-full sm:w-auto bg-sky-600 hover:bg-sky-700 text-white rounded-xl gap-2 font-semibold shadow-md shadow-sky-600/20"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Try Again / إعادة المحاولة</span>
          </Button>

          <Link href="/" className="w-full sm:w-auto">
            <Button
              variant="outline"
              className="w-full sm:w-auto rounded-xl gap-2"
            >
              <Home className="h-4 w-4" />
              <span>Dashboard</span>
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

