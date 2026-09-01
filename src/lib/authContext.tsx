import React, { createContext, useContext, useState, useEffect } from 'react';
import { AdminUser } from '../types';
import { DEFAULT_ADMIN_USERS } from '../data/seedData';

interface AuthContextType {
  currentUser: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'careon_admin_session';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(() => {
    if (typeof window === 'undefined') return null;
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, [currentUser]);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    setIsLoading(false);

    const cleanEmail = email.trim().toLowerCase();
    const matched = DEFAULT_ADMIN_USERS.find((u) => 
      u.email.toLowerCase() === cleanEmail || 
      cleanEmail === 'admin' || 
      cleanEmail === 'careon' ||
      cleanEmail === 'careonadmin'
    );

    // If valid email/username and password format
    if (matched && pass.trim().length >= 4) {
      setCurrentUser(matched);
      return { success: true };
    }

    // Default admin fallback if admin credentials used
    if ((cleanEmail === 'admin@careonclinic.com' || cleanEmail === 'admin' || cleanEmail.includes('admin')) && pass.trim().length >= 4) {
      const defaultAdmin: AdminUser = {
        id: 'usr-admin-01',
        email: 'admin@careonclinic.com',
        name: 'CareOn Administrator',
        role: 'ADMIN'
      };
      setCurrentUser(defaultAdmin);
      return { success: true };
    }

    return {
      success: false,
      error: 'Invalid credentials. Please enter your administrator email and password.'
    };
  };

  const logout = () => {
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isAuthenticated: Boolean(currentUser),
        isLoading,
        login,
        logout
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
