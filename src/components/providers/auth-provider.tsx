"use client";

import React, { createContext, useContext, useEffect, useState, useTransition } from "react";
import { getSessionUser, logoutUser } from "@/server/actions/auth";
import { AuthSessionPayload } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface AuthContextType {
  user: AuthSessionPayload | null;
  isLoading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  logout: async () => {},
  refreshUser: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthSessionPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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

  useEffect(() => {
    fetchUser();
  }, []);

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

