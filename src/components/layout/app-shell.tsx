"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

const AUTH_PAGES = [
  "/login",
  "/signup",
  "/forgot-password",
  "/reset-password",
  "/set-password",
];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PAGES.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`)
  );

  if (isAuthPage) {
    return <div className="min-h-screen w-full">{children}</div>;
  }

  return (
    <div className="flex min-h-screen w-full">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
