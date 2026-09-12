import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types';

interface AuthContextType {
  currentUser: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  authToken: string | null;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  verifySession: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_TOKEN_KEY = 'careon_admin_jwt_token';
const AUTH_USER_KEY = 'careon_admin_user_profile';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authToken, setAuthToken] = useState<string | null>(() => {
    if (typeof window === 'undefined') return null;
    return sessionStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(AUTH_TOKEN_KEY) || null;
  });

  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = sessionStorage.getItem(AUTH_USER_KEY) || localStorage.getItem(AUTH_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Verify server-side session token on startup and network reconnect
  const verifySession = async (): Promise<boolean> => {
    const token = authToken || (typeof window !== 'undefined' ? sessionStorage.getItem(AUTH_TOKEN_KEY) || localStorage.getItem(AUTH_TOKEN_KEY) : null);
    if (!token) {
      setCurrentUser(null);
      setAuthToken(null);
      return false;
    }

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'GET',
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        if (data.valid && data.user) {
          setCurrentUser(data.user);
          sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
          return true;
        }
      }

      // If server explicitly rejected the token
      if (res.status === 401 || res.status === 403) {
        logoutLocal();
        return false;
      }

      return Boolean(currentUser);
    } catch {
      // In case of transient network offline, rely on stored valid token
      return Boolean(currentUser);
    }
  };

  useEffect(() => {
    if (authToken) {
      verifySession();
    }
  }, []);

  const logoutLocal = () => {
    setAuthToken(null);
    setCurrentUser(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(AUTH_TOKEN_KEY);
      sessionStorage.removeItem(AUTH_USER_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
    }
  };

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email.trim(),
          password: pass.trim()
        })
      });

      const data = await res.json();
      setIsLoading(false);

      if (res.ok && data.success && data.token && data.user) {
        setAuthToken(data.token);
        setCurrentUser(data.user);

        if (typeof window !== 'undefined') {
          sessionStorage.setItem(AUTH_TOKEN_KEY, data.token);
          sessionStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
          localStorage.setItem(AUTH_TOKEN_KEY, data.token);
          localStorage.setItem(AUTH_USER_KEY, JSON.stringify(data.user));
        }

        return { success: true };
      }

      return {
        success: false,
        error: data.error || 'Invalid admin credentials. Please enter a valid administrator email and password.'
      };
    } catch {
      setIsLoading(false);
      return {
        success: false,
        error: 'Unable to connect to authentication server. Please check your network connection.'
      };
    }
  };

  const logout = async () => {
    const token = authToken;
    logoutLocal();

    if (token) {
      try {
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      } catch {
        // Ignore network errors on logout
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser && authToken),
        isLoading,
        authToken,
        login,
        logout,
        verifySession
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
