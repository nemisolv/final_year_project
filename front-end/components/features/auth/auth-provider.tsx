'use client';

import { createContext, useEffect, useState, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { User, AuthContextType } from '@/types';
import { authService, userService } from '@/services';
import { checkRole, checkAnyRole, clearAuthTokens } from '@/lib/auth';
import { toast } from 'sonner';

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Request deduplication - prevent concurrent API calls
  const fetchingPromise = useRef<Promise<User | null> | null>(null);
  const userRef = useRef<User | null>(user);

  // Keep userRef in sync with user state
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // Fetch user with deduplication
  const fetchUser = useCallback(async (force: boolean = false): Promise<User | null> => {
    // If already fetching, return the existing promise
    if (!force && fetchingPromise.current) {
      return fetchingPromise.current;
    }

    // If we have a user and not forcing, return cached
    if (!force && userRef.current) {
      return userRef.current;
    }

    // Start new fetch
    fetchingPromise.current = (async () => {
      try {
        const currentUser = await userService.getCurrentUser();
        setUser(currentUser);
        return currentUser;
      } catch (error) {
        console.error('Failed to load user:', error);
        const err = error as { status?: number; response?: { status?: number } };
        if (err?.status === 401 || err?.response?.status === 401) {
          clearAuthTokens();
          setUser(null);
        }
        return null;
      } finally {
        fetchingPromise.current = null;
      }
    })();

    return fetchingPromise.current;
  }, []);

  // Initial load only
  useEffect(() => {
    let mounted = true;

    const loadUser = async () => {
      const userData = await fetchUser();
      if (mounted) {
        setIsLoading(false);
      }
    };

    loadUser();

    return () => {
      mounted = false;
    };
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    try {
      await authService.login({ email, password });
      // Force fetch to get fresh user data and update state
      await fetchUser(true);
      toast.success('Đăng nhập thành công!');
    } catch (error) {
      const err = error as { message?: string };
      toast.error(err.message || 'Đăng nhập thất bại');
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      userRef.current = null;
      router.push('/auth/login');
      toast.success('Đã đăng xuất');
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      userRef.current = null;
      router.push('/auth/login');
      toast.success('Đã đăng xuất');
    }
  };

  const hasRole = (role: string): boolean => {
    return checkRole(user, role);
  };

  const hasAnyRole = (roles: string[]): boolean => {
    return checkAnyRole(user, roles);
  };

  const refreshUser = useCallback(async () => {
    return await fetchUser(true);
  }, [fetchUser]);

  const value: AuthContextType = {
    user,
    setUser,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    hasRole,
    hasAnyRole,
    refreshUser,
    fetchUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
