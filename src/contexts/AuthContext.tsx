import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type UserRole = 'fermier' | 'gestionnaire';

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
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Credentials per role
const USERS: { email: string; password: string; name: string; role: UserRole }[] = [
  { email: 'admin@gmail.com', password: 'Di@llo2026', name: 'Mamadou Diallo', role: 'fermier' },
  { email: 'gestionnaire@gmail.com', password: 'Gest@2026', name: 'Ibrahima Sow', role: 'gestionnaire' },
];

// Gestionnaire cannot see Finance (gains/sorties d'argent)
const ROLE_RESTRICTIONS: Record<UserRole, string[]> = {
  fermier: [], // Full access
  gestionnaire: ['finance'], // Cannot see finance
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('ferme_diallo_user');
    return stored ? JSON.parse(stored) : null;
  });

  const login = useCallback((email: string, password: string): boolean => {
    const found = USERS.find(u => u.email === email && u.password === password);
    if (found) {
      const userData: User = {
        email: found.email,
        name: found.name,
        role: found.role,
      };
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
    const restrictions = ROLE_RESTRICTIONS[user.role];
    return !restrictions.includes(section);
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, hasAccess }}>
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
