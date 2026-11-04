"use client";

import React, { useState, useEffect, useTransition } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { useI18n } from "@/lib/i18n";
import {
  adminGetUsers,
  adminCreateStaffUser,
  adminDeleteUser,
  adminToggleUserStatus,
  adminResetStaffPassword,
} from "@/server/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Warehouse,
  HardHat,
  Eye,
  EyeOff,
  Trash2,
  Lock,
  Mail,
  User,
  CheckCircle2,
  Clock,
  Ban,
  Loader2,
  X,
  AlertTriangle,
  RefreshCw,
  Search,
  KeyRound,
  Wand2,
} from "lucide-react";

interface SystemUserItem {
  id: string;
  name: string;
  email: string;
  role: "ADMIN" | "STOREKEEPER" | "SITE_ENGINEER" | "VIEWER";
  status: "ACTIVE" | "PENDING_ACTIVATION" | "SUSPENDED";
  createdAt: Date | string;
  updatedAt: Date | string;
  invitedBy?: string | null;
}

export default function UsersManagementPage() {
  const { user: currentUser } = useAuth();
  const { t, isRtl } = useI18n();

  const [users, setUsers] = useState<SystemUserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isToggling, setIsToggling] = useState<string | null>(null);

  // New User Form State
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<
    "STOREKEEPER" | "SITE_ENGINEER" | "VIEWER" | "ADMIN"
  >("STOREKEEPER");
  const [formSendInvite, setFormSendInvite] = useState(true);
  const [formInitialPassword, setFormInitialPassword] = useState("");
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [isSubmitting, startTransition] = useTransition();

  // Reset Password for Existing User Modal State
  const [resetPasswordModalUser, setResetPasswordModalUser] = useState<SystemUserItem | null>(null);
  const [newResetPassword, setNewResetPassword] = useState("");
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);

  const generateRandomPassword = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
    let pwd = "";
    for (let i = 0; i < 10; i++) {
      pwd += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pwd;
  };

  const handleGenerateFormPassword = () => {
    const pwd = generateRandomPassword();
    setFormInitialPassword(pwd);
    setShowFormPassword(true);
    toast.info(isRtl ? `تم توليد كلمة سر: ${pwd}` : `Generated password: ${pwd}`);
  };

  const handleGenerateResetPassword = () => {
    const pwd = generateRandomPassword();
    setNewResetPassword(pwd);
    setShowResetPassword(true);
    toast.info(isRtl ? `تم توليد كلمة سر: ${pwd}` : `Generated password: ${pwd}`);
  };

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await adminGetUsers();
      if (res.success && res.data) {
        setUsers(res.data as any);
      } else {
        toast.error(res.error || "Failed to load staff list");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load staff list");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formEmail.trim() || !formInitialPassword.trim()) {
      toast.error(
        isRtl
          ? "يرجى كتابة الاسم والبريد الإلكتروني وتعيين كلمة المرور"
          : "Please provide staff name, email, and password"
      );
      return;
    }

    if (formInitialPassword.trim().length < 6) {
      toast.error(
        isRtl
          ? "كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام"
          : "Password must be at least 6 characters"
      );
      return;
    }

    startTransition(async () => {
      const res = await adminCreateStaffUser({
        name: formName.trim(),
        email: formEmail.trim(),
        role: formRole,
        sendInvite: formSendInvite,
        initialPassword: formInitialPassword.trim(),
      });

      if (res.success) {
        toast.success(
          isRtl
            ? "تم إنشاء حساب الموظف وتفعيل كلمة المرور بنجاح"
            : "Staff member created and password activated successfully"
        );
        setIsModalOpen(false);
        setFormName("");
        setFormEmail("");
        setFormRole("STOREKEEPER");
        setFormSendInvite(true);
        setFormInitialPassword("");
        setShowFormPassword(false);
        fetchUsers();
      } else {
        toast.error(res.error || "Failed to create staff member");
      }
    });
  };

  const handleAdminResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPasswordModalUser) return;
    if (!newResetPassword.trim() || newResetPassword.trim().length < 6) {
      toast.error(
        isRtl
          ? "كلمة المرور الجديدة يجب ألا تقل عن 6 أحرف"
          : "New password must be at least 6 characters"
      );
      return;
    }

    setIsResettingPassword(true);
    try {
      const res = await adminResetStaffPassword(resetPasswordModalUser.id, newResetPassword.trim());
      if (res.success) {
        toast.success(
          isRtl
            ? `تم تغيير كلمة المرور للموظف "${resetPasswordModalUser.name}" بنجاح`
            : `Password successfully updated for ${resetPasswordModalUser.name}`
        );
        setResetPasswordModalUser(null);
        setNewResetPassword("");
        setShowResetPassword(false);
        fetchUsers();
      } else {
        toast.error(res.error || "Failed to update staff password");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update staff password");
    } finally {
      setIsResettingPassword(false);
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (
      !confirm(
        isRtl
          ? `هل أنت متأكد من حذف الحساب "${userName}" نهائياً؟`
          : `Are you sure you want to delete staff account "${userName}"?`
      )
    ) {
      return;
    }

    setIsDeleting(userId);
    try {
      const res = await adminDeleteUser(userId);
      if (res.success) {
        toast.success(t.users.deleteSuccess);
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } else {
        toast.error(res.error || "Failed to delete user");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    } finally {
      setIsDeleting(null);
    }
  };

  const handleToggleStatus = async (
    userId: string,
    currentStatus: "ACTIVE" | "PENDING_ACTIVATION" | "SUSPENDED"
  ) => {
    const newStatus = currentStatus === "ACTIVE" ? "SUSPENDED" : "ACTIVE";
    setIsToggling(userId);
    try {
      const res = await adminToggleUserStatus(userId, newStatus);
      if (res.success) {
        toast.success(t.users.statusChangeSuccess);
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, status: newStatus } : u))
        );
      } else {
        toast.error(res.error || "Failed to update status");
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setIsToggling(null);
    }
  };

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  const roleBadgeMap: Record<
    string,
    { label: string; badgeCls: string; icon: any }
  > = {
    ADMIN: {
      label: (t.auth.roles as any).ADMIN || "Administrator",
      badgeCls: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800",
      icon: ShieldCheck,
    },
    STOREKEEPER: {
      label: (t.auth.roles as any).STOREKEEPER || "Storekeeper",
      badgeCls: "bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300 border-sky-200 dark:border-sky-800",
      icon: Warehouse,
    },
    SITE_ENGINEER: {
      label: (t.auth.roles as any).SITE_ENGINEER || "Site Engineer",
      badgeCls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
      icon: HardHat,
    },
    VIEWER: {
      label: (t.auth.roles as any).VIEWER || "Auditor / Read-Only",
      badgeCls: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
      icon: Eye,
    },
  };

  const getInitials = (name?: string) => {
    if (!name) return "SC";
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  // Stats Counters
  const totalCount = users.length;
  const storekeepersCount = users.filter((u) => u.role === "STOREKEEPER").length;
  const activeCount = users.filter((u) => u.status === "ACTIVE").length;
  const pendingCount = users.filter((u) => u.status === "PENDING_ACTIVATION").length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Page Title & Main Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-sky-600/20">
              <Users className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {t.users.title}
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {t.users.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            disabled={loading}
            className="rounded-xl gap-1.5 h-10 cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span>{isRtl ? "تحديث" : "Refresh"}</span>
          </Button>

          <Button
            onClick={() => setIsModalOpen(true)}
            className="bg-sky-600 hover:bg-sky-700 text-white rounded-xl gap-2 h-10 shadow-md shadow-sky-600/20 font-semibold cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>{t.users.newUser}</span>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-slate-500 uppercase">
            {isRtl ? "إجمالي المستخدمين" : "Total Users"}
          </p>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">
            {totalCount}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-sky-600 dark:text-sky-400 uppercase">
            {isRtl ? "أمناء المستودعات" : "Storekeepers"}
          </p>
          <p className="text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">
            {storekeepersCount}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase">
            {isRtl ? "حسابات مفعّلة ونشطة" : "Active Staff"}
          </p>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {activeCount}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase">
            {isRtl ? "بانتظار التفعيل (دعوة)" : "Pending Activation"}
          </p>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {pendingCount}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-3 shadow-sm flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search
            className={`absolute top-2.5 h-4 w-4 text-slate-400 ${
              isRtl ? "right-3" : "left-3"
            }`}
          />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={
              isRtl
                ? "البحث بالاسم أو البريد الإلكتروني أو الدور..."
                : "Search by staff name, email or role..."
            }
            className={`h-9 text-xs ${isRtl ? "pr-9" : "pl-9"}`}
          />
        </div>
        <span className="text-xs text-slate-400 font-medium">
          {filteredUsers.length} {isRtl ? "موظف" : "staff members"}
        </span>
      </div>

      {/* Main Staff Data Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-start text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 font-semibold uppercase">
                <th className="px-4 py-3.5 text-start">{t.users.name}</th>
                <th className="px-4 py-3.5 text-start">{t.users.email}</th>
                <th className="px-4 py-3.5 text-start">{t.users.role}</th>
                <th className="px-4 py-3.5 text-start">{t.users.status}</th>
                <th className="px-4 py-3.5 text-start">{t.users.created}</th>
                <th className="px-4 py-3.5 text-end">{t.users.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-sky-600 mb-2" />
                    <span>{isRtl ? "جاري تحميل بيانات الموظفين..." : "Loading staff members..."}</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                    <Users className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="font-semibold text-slate-600 dark:text-slate-300">
                      {isRtl ? "لا توجد نتائج مطابقة" : "No staff members found"}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((item) => {
                  const roleConfig = roleBadgeMap[item.role] || roleBadgeMap.STOREKEEPER;
                  const RoleIcon = roleConfig.icon;
                  const isCurrent = currentUser?.userId === item.id;

                  return (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                    >
                      {/* Name & Avatar */}
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-sm">
                            {getInitials(item.name)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                              <span>{item.name}</span>
                              {isCurrent && (
                                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300">
                                  {isRtl ? "أنت" : "You"}
                                </span>
                              )}
                            </div>
                            {item.invitedBy && (
                              <p className="text-[10px] text-slate-400">
                                {isRtl ? `بواسطة: ${item.invitedBy}` : `Invited by: ${item.invitedBy}`}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="px-4 py-3.5 font-mono text-slate-600 dark:text-slate-300">
                        {item.email}
                      </td>

                      {/* Role Badge */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${roleConfig.badgeCls}`}
                        >
                          <RoleIcon className="h-3.5 w-3.5" />
                          <span>{roleConfig.label}</span>
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        {item.status === "ACTIVE" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                            <CheckCircle2 className="h-3 w-3" />
                            <span>{t.users.active}</span>
                          </span>
                        ) : item.status === "PENDING_ACTIVATION" ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            <Clock className="h-3 w-3" />
                            <span>{t.users.pendingActivation}</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                            <Ban className="h-3 w-3" />
                            <span>{t.users.suspended}</span>
                          </span>
                        )}
                      </td>

                      {/* Joined Date */}
                      <td className="px-4 py-3.5 text-slate-500 whitespace-nowrap">
                        {new Date(item.createdAt).toLocaleDateString(
                          isRtl ? "ar-EG" : "en-US",
                          {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          }
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-end">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Reset / Set Password Direct */}
                          <button
                            type="button"
                            onClick={() => {
                              setResetPasswordModalUser(item);
                              setNewResetPassword("");
                              setShowResetPassword(false);
                            }}
                            title={isRtl ? "إعادة تعيين / تغيير كلمة المرور" : "Reset / Set Password"}
                            className="p-1.5 rounded-lg border border-sky-200 dark:border-sky-800 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition-colors cursor-pointer"
                          >
                            <KeyRound className="h-3.5 w-3.5" />
                          </button>

                          {/* Toggle Active / Suspended (cannot suspend self) */}
                          {!isCurrent && (
                            <button
                              type="button"
                              disabled={isToggling === item.id}
                              onClick={() => handleToggleStatus(item.id, item.status)}
                              title={
                                item.status === "ACTIVE"
                                  ? t.users.suspendUser
                                  : t.users.activateUser
                              }
                              className={`p-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                                item.status === "ACTIVE"
                                  ? "border-amber-200 dark:border-amber-800 text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40"
                                  : "border-emerald-200 dark:border-emerald-800 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                              }`}
                            >
                              {isToggling === item.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : item.status === "ACTIVE" ? (
                                <Ban className="h-3.5 w-3.5" />
                              ) : (
                                <CheckCircle2 className="h-3.5 w-3.5" />
                              )}
                            </button>
                          )}

                          {/* Delete Account (cannot delete self) */}
                          {!isCurrent && (
                            <button
                              type="button"
                              disabled={isDeleting === item.id}
                              onClick={() => handleDeleteUser(item.id, item.name)}
                              title={t.users.deleteUser}
                              className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                            >
                              {isDeleting === item.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create New Staff Member Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 relative overflow-hidden"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className={`absolute top-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                  isRtl ? "left-5" : "right-5"
                }`}
              >
                <X className="h-5 w-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 flex items-center justify-center border border-sky-100 dark:border-sky-900">
                  <UserPlus className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {t.users.newUser}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {isRtl
                      ? "إنشاء حساب رسمي لأمين المستودع وتعيين الصلاحيات وإرسال رسالة التفعيل بالبريد الإلكتروني"
                      : "Provision warehouse storekeeper account and dispatch Resend activation email"}
                  </p>
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleCreateStaff} className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                    {t.users.name} *
                  </label>
                  <div className="relative">
                    <User
                      className={`absolute top-3 h-4 w-4 text-slate-400 ${
                        isRtl ? "right-3" : "left-3"
                      }`}
                    />
                    <Input
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder={isRtl ? "مثال: م. محمود السيد" : "e.g. Mahmoud El-Sayed"}
                      className={`h-11 ${isRtl ? "pr-9" : "pl-9"}`}
                      required
                    />
                  </div>
                </div>

                {/* Email Address */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                    {t.users.email} *
                  </label>
                  <div className="relative">
                    <Mail
                      className={`absolute top-3 h-4 w-4 text-slate-400 ${
                        isRtl ? "right-3" : "left-3"
                      }`}
                    />
                    <Input
                      type="email"
                      value={formEmail}
                      onChange={(e) => setFormEmail(e.target.value)}
                      placeholder="storekeeper@sinoma.com"
                      className={`h-11 ${isRtl ? "pr-9" : "pl-9"}`}
                      dir="ltr"
                      required
                    />
                  </div>
                </div>

                {/* Password (Directly under Email) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300">
                      {isRtl ? "كلمة المرور لتسجيل الدخول *" : "Login Password *"}
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateFormPassword}
                      className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Wand2 className="h-3 w-3" />
                      <span>{isRtl ? "توليد كلمة سر" : "Generate"}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <Lock
                      className={`absolute top-3 h-4 w-4 text-slate-400 ${
                        isRtl ? "right-3" : "left-3"
                      }`}
                    />
                    <Input
                      type={showFormPassword ? "text" : "password"}
                      value={formInitialPassword}
                      onChange={(e) => setFormInitialPassword(e.target.value)}
                      placeholder={isRtl ? "كلمة المرور (6 أحرف أو أرقام على الأقل)" : "At least 6 characters"}
                      className={`h-11 ${isRtl ? "pr-9 pl-10" : "pl-9 pr-10"}`}
                      dir="ltr"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowFormPassword(!showFormPassword)}
                      className={`absolute top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer ${
                        isRtl ? "left-3" : "right-3"
                      }`}
                    >
                      {showFormPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {isRtl
                      ? "يمكنك كتابة كلمة المرور أو توليدها تلقائياً، وسيتمكن الموظف من تسجيل الدخول بها فوراً."
                      : "Type or generate automatically. Staff member can log in with it immediately."}
                  </p>
                </div>

                {/* Role Selector */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300 mb-1.5">
                    {t.users.role} *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setFormRole("STOREKEEPER")}
                      className={`p-3 rounded-xl border text-start flex items-center gap-2.5 transition-all cursor-pointer ${
                        formRole === "STOREKEEPER"
                          ? "border-sky-600 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 font-semibold ring-2 ring-sky-600/20"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <Warehouse className="h-4 w-4 text-sky-600" />
                      <div className="text-xs">
                        <div className="font-bold">
                          {(t.auth.roles as any).STOREKEEPER || "Storekeeper"}
                        </div>
                        <div className="text-[10px] opacity-75">
                          {isRtl ? "حركات وسندات المستودع" : "Vouchers & inventory"}
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormRole("SITE_ENGINEER")}
                      className={`p-3 rounded-xl border text-start flex items-center gap-2.5 transition-all cursor-pointer ${
                        formRole === "SITE_ENGINEER"
                          ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-semibold ring-2 ring-emerald-600/20"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <HardHat className="h-4 w-4 text-emerald-600" />
                      <div className="text-xs">
                        <div className="font-bold">
                          {(t.auth.roles as any).SITE_ENGINEER || "Site Engineer"}
                        </div>
                        <div className="text-[10px] opacity-75">
                          {isRtl ? "صرف المواد للموقع" : "Requisitions & dispatch"}
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormRole("VIEWER")}
                      className={`p-3 rounded-xl border text-start flex items-center gap-2.5 transition-all cursor-pointer ${
                        formRole === "VIEWER"
                          ? "border-slate-600 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold ring-2 ring-slate-600/20"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <Eye className="h-4 w-4 text-slate-600" />
                      <div className="text-xs">
                        <div className="font-bold">
                          {(t.auth.roles as any).VIEWER || "Viewer"}
                        </div>
                        <div className="text-[10px] opacity-75">
                          {isRtl ? "قراءة وتقارير فقط" : "Read-only access"}
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setFormRole("ADMIN")}
                      className={`p-3 rounded-xl border text-start flex items-center gap-2.5 transition-all cursor-pointer ${
                        formRole === "ADMIN"
                          ? "border-purple-600 bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 font-semibold ring-2 ring-purple-600/20"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      }`}
                    >
                      <ShieldCheck className="h-4 w-4 text-purple-600" />
                      <div className="text-xs">
                        <div className="font-bold">
                          {(t.auth.roles as any).ADMIN || "Administrator"}
                        </div>
                        <div className="text-[10px] opacity-75">
                          {isRtl ? "كامل صلاحيات النظام" : "Full ERP access"}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>

                {/* Resend Invitation Checkbox */}
                <div className="p-3.5 rounded-2xl bg-sky-50/60 dark:bg-sky-950/30 border border-sky-100 dark:border-sky-900/50">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formSendInvite}
                      onChange={(e) => setFormSendInvite(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500 cursor-pointer"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-sky-900 dark:text-sky-200 block">
                        {t.users.sendInviteCheckbox}
                      </span>
                      <span className="text-[11px] text-sky-700 dark:text-sky-400 mt-0.5 block">
                        {isRtl
                          ? "سيتم إرسال رابط فريد للموظف لتفعيل حسابه وتحديد كلمة المرور الخاصة به مباشرة"
                          : "A secure one-time activation link will be delivered so they can set their password"}
                      </span>
                    </div>
                  </label>
                </div>

                {/* Modal Actions */}
                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsModalOpen(false)}
                    disabled={isSubmitting}
                    className="rounded-xl"
                  >
                    {isRtl ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl gap-2 shadow-md shadow-sky-600/20"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{isRtl ? "جاري الإنشاء والإرسال..." : "Creating & Dispatching..."}</span>
                      </>
                    ) : (
                      <span>{isRtl ? "إنشاء وتفعيل الحساب" : "Create Staff Account"}</span>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Direct Reset Password for Staff Member Modal */}
      <AnimatePresence>
        {resetPasswordModalUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 relative overflow-hidden"
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setResetPasswordModalUser(null)}
                className={`absolute top-5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer ${
                  isRtl ? "left-5" : "right-5"
                }`}
              >
                <X className="h-5 w-5" />
              </button>

              {/* Modal Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="h-10 w-10 rounded-xl bg-sky-50 dark:bg-sky-950 text-sky-600 flex items-center justify-center border border-sky-100 dark:border-sky-900">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    {isRtl ? "إعادة تعيين كلمة المرور للموظف" : "Reset Staff Password"}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                    {resetPasswordModalUser.name} • {resetPasswordModalUser.email}
                  </p>
                </div>
              </div>

              <form onSubmit={handleAdminResetPassword} className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold uppercase text-slate-700 dark:text-slate-300">
                      {isRtl ? "كلمة المرور الجديدة *" : "New Password *"}
                    </label>
                    <button
                      type="button"
                      onClick={handleGenerateResetPassword}
                      className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 flex items-center gap-1 cursor-pointer"
                    >
                      <Wand2 className="h-3 w-3" />
                      <span>{isRtl ? "توليد كلمة سر" : "Generate"}</span>
                    </button>
                  </div>
                  <div className="relative">
                    <Lock
                      className={`absolute top-3 h-4 w-4 text-slate-400 ${
                        isRtl ? "right-3" : "left-3"
                      }`}
                    />
                    <Input
                      type={showResetPassword ? "text" : "password"}
                      value={newResetPassword}
                      onChange={(e) => setNewResetPassword(e.target.value)}
                      placeholder={isRtl ? "كلمة مرور جديدة (6 خانات على الأقل)" : "Minimum 6 characters"}
                      className={`h-11 ${isRtl ? "pr-9 pl-10" : "pl-9 pr-10"}`}
                      dir="ltr"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(!showResetPassword)}
                      className={`absolute top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer ${
                        isRtl ? "left-3" : "right-3"
                      }`}
                    >
                      {showResetPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                    {isRtl
                      ? "سيتم تحديث كلمة المرور وتفعيل الحساب مباشرة للموظف."
                      : "Password will be updated and account activated immediately."}
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-end gap-2.5">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setResetPasswordModalUser(null)}
                    disabled={isResettingPassword}
                    className="rounded-xl"
                  >
                    {isRtl ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button
                    type="submit"
                    disabled={isResettingPassword}
                    className="bg-sky-600 hover:bg-sky-700 text-white font-semibold rounded-xl gap-2 shadow-md shadow-sky-600/20"
                  >
                    {isResettingPassword ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>{isRtl ? "جاري التحديث..." : "Updating..."}</span>
                      </>
                    ) : (
                      <span>{isRtl ? "حفظ وتعيين كلمة المرور" : "Save New Password"}</span>
                    )}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

