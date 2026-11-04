"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  Boxes,
  ArrowDownToLine,
  ArrowUpFromLine,
  History,
  LayoutDashboard,
  FolderTree,
  Scale,
  ChevronLeft,
  ChevronRight,
  Users,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";

const SIDEBAR_STORAGE_KEY = "sinoma_sidebar_collapsed";

export function Sidebar() {
  const pathname = usePathname();
  const { t, direction } = useI18n();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const { user: currentUser } = useAuth();

  useEffect(() => {
    const saved = localStorage.getItem(SIDEBAR_STORAGE_KEY);
    if (saved !== null) {
      setIsCollapsed(saved === "true");
    }
  }, []);

  // Hide entire sidebar on dedicated authentication pages
  if (
    pathname === "/login" ||
    pathname === "/signup" ||
    pathname === "/forgot-password" ||
    pathname === "/reset-password" ||
    pathname === "/set-password"
  ) {
    return null;
  }

  const toggleCollapse = () => {
    const nextState = !isCollapsed;
    setIsCollapsed(nextState);
    localStorage.setItem(SIDEBAR_STORAGE_KEY, String(nextState));
  };

  const navItems = [
    {
      name: t.nav.dashboard,
      href: "/",
      icon: LayoutDashboard,
    },
    {
      name: t.nav.materials,
      href: "/materials",
      icon: Boxes,
    },
    {
      name: t.nav.categories,
      href: "/categories",
      icon: FolderTree,
    },
    {
      name: t.nav.units,
      href: "/units",
      icon: Scale,
    },
    {
      name: t.nav.materialIn,
      href: "/material-in",
      icon: ArrowDownToLine,
    },
    {
      name: t.nav.materialOut,
      href: "/material-out",
      icon: ArrowUpFromLine,
    },
    {
      name: t.nav.ledger,
      href: "/ledger",
      icon: History,
    },
    ...(currentUser?.role === "ADMIN"
      ? [
          {
            name: direction === "rtl" ? "إدارة المستخدمين" : "Staff Management",
            href: "/users",
            icon: Users,
          },
        ]
      : []),
  ];

  const CollapseIcon =
    direction === "rtl"
      ? isCollapsed
        ? ChevronLeft
        : ChevronRight
      : isCollapsed
      ? ChevronRight
      : ChevronLeft;

  const getInitials = (name?: string) => {
    if (!name) return "SC";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const roleLabels: Record<string, { ar: string; en: string }> = {
    ADMIN: { ar: "مدير النظام", en: "Admin" },
    STOREKEEPER: { ar: "أمين المستودع", en: "Storekeeper" },
    SITE_ENGINEER: { ar: "مهندس موقع", en: "Site Eng." },
    VIEWER: { ar: "قراءة فقط", en: "Viewer" },
  };

  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col border-r border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur transition-all duration-300 ease-in-out z-40 sticky top-0 h-screen no-print",
        isCollapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-3.5 border-b border-slate-200 dark:border-slate-800">
        <Link href="/" prefetch={true} className="flex items-center gap-2.5 overflow-hidden group">
          <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
            <Building2 className="h-5 w-5" />
          </div>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex flex-col whitespace-nowrap overflow-hidden"
            >
              <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-sky-700 to-cyan-600 dark:from-sky-400 dark:to-cyan-300 bg-clip-text text-transparent">
                {t.common.brand}
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                {t.common.subBrand}
              </span>
            </motion.div>
          )}
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-2.5 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.href}
              href={item.href}
              prefetch={true}
              title={isCollapsed ? item.name : undefined}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium transition-all group relative",
                isActive
                  ? "bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 shadow-sm"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900",
                isCollapsed && "justify-center px-0"
              )}
            >
              <Icon
                className={cn(
                  "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
                  isActive
                    ? "text-sky-600 dark:text-sky-400"
                    : "text-slate-500 dark:text-slate-400"
                )}
              />
              {!isCollapsed && (
                <span className="text-sm truncate">{item.name}</span>
              )}
              {isActive && (
                <span
                  className={cn(
                    "absolute w-1.5 h-5 bg-sky-600 dark:bg-sky-400 rounded-full",
                    direction === "rtl" ? "left-1" : "right-1"
                  )}
                />
              )}
            </Link>
          );
        })}
      </div>

      {/* Bottom Profile Pill */}
      {currentUser && (
        <div className="p-3 border-t border-slate-100 dark:border-slate-800/80">
          <div
            className={cn(
              "flex items-center gap-2.5 p-2 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800",
              isCollapsed && "justify-center p-1.5"
            )}
            title={currentUser.name}
          >
            <div className="relative">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-sky-600 to-cyan-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                {getInitials(currentUser.name)}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
            </div>

            {!isCollapsed && (
              <div className="flex flex-col min-w-0 flex-1 leading-tight">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                  {currentUser.name}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                  {direction === "rtl"
                    ? roleLabels[currentUser.role]?.ar || currentUser.role
                    : roleLabels[currentUser.role]?.en || currentUser.role}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Collapse Toggle Footer */}
      <div className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-center">
        <button
          type="button"
          onClick={toggleCollapse}
          className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 transition-colors"
          title={isCollapsed ? t.nav.expandSidebar : t.nav.collapseSidebar}
        >
          <CollapseIcon className="h-5 w-5 shrink-0" />
          {!isCollapsed && (
            <span className="text-xs font-medium">
              {t.nav.collapseSidebar}
            </span>
          )}
        </button>
      </div>
    </aside>
  );
}
