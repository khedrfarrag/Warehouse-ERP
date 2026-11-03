"use client";

import { useI18n } from "@/lib/i18n";
import { Languages } from "lucide-react";

export function LanguageToggle() {
  const { language, setLanguage } = useI18n();

  return (
    <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 border border-slate-200 dark:border-slate-700">
      <button
        type="button"
        onClick={() => setLanguage("en")}
        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
          language === "en"
            ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        }`}
        title="Switch to English"
      >
        <span>EN</span>
      </button>
      <button
        type="button"
        onClick={() => setLanguage("ar")}
        className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all flex items-center gap-1 ${
          language === "ar"
            ? "bg-white dark:bg-slate-900 text-sky-600 dark:text-sky-400 shadow-sm"
            : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
        }`}
        title="التحويل إلى العربية"
      >
        <span>عربي</span>
      </button>
    </div>
  );
}

