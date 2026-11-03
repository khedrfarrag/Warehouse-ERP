"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getSessionUser, logoutUser } from "@/server/actions/auth";
import { AuthSessionPayload } from "@/lib/auth";
import { useRouter, usePathname } from "next/navigation";

interface AuthContextType {
  user: AuthSessionPayload | null;
  isLoading: boolean;
  setUser: (user: AuthSessionPayload | null) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  setUser: () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthSessionPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUser = async () => {
    try {
      const res = await getSessionUser();
      if (res.success && res.user) {
        setUser(res.user);
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Re-fetch on initial mount and whenever pathname changes
  useEffect(() => {
    fetchUser();
  }, [pathname]);

  const logout = async () => {
    await logoutUser();
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        setUser,
        logout,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
