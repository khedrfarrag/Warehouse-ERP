"use client";

import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { PageTransition } from "@/components/motion/page-transition";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StockBadge } from "@/components/ui/stock-badge";
import {
  Boxes,
  ArrowDownToLine,
  ArrowUpFromLine,
  AlertTriangle,
  FolderTree,
  Scale,
  History,
} from "lucide-react";

interface DashboardViewProps {
  materialsCount: number;
  categoriesCount: number;
  materialInCount: number;
  materialOutCount: number;
  lowStockMaterials: any[];
  recentLedger: any[];
}

export function DashboardView({
  materialsCount,
  categoriesCount,
  materialInCount,
  materialOutCount,
  lowStockMaterials,
  recentLedger,
}: DashboardViewProps) {
  const { t, direction } = useI18n();

  const statCards = [
    {
      title: t.dashboard.totalMaterials,
      value: materialsCount,
      description: t.materials.catalogSubtitle,
      icon: Boxes,
      color: "text-sky-600 dark:text-sky-400",
      bg: "bg-sky-50 dark:bg-sky-950/60",
      href: "/materials",
    },
    {
      title: t.categories.title,
      value: categoriesCount,
      description: t.categories.subtitle,
      icon: FolderTree,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-50 dark:bg-indigo-950/60",
      href: "/categories",
    },
    {
      title: t.vouchers.inTitle,
      value: materialInCount,
      description: t.vouchers.inSubtitle,
      icon: ArrowDownToLine,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-950/60",
      href: "/material-in",
    },
    {
      title: t.vouchers.outTitle,
      value: materialOutCount,
      description: t.vouchers.outSubtitle,
      icon: ArrowUpFromLine,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-950/60",
      href: "/material-out",
    },
  ];

  return (
    <PageTransition className="space-y-8">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-sky-900 via-sky-800 to-cyan-900 text-white shadow-xl">
        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-sky-700/60 text-sky-200 border border-sky-500/30 mb-3">
            {t.common.brand} • {t.common.subBrand}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {t.dashboard.title}
          </h1>
          <p className="text-sm text-sky-200 mt-1 max-w-xl">
            {t.dashboard.subtitle}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5">
          <Link href="/material-in/new">
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2 shadow-sm">
              <ArrowDownToLine className="h-4 w-4" />
              {t.dashboard.newMaterialIn}
            </Button>
          </Link>
          <Link href="/material-out/new">
            <Button className="bg-amber-600 hover:bg-amber-700 text-white gap-2 shadow-sm">
              <ArrowUpFromLine className="h-4 w-4" />
              {t.dashboard.newMaterialOut}
            </Button>
          </Link>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link key={stat.title} href={stat.href}>
              <Card className="hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-pointer h-full">
                <CardHeader className="flex flex-row items-center justify-between pb-2 border-none">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    {stat.title}
                  </span>
                  <div className={`p-2.5 rounded-xl ${stat.bg}`}>
                    <Icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums" dir="ltr">
                    {stat.value}
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Lower Dashboard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Items */}
        <Card className="h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-rose-500" />
              <CardTitle className="text-base text-slate-900 dark:text-white">
                {t.dashboard.lowStockAlerts} ({lowStockMaterials.length})
              </CardTitle>
            </div>
            <Link href="/materials">
              <Button variant="ghost" size="sm" className="text-xs text-sky-600 dark:text-sky-400">
                {t.common.viewAll} →
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            {lowStockMaterials.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <p className="text-sm">All materials are currently above safety thresholds.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {lowStockMaterials.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-4 hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
                  >
                    <div>
                      <span className="font-mono text-xs font-bold text-slate-800 dark:text-slate-200" dir="ltr">
                        {m.itemCode}
                      </span>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">{m.name}</p>
                      <span className="text-xs text-slate-400">
                        {t.materials.location}: {m.location}
                      </span>
                    </div>
                    <div className="text-right">
                      <StockBadge
                        currentStock={m.currentStock}
                        minStock={m.minStock}
                        unit={m.unit}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Ledger Audit Entries */}
        <Card className="h-full flex flex-col">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="flex items-center gap-2">
              <History className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              <CardTitle className="text-base text-slate-900 dark:text-white">
                {t.dashboard.recentMovements}
              </CardTitle>
            </div>
            <Link href="/ledger">
              <Button variant="ghost" size="sm" className="text-xs text-sky-600 dark:text-sky-400">
                {t.dashboard.viewLedger} →
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0 flex-1">
            {recentLedger.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <p className="text-sm">{t.common.noRecords}</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentLedger.map((l) => {
                  const isIn = l.transactionType === "MATERIAL_IN";
                  const isAdj = l.transactionType === "ADJUSTMENT";
                  return (
                    <div
                      key={l.id}
                      className="flex items-center justify-between p-4 hover:bg-slate-50/80 dark:hover:bg-slate-900/40 transition-colors"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                              isIn
                                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
                                : isAdj
                                ? "bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300"
                                : "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
                            }`}
                          >
                            {isIn
                              ? t.ledger.typeIn
                              : isAdj
                              ? t.ledger.typeAdjustment
                              : t.ledger.typeOut}
                          </span>
                          <span className="font-mono text-xs text-slate-500 dark:text-slate-400" dir="ltr">
                            {l.voucherReference}
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-900 dark:text-white mt-1">
                          {l.material?.name}
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          dir="ltr"
                          className={`font-mono text-sm font-bold tabular-nums ${
                            isIn
                              ? "text-emerald-600 dark:text-emerald-400"
                              : isAdj
                              ? "text-purple-600 dark:text-purple-400"
                              : "text-amber-600 dark:text-amber-400"
                          }`}
                        >
                          {l.quantityDelta > 0 ? `+${l.quantityDelta}` : l.quantityDelta}{" "}
                          {l.material?.unit}
                        </span>
                        <p className="text-xs text-slate-400 mt-0.5" dir="ltr">
                          Bal: {l.balanceAfter} {l.material?.unit}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
}

