'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type Role = '管理者' | '編輯者' | '檢視者';

export interface AuthUser {
  email: string;
  name: string;
  role: Role;
}

type Status = 'loading' | 'authed' | 'anon';

interface AuthContextValue {
  user: AuthUser | null;
  status: Status;
  refresh: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchSessionUser(): Promise<AuthUser | null> {
  try {
    const res = await fetch('/api/auth/me', { credentials: 'include' });
    return res.ok ? (await res.json() as AuthUser) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<Status>('loading');

  const applySession = useCallback((next: AuthUser | null) => {
    setUser(next);
    setStatus(next ? 'authed' : 'anon');
  }, []);

  // Initial status is already 'loading', so the mount-time check skips that step.
  useEffect(() => { fetchSessionUser().then(applySession); }, [applySession]);

  const refresh = useCallback(async () => {
    setStatus('loading');
    applySession(await fetchSessionUser());
  }, [applySession]);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
    } catch {
      // ignore network errors on logout; we clear local state regardless
    }
    setUser(null);
    setStatus('anon');
  }, []);

  return <AuthContext.Provider value={{ user, status, refresh, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
