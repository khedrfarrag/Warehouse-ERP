"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Menu,
  Building2,
  User,
  LogOut,
  ShieldCheck,
  ChevronDown,
  Warehouse,
  HardHat,
  Eye,
  Loader2,
  KeyRound,
  Mail,
} from "lucide-react";
import { ThemeToggle } from "./theme-toggle";
import { LanguageToggle } from "./language-toggle";
import { MobileNav } from "./mobile-nav";
import { useI18n } from "@/lib/i18n";
import { useAuth } from "@/components/providers/auth-provider";
import { ChangePasswordModal } from "@/components/modals/change-password-modal";
import { ForgotPasswordModal } from "@/components/modals/forgot-password-modal";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

export function Header() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [changePasswordOpen, setChangePasswordOpen] = useState(false);
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { t, direction } = useI18n();
  const { user: currentUser, logout } = useAuth();

  // Handle outside clicks to close dropdown
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Do not render ERP Header on dedicated Auth pages
  if (pathname === "/login" || pathname === "/signup") {
    return null;
  }

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      toast.success(direction === "rtl" ? "تم تسجيل الخروج بنجاح" : "Signed out successfully");
    } catch (err: any) {
      toast.error(err.message || "Failed to log out");
      setIsLoggingOut(false);
    }
  };

  const getInitials = (name?: string) => {
    if (!name) return "SC";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const roleConfig: Record<
    string,
    { labelAr: string; labelEn: string; badgeCls: string; icon: any }
  > = {
    ADMIN: {
      labelAr: "مدير النظام",
      labelEn: "Administrator",
      badgeCls:
        "bg-purple-100 text-purple-700 dark:bg-purple-950/70 dark:text-purple-300 border-purple-200 dark:border-purple-800",
      icon: ShieldCheck,
    },
    STOREKEEPER: {
      labelAr: "أمين المستودع",
      labelEn: "Storekeeper",
      badgeCls:
        "bg-sky-100 text-sky-700 dark:bg-sky-950/70 dark:text-sky-300 border-sky-200 dark:border-sky-800",
      icon: Warehouse,
    },
    SITE_ENGINEER: {
      labelAr: "مهندس موقع",
      labelEn: "Site Engineer",
      badgeCls:
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      icon: HardHat,
    },
    VIEWER: {
      labelAr: "قراءة فقط",
      labelEn: "Viewer",
      badgeCls:
        "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
      icon: Eye,
    },
  };

  const currentRoleInfo =
    currentUser?.role && roleConfig[currentUser.role]
      ? roleConfig[currentUser.role]
      : roleConfig.STOREKEEPER;

  const RoleIcon = currentRoleInfo.icon;

  return (
    <>
      <header className="sticky top-0 z-30 h-16 w-full border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur-md px-4 sm:px-6 flex items-center justify-between no-print transition-colors">
        <div className="flex items-center gap-3">
          {/* Mobile menu trigger */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Mobile brand fallback */}
          <Link href="/" className="flex items-center gap-2 lg:hidden">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-sky-600 to-cyan-500 flex items-center justify-center text-white shadow-sm">
              <Building2 className="h-4 w-4" />
            </div>
            <span className="font-extrabold text-sm bg-gradient-to-r from-sky-700 to-cyan-600 dark:from-sky-400 dark:to-cyan-300 bg-clip-text text-transparent">
              {t.common.brand}
            </span>
          </Link>
        </div>

        {/* Right side controls: Language switcher + Theme toggle + User Profile Menu */}
        <div className="flex items-center gap-3">
          <LanguageToggle />
          <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800" />
          <ThemeToggle />
          <div className="h-5 w-[1px] bg-slate-200 dark:bg-slate-800" />

          {/* User Profile Pill & Dropdown */}
          {currentUser ? (
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2.5 p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900 transition-all focus:outline-none"
              >
                {/* Avatar circle */}
                <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-sky-600 to-cyan-600 text-white font-bold text-xs flex items-center justify-center shadow-sm shrink-0">
                  {getInitials(currentUser.name)}
                </div>

                {/* Name & Role (hidden on small mobile) */}
                <div className="hidden sm:flex flex-col text-start leading-tight">
                  <span className="text-xs font-semibold text-slate-900 dark:text-slate-100 max-w-[120px] truncate">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
                    {direction === "rtl" ? currentRoleInfo.labelAr : currentRoleInfo.labelEn}
                  </span>
                </div>

                <ChevronDown
                  className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${
                    dropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              <AnimatePresence>
                {dropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute top-full mt-2 w-64 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 ${
                      direction === "rtl" ? "left-0" : "right-0"
                    }`}
                  >
                    {/* Header info */}
                    <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-xl mb-2">
                      <div className="flex items-center gap-2 mb-1.5">
                        <div className="h-7 w-7 rounded-lg bg-sky-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                          {getInitials(currentUser.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                            {currentUser.name}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                            {currentUser.email}
                          </p>
                        </div>
                      </div>

                      <div
                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold border ${currentRoleInfo.badgeCls}`}
                      >
                        <RoleIcon className="h-3 w-3" />
                        <span>
                          {direction === "rtl"
                            ? currentRoleInfo.labelAr
                            : currentRoleInfo.labelEn}
                        </span>
                      </div>
                    </div>

                    {/* Change Password Action */}
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        setChangePasswordOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer mb-1"
                    >
                      <KeyRound className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                      <span>{t.auth.changePassword}</span>
                    </button>

                    {/* Forgot / Reset Password Action */}
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false);
                        setForgotPasswordOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer mb-1"
                    >
                      <Mail className="h-4 w-4 text-amber-500 dark:text-amber-400" />
                      <span>
                        {direction === "rtl"
                          ? "استرجاع كلمة المرور (إرسال بالبريد)"
                          : "Forgot Password (Send via Email)"}
                      </span>
                    </button>

                    {/* Sign Out Action */}
                    <button
                      type="button"
                      disabled={isLoggingOut}
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-60 cursor-pointer"
                    >
                      {isLoggingOut ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <LogOut className="h-4 w-4" />
                      )}
                      <span>
                        {isLoggingOut
                          ? direction === "rtl"
                            ? "جارٍ الخروج..."
                            : "Signing out..."
                          : direction === "rtl"
                          ? "تسجيل الخروج"
                          : "Sign Out"}
                      </span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl bg-sky-600 hover:bg-sky-500 text-white shadow-sm transition-colors"
            >
              <User className="h-3.5 w-3.5" />
              <span>{direction === "rtl" ? "تسجيل الدخول" : "Sign In"}</span>
            </Link>
          )}
        </div>
      </header>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={changePasswordOpen}
        onClose={() => setChangePasswordOpen(false)}
      />

      {/* Forgot / Reset Password Modal */}
      <ForgotPasswordModal
        isOpen={forgotPasswordOpen}
        onClose={() => setForgotPasswordOpen(false)}
        defaultEmail={currentUser?.email || ""}
      />

      {/* Mobile Drawer */}
      <MobileNav isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  );
}
