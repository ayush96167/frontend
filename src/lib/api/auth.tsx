"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useQueryClient } from "@tanstack/react-query";
import { clearAccessToken, refreshAccessToken, setAccessToken } from "./client";
import * as endpoints from "./endpoints";
import type { AuthUser, CompanyMembership } from "./types";

export function activeCompanyMembership(user: AuthUser): CompanyMembership | undefined {
  return user.memberships.find((m) => m.status === "ACTIVE") ?? user.memberships[0];
}

export function activeCompanyId(user: AuthUser): string | undefined {
  return activeCompanyMembership(user)?.companyId;
}

export function homeForRole(user: AuthUser): string {
  switch (user.role) {
    case "STUDENT":
      return "/student/dashboard";
    case "PORTAL_HR":
    case "MASTER_ADMIN":
      return "/admin/dashboard";
    case "COMPANY_USER": {
      const companyId = activeCompanyId(user);
      return companyId ? `/company/${companyId}/dashboard` : "/hr/join-company";
    }
  }
}

export function roleLabel(user: AuthUser): string {
  switch (user.role) {
    case "STUDENT":
      return "Student";
    case "PORTAL_HR":
      return "HiLabs HR";
    case "MASTER_ADMIN":
      return "Master admin";
    case "COMPANY_USER": {
      const m = activeCompanyMembership(user);
      if (m?.role === "COMPANY_ADMIN") return "Company admin";
      if (m?.role === "COMPANY_HR") return "Company HR";
      return "Recruiter";
    }
  }
}

export function displayNameForUser(user: AuthUser): string {
  const local = user.email.split("@")[0] ?? user.email;
  return local
    .split(/[._-]+/)
    .filter(Boolean)
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
}

export function initialsForUser(user: AuthUser): string {
  const parts = displayNameForUser(user).split(" ").filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }
  return user.email.slice(0, 2).toUpperCase();
}

interface AuthContextValue {
  user: AuthUser | null;
  ready: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<AuthUser | null>;
  applySessionToken: (token: string) => Promise<AuthUser>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [ready, setReady] = useState(false);
  const queryClient = useQueryClient();

  const refreshUser = useCallback(async (): Promise<AuthUser | null> => {
    try {
      const { data } = await endpoints.getMe();
      setUser(data);
      return data;
    } catch {
      setUser(null);
      clearAccessToken();
      return null;
    }
  }, []);

  const applySessionToken = useCallback(
    async (token: string): Promise<AuthUser> => {
      setAccessToken(token);
      const { data } = await endpoints.getMe();
      setUser(data);
      queryClient.clear();
      return data;
    },
    [queryClient],
  );

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const token = await refreshAccessToken();
        if (!active) return;
        if (token) {
          const { data } = await endpoints.getMe();
          if (active) setUser(data);
        } else {
          setUser(null);
        }
      } catch {
        if (active) {
          clearAccessToken();
          setUser(null);
        }
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const login = useCallback(
    async (email: string, password: string): Promise<AuthUser> => {
      const { data } = await endpoints.login(email.trim().toLowerCase(), password);
      return applySessionToken(data.accessToken);
    },
    [applySessionToken],
  );

  const logout = useCallback(async () => {
    try {
      await endpoints.logout();
    } catch {
      // Clear local session state even if network request fails.
    } finally {
      clearAccessToken();
      setUser(null);
      queryClient.clear();
    }
  }, [queryClient]);

  const value = useMemo(
    () => ({ user, ready, login, logout, refreshUser, applySessionToken }),
    [user, ready, login, logout, refreshUser, applySessionToken],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
