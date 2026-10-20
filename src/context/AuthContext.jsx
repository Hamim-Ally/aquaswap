import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiFetch, getToken, setToken, clearToken } from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const restore = async () => {
      if (!getToken()) {
        setAuthReady(true);
        return;
      }
      try {
        const { user: u } = await apiFetch('/auth/me');
        if (!cancelled) setUser(u);
      } catch {
        clearToken();
      } finally {
        if (!cancelled) setAuthReady(true);
      }
    };
    restore();
    return () => {
      cancelled = true;
    };
  }, []);

  const signup = useCallback(async (email, password, company) => {
    const { token, user: u } = await apiFetch('/auth/signup', {
      method: 'POST',
      body: { email, password, company }
    });
    setToken(token);
    setUser(u);
    return u;
  }, []);

  const login = useCallback(async (email, password) => {
    const { token, user: u } = await apiFetch('/auth/login', {
      method: 'POST',
      body: { email, password }
    });
    setToken(token);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    clearToken();
    setUser(null);
  }, []);

  const value = { user, authReady, signup, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
