'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api/client';

export interface UserSession {
  id: string;
  phone: string;
}

interface AuthContextType {
  user: UserSession | null;
  loading: boolean;
  signIn: (phone: string, password: string) => Promise<void>;
  signUp: (phone: string, password: string, agreedToPrivacy?: boolean) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => { },
  signUp: async () => { },
  signOut: async () => { },
});

interface LoginResponse {
  success: boolean;
  token: string;
  user: UserSession;
  error?: string;
}

interface SessionResponse {
  authenticated: boolean;
  user: UserSession | null;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      // Check if we have a token
      if (!api.isAuthenticated()) {
        setLoading(false);
        return;
      }

      try {
        // Verify token with server
        const session = await api.get<SessionResponse>('/api/auth/session');
        if (session.authenticated && session.user) {
          setUser(session.user);
        } else {
          // Invalid token, clear it
          api.clearToken();
        }
      } catch (error) {
        console.error('Session check failed:', error);
        api.clearToken();
      }

      setLoading(false);
    };

    checkSession();
  }, []);

  const signIn = async (phone: string, password: string) => {
    const result = await api.post<LoginResponse>('/api/auth/login', {
      phone,
      password,
    });

    if (result.error) {
      throw new Error(result.error);
    }

    if (result.token) {
      api.setToken(result.token);
      setUser(result.user);
    }

    // Navigate to dashboard
    router.push('/dashboard');
    router.refresh();
  };

  const signUp = async (phone: string, password: string, agreedToPrivacy: boolean = true) => {
    const result = await api.post<LoginResponse>('/api/auth/signup', {
      phone,
      password,
      agreedToPrivacy,
    });

    if (result.error) {
      throw new Error(result.error);
    }

    if (result.token) {
      api.setToken(result.token);
      setUser(result.user);
    }

    // Navigate to onboarding
    router.push('/onboarding');
    router.refresh();
  };

  const signOut = async () => {
    try {
      await api.post('/api/auth/logout');
    } catch (error) {
      // Ignore logout errors
    }

    api.clearToken();
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
