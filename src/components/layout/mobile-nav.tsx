"use client";

import { useEffect } from "react";
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
  X,
  Users,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/providers/auth-provider";

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileNav({ isOpen, onClose }: MobileNavProps) {
  const pathname = usePathname();
  const { t, direction } = useI18n();
  const { user: currentUser } = useAuth();

  // Close when pathname changes
  useEffect(() => {
    onClose();
  }, [pathname]);

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

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm lg:hidden"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: direction === "rtl" ? "100%" : "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: direction === "rtl" ? "100%" : "-100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 250 }}
            className={cn(
              "fixed inset-y-0 z-50 w-72 max-w-[85vw] bg-white dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col lg:hidden",
              direction === "rtl" ? "right-0 border-l border-r-0" : "left-0"
            )}
          >
            {/* Header */}
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-lg bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-md">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="flex flex-col">
                  <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-sky-700 to-cyan-600 dark:from-sky-400 dark:to-cyan-300 bg-clip-text text-transparent">
                    {t.common.brand}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    {t.common.subBrand}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Links */}
            <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
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
                    className={cn(
                      "flex items-center gap-3 px-3.5 py-3 rounded-xl font-medium transition-all",
                      isActive
                        ? "bg-sky-500/10 text-sky-700 dark:text-sky-300 border border-sky-500/20 font-semibold shadow-sm"
                        : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900"
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5 shrink-0",
                        isActive
                          ? "text-sky-600 dark:text-sky-400"
                          : "text-slate-500 dark:text-slate-400"
                      )}
                    />
                    <span className="text-sm">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

