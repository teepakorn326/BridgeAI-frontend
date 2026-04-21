"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { API_BASE } from "./api";

export interface User {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  university?: string;
  mobile?: string;
  country?: string;
  dob?: string;
  provider?: "password" | "google" | "wechat";
}

export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  university: string;
  mobile: string;
  country: string;
  dob: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<User | null>;
}

const AuthContext = createContext<AuthState | null>(null);

async function readJSON(res: Response) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

async function fetchMe(): Promise<User | null> {
  const res = await fetch(`${API_BASE}/auth/me`, {
    credentials: "include",
  });
  if (!res.ok) return null;
  return res.json();
}

// Silently push the JWT to the BridgeAI Chrome extension if the
// content-script bridge is present. No-op otherwise.
async function pushAuthToExtension() {
  if (typeof window === "undefined") return;
  try {
    const res = await fetch(`${API_BASE}/auth/extension-token`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return;
    const { token, user } = await res.json();
    window.postMessage(
      { source: "bridgeai-web", type: "auth", token, user },
      "*"
    );
  } catch {}
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const u = await fetchMe();
    setUser(u);
    if (u) pushAuthToExtension();
    return u;
  }, []);

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const body = await readJSON(res);
      throw new Error(body.error || "Login failed");
    }
    const data = await res.json();
    setUser(data.user);
    pushAuthToExtension();
  }, []);

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const body = await readJSON(res);
      throw new Error(body.error || "Registration failed");
    }
    const data = await res.json();
    setUser(data.user);
    pushAuthToExtension();
  }, []);

  const logout = useCallback(async () => {
    await fetch(`${API_BASE}/auth/logout`, {
      method: "POST",
      credentials: "include",
    }).catch(() => {});
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
