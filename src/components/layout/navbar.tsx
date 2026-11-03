"use client";

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
  Scale
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

export function Navbar() {
  const pathname = usePathname();

  const navItems = [
    {
      name: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Material Catalog",
      href: "/materials",
      icon: Boxes,
    },
    {
      name: "Categories",
      href: "/categories",
      icon: FolderTree,
    },
    {
      name: "Units (UOM)",
      href: "/units",
      icon: Scale,
    },
    {
      name: "Material In",
      href: "/material-in",
      icon: ArrowDownToLine,
    },
    {
      name: "Material Out",
      href: "/material-out",
      icon: ArrowUpFromLine,
    },
    {
      name: "Inventory Ledger",
      href: "/ledger",
      icon: History,
    },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 dark:supports-[backdrop-filter]:bg-slate-950/80 transition-colors">
      <div className="max-w-7xl mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 dark:text-white group">
            <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Building2 className="h-6 w-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg leading-tight font-extrabold tracking-tight bg-gradient-to-r from-sky-700 to-cyan-600 dark:from-sky-400 dark:to-cyan-300 bg-clip-text text-transparent">
                Sinoma ERP
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Contracting Warehouse</span>
            </div>
          </Link>
        </div>

        <nav className="flex items-center gap-1 sm:gap-1.5 overflow-x-auto py-2">
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
                  "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs md:text-sm font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 shadow-sm border border-sky-200/50 dark:border-sky-800/50"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-sky-600 dark:text-sky-400" : "text-slate-500 dark:text-slate-400")} />
                <span>{item.name}</span>
              </Link>
            );
          })}
          
          <div className="ml-2 pl-2 border-l border-slate-200 dark:border-slate-800 flex items-center">
            <ThemeToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
