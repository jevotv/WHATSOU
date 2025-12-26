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
    if ((result as any).token) {
      const cookieValue = encodeURIComponent((result as any).token);
      document.cookie = `whatsou_token=${cookieValue}; path=/; max-age=604800; samesite=lax; secure`;

      // DEBUG: Verify cookie was set
      if (document.cookie.indexOf('whatsou_token') === -1) {
        throw new Error('Browser blocked cookie setting. Please enable cookies.');
      }
    }

    // Force hard reload to ensure headers are sent
    window.location.href = '/dashboard';
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
    if ((result as any).token) {
      const cookieValue = encodeURIComponent((result as any).token);
      document.cookie = `whatsou_token=${cookieValue}; path=/; max-age=604800; samesite=lax; secure`;

      if (document.cookie.indexOf('whatsou_token') === -1) {
        throw new Error('Browser blocked cookie setting. Please enable cookies.');
      }
    }

    window.location.href = '/onboarding';
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
