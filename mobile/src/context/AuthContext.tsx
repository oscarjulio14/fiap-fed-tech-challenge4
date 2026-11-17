import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { setAuthToken, setUnauthorizedHandler } from '../services/api';
import { authService } from '../services/authService';
import { AuthUser } from '../types';

const STORAGE_KEY = '@blog/session';

interface AuthContextValue {
  user: AuthUser | null;
  isTeacher: boolean;
  isAuthenticated: boolean;
  /** Visitante: navega apenas lendo posts, sem login. */
  isGuest: boolean;
  /** true enquanto a sessão salva está sendo restaurada. */
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  /** Encerra a sessão (ou o modo visitante) e volta para a tela de login. */
  logout: () => Promise<void>;
  enterAsGuest: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    setAuthToken(null);
    setUser(null);
    setIsGuest(false);
    await AsyncStorage.removeItem(STORAGE_KEY);
  }, []);

  // Restaura sessão persistida
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) {
          const session = JSON.parse(raw) as { token: string; user: AuthUser };
          setAuthToken(session.token);
          setUser(session.user);
        }
      } catch {
        await AsyncStorage.removeItem(STORAGE_KEY);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Token expirado/inválido => volta para o login
  useEffect(() => {
    setUnauthorizedHandler(() => {
      logout();
    });
    return () => setUnauthorizedHandler(null);
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: loggedUser } = await authService.login(email, password);
    setAuthToken(token);
    setUser(loggedUser);
    setIsGuest(false);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user: loggedUser }));
  }, []);

  const enterAsGuest = useCallback(() => setIsGuest(true), []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isTeacher: user?.role === 'teacher',
      isAuthenticated: !!user,
      isGuest,
      loading,
      login,
      logout,
      enterAsGuest,
    }),
    [user, isGuest, loading, login, logout, enterAsGuest],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>.');
  return ctx;
}
