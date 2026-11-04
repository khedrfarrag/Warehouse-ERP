import React from "react";

export default function Loading() {
  return (
    <div className="w-full flex-1 min-h-[50vh] flex flex-col items-center justify-center p-8">
      <div className="relative flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-3 border-sky-200 dark:border-sky-950 border-t-sky-600 dark:border-t-sky-400 animate-spin" />
      </div>
      <p className="mt-3 text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase animate-pulse">
        Loading...
      </p>
    </div>
  );
}
