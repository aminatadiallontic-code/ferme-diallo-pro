import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type UserRole = 'fermier' | 'gestionnaire';

interface UserCredentials {
  email: string;
  password: string;
  name: string;
  role: UserRole;
}

interface User {
  email: string;
  name: string;
  role: UserRole;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  hasAccess: (section: string) => boolean;
  addUser: (userData: UserCredentials) => void;
  getAllUsers: () => UserCredentials[];
  removeUser: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Default credentials
const DEFAULT_USERS: UserCredentials[] = [
  { email: 'admin@gmail.com', password: 'Di@llo2026', name: 'Mamadou Diallo', role: 'fermier' },
  { email: 'gestionnaire@gmail.com', password: 'Gest@2026', name: 'Ibrahima Sow', role: 'gestionnaire' },
];

// Gestionnaire: restricted from dashboard, utilisateurs, finance, parametres
const ROLE_RESTRICTIONS: Record<UserRole, string[]> = {
  fermier: [], // Full access
  gestionnaire: ['finance', 'dashboard', 'utilisateurs', 'parametres'],
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('ferme_diallo_user');
    return stored ? JSON.parse(stored) : null;
  });

  const [extraUsers, setExtraUsers] = useState<UserCredentials[]>(() => {
    const stored = localStorage.getItem('ferme_diallo_extra_users');
    return stored ? JSON.parse(stored) : [];
  });

  const allCredentials = [...DEFAULT_USERS, ...extraUsers];

  const login = useCallback((email: string, password: string): boolean => {
    const allUsers = [...DEFAULT_USERS, ...(JSON.parse(localStorage.getItem('ferme_diallo_extra_users') || '[]'))];
    const found = allUsers.find((u: UserCredentials) => u.email === email && u.password === password);
    if (found) {
      const userData: User = { email: found.email, name: found.name, role: found.role };
      setUser(userData);
      localStorage.setItem('ferme_diallo_user', JSON.stringify(userData));
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('ferme_diallo_user');
  }, []);

  const hasAccess = useCallback((section: string): boolean => {
    if (!user) return false;
    const restrictions = ROLE_RESTRICTIONS[user.role] || [];
    return !restrictions.includes(section);
  }, [user]);

  const addUser = useCallback((userData: UserCredentials) => {
    setExtraUsers(prev => {
      const updated = [...prev, userData];
      localStorage.setItem('ferme_diallo_extra_users', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getAllUsers = useCallback((): UserCredentials[] => {
    const stored = JSON.parse(localStorage.getItem('ferme_diallo_extra_users') || '[]');
    return [...DEFAULT_USERS, ...stored];
  }, []);

  const removeUser = useCallback((email: string) => {
    // Cannot remove default users
    if (DEFAULT_USERS.some(u => u.email === email)) return;
    setExtraUsers(prev => {
      const updated = prev.filter(u => u.email !== email);
      localStorage.setItem('ferme_diallo_extra_users', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, hasAccess, addUser, getAllUsers, removeUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
