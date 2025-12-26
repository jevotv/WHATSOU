'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn as signInAction, signUp as signUpAction, signOut as signOutAction, getSession } from '@/app/actions/auth';

export interface UserSession {
  id: string;
  phone: string;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  signIn: (phone: string, password: string) => Promise<void>;
  signUp: (phone: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => { },
  signUp: async () => { },
  signOut: async () => { },
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const sessionUser = await getSession();
      setUser(sessionUser);
      setLoading(false);
    };

    checkSession();
  }, []);

  const signIn = async (phone: string, password: string) => {
    const formData = new FormData();
    formData.append('phone', phone);
    formData.append('password', password);

    // Server action returns object { success: true } or { error: string }
    const result = await signInAction(formData);

    if (result.error) {
      throw new Error(result.error);
    }

    // FALLBACK: Set cookie manually if server header was dropped
    if (result.token) {
      document.cookie = `app-session=${result.token}; path=/; max-age=604800; samesite=lax`;
    }

    // Refresh session state
    const sessionUser = await getSession();

    // DEBUG: Trap missing cookie immediately
    if (!sessionUser) {
      throw new Error('Login succeeded but session failed. (Cookie dropped?)');
    }

    setUser(sessionUser);
    router.push('/dashboard');
    router.refresh();
  };

  const signUp = async (phone: string, password: string) => {
    const formData = new FormData();
    formData.append('phone', phone);
    formData.append('password', password);

    const result = await signUpAction(formData);

    if (result.error) {
      throw new Error(result.error);
    }

    // FALLBACK: Set cookie manually if server header was dropped
    if (result.token) {
      document.cookie = `app-session=${result.token}; path=/; max-age=604800; samesite=lax`;
    }

    // Refresh session state
    const sessionUser = await getSession();
    setUser(sessionUser);
    router.push('/onboarding');
    router.refresh();
  };

  const signOut = async () => {
    await signOutAction();
    setUser(null);
    router.push('/login');
    router.refresh();
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
