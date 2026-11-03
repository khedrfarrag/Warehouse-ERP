"use client";

import React from "react";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { formatNumber } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 20, 50, 100],
  className = "",
}: PaginationProps) {
  const { t, isRtl } = useI18n();

  if (totalItems <= 0) return null;

  const startItem = Math.min((currentPage - 1) * pageSize + 1, totalItems);
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with smart ellipsis
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 4) {
        pages.push(1, 2, 3, 4, 5, "...", totalPages);
      } else if (currentPage >= totalPages - 3) {
        pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages);
      }
    }
    return pages;
  };

  const pages = getPageNumbers();

  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;
  const FirstIcon = isRtl ? ChevronsRight : ChevronsLeft;
  const LastIcon = isRtl ? ChevronsLeft : ChevronsRight;

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-2 select-none ${className}`}
    >
      {/* Range and count info */}
      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        <span>
          {t.common.showing}{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-200" dir="ltr">
            {formatNumber(startItem)}
          </span>{" "}
          {t.common.to}{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-200" dir="ltr">
            {formatNumber(endItem)}
          </span>{" "}
          {t.common.of}{" "}
          <span className="font-semibold text-slate-800 dark:text-slate-200" dir="ltr">
            {formatNumber(totalItems)}
          </span>{" "}
          {t.common.items}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-1.5 ms-2 ps-3 border-s border-slate-200 dark:border-slate-800">
            <span className="text-[11px]">{t.common.rowsPerPage}:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-7 px-2 py-0 text-xs rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-sky-500 cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Page navigation controls */}
      <div className="flex items-center gap-1">
        {/* First Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          aria-label="First page"
          className="h-8 w-8 p-0"
        >
          <FirstIcon className="h-4 w-4" />
        </Button>

        {/* Previous */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 px-2 gap-1 text-xs"
        >
          <PrevIcon className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">{t.common.previous}</span>
        </Button>

        {/* Number buttons */}
        <div className="flex items-center gap-1 mx-1">
          {pages.map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="px-2 text-xs text-slate-400 select-none"
                >
                  ...
                </span>
              );
            }

            const pageNum = p as number;
            const isCurrent = pageNum === currentPage;

            return (
              <Button
                key={pageNum}
                variant={isCurrent ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className={`h-8 w-8 p-0 text-xs font-semibold ${
                  isCurrent
                    ? "bg-sky-600 text-white hover:bg-sky-700 shadow-sm"
                    : "text-slate-700 dark:text-slate-300"
                }`}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        {/* Next */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 px-2 gap-1 text-xs"
        >
          <span className="hidden sm:inline">{t.common.next}</span>
          <NextIcon className="h-3.5 w-3.5" />
        </Button>

        {/* Last Page */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          aria-label="Last page"
          className="h-8 w-8 p-0"
        >
          <LastIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
