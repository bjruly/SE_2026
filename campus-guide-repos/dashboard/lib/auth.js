'use client';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { api, tokenStore } from './api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khi mở trang: nếu có token thì hỏi backend xem còn hợp lệ không
  useEffect(() => {
    let alive = true;
    (async () => {
      if (!tokenStore.get()) {
        setLoading(false);
        return;
      }
      try {
        const r = await api('/api/auth/me');
        if (alive) setUser(r.user);
      } catch {
        tokenStore.clear();
      } finally {
        if (alive) setLoading(false);
      }
    })();
    const onUnauthorized = () => setUser(null);
    window.addEventListener('tm-unauthorized', onUnauthorized);
    return () => {
      alive = false;
      window.removeEventListener('tm-unauthorized', onUnauthorized);
    };
  }, []);

  const login = useCallback(async (email, password) => {
    const r = await api('/api/auth/login', { method: 'POST', body: { email, password } });
    tokenStore.set(r.token);
    setUser(r.user);
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUser(null);
  }, []);

  const value = useMemo(() => ({ user, loading, login, logout }), [user, loading, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
