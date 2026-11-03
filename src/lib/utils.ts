import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

/**
 * Consistently format numbers with en-US locale to prevent SSR/client hydration mismatches
 * on systems with Arabic or other locale regional settings.
 */
export function formatNumber(num: number | string | null | undefined): string {
  if (num === null || num === undefined) return "0";
  const n = typeof num === "string" ? parseFloat(num) : num;
  if (isNaN(n)) return "0";
  return new Intl.NumberFormat("en-US").format(n);
}
