import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export type UserRole = 'fermier' | 'gestionnaire';

interface UserCredentials {
  email: string;
  password: string;
  name: string;
  role: UserRole;
  status?: 'actif' | 'inactif';
}

interface User {
  email: string;
  name: string;
  role: UserRole;
}

export interface PasswordResetRequest {
  email: string;
  requestedAt: string;
  status: 'pending' | 'approved' | 'rejected';
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
  toggleUserStatus: (email: string) => void;
  updateProfile: (data: { name?: string; password?: string }) => void;
  updateLogo: (logoUrl: string) => void;
  logo: string | null;
  requestPasswordReset: (email: string) => boolean;
  getResetRequests: () => PasswordResetRequest[];
  approveResetRequest: (email: string) => string;
  rejectResetRequest: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEFAULT_USERS: UserCredentials[] = [
  { email: 'admin@gmail.com', password: 'Di@llo2026', name: 'Mamadou Diallo', role: 'fermier' },
  { email: 'gestionnaire@gmail.com', password: 'Gest@2026', name: 'Ibrahima Sow', role: 'gestionnaire' },
];

const ROLE_RESTRICTIONS: Record<UserRole, string[]> = {
  fermier: [],
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

  const [userStatuses, setUserStatuses] = useState<Record<string, 'actif' | 'inactif'>>(() => {
    const stored = localStorage.getItem('ferme_diallo_user_statuses');
    return stored ? JSON.parse(stored) : {};
  });

  const [logo, setLogo] = useState<string | null>(() => {
    return localStorage.getItem('ferme_diallo_logo');
  });

  const [resetRequests, setResetRequests] = useState<PasswordResetRequest[]>(() => {
    const stored = localStorage.getItem('ferme_diallo_reset_requests');
    return stored ? JSON.parse(stored) : [];
  });

  const login = useCallback((email: string, password: string): boolean => {
    const allUsers = [...DEFAULT_USERS, ...(JSON.parse(localStorage.getItem('ferme_diallo_extra_users') || '[]'))];
    const found = allUsers.find((u: UserCredentials) => u.email === email && u.password === password);
    if (found) {
      // Check if user is inactive
      const statuses = JSON.parse(localStorage.getItem('ferme_diallo_user_statuses') || '{}');
      if (statuses[found.email] === 'inactif') return false;
      
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

  const removeUser = useCallback((email: string) => {
    if (DEFAULT_USERS.some(u => u.email === email)) return;
    setExtraUsers(prev => {
      const updated = prev.filter(u => u.email !== email);
      localStorage.setItem('ferme_diallo_extra_users', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleUserStatus = useCallback((email: string) => {
    setUserStatuses(prev => {
      const current = prev[email] || 'actif';
      const updated = { ...prev, [email]: current === 'actif' ? 'inactif' as const : 'actif' as const };
      localStorage.setItem('ferme_diallo_user_statuses', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const updateProfile = useCallback((data: { name?: string; password?: string }) => {
    if (!user) return;
    if (data.name) {
      const updatedUser = { ...user, name: data.name };
      setUser(updatedUser);
      localStorage.setItem('ferme_diallo_user', JSON.stringify(updatedUser));
    }
    if (data.password) {
      const isDefault = DEFAULT_USERS.some(u => u.email === user.email);
      if (!isDefault) {
        setExtraUsers(prev => {
          const updated = prev.map(u => u.email === user.email ? { ...u, ...(data.name ? { name: data.name } : {}), password: data.password! } : u);
          localStorage.setItem('ferme_diallo_extra_users', JSON.stringify(updated));
          return updated;
        });
      }
    }
  }, [user]);

  const updateLogo = useCallback((logoUrl: string) => {
    setLogo(logoUrl);
    localStorage.setItem('ferme_diallo_logo', logoUrl);
  }, []);

  const requestPasswordReset = useCallback((email: string): boolean => {
    const allUsers = [...DEFAULT_USERS, ...(JSON.parse(localStorage.getItem('ferme_diallo_extra_users') || '[]'))];
    const exists = allUsers.some((u: UserCredentials) => u.email === email);
    if (!exists) return false;
    
    setResetRequests(prev => {
      // Remove any existing pending request for this email
      const filtered = prev.filter(r => r.email !== email || r.status !== 'pending');
      const updated = [...filtered, { email, requestedAt: new Date().toISOString(), status: 'pending' as const }];
      localStorage.setItem('ferme_diallo_reset_requests', JSON.stringify(updated));
      return updated;
    });
    return true;
  }, []);

  const getResetRequests = useCallback((): PasswordResetRequest[] => {
    const stored = JSON.parse(localStorage.getItem('ferme_diallo_reset_requests') || '[]');
    return stored.filter((r: PasswordResetRequest) => r.status === 'pending');
  }, [resetRequests]);

  const approveResetRequest = useCallback((email: string): string => {
    const tempPassword = 'Temp@' + Math.random().toString(36).slice(-6);
    
    // Update password
    const isDefault = DEFAULT_USERS.some(u => u.email === email);
    if (!isDefault) {
      setExtraUsers(prev => {
        const updated = prev.map(u => u.email === email ? { ...u, password: tempPassword } : u);
        localStorage.setItem('ferme_diallo_extra_users', JSON.stringify(updated));
        return updated;
      });
    }
    
    // Update request status
    setResetRequests(prev => {
      const updated = prev.map(r => r.email === email && r.status === 'pending' ? { ...r, status: 'approved' as const } : r);
      localStorage.setItem('ferme_diallo_reset_requests', JSON.stringify(updated));
      return updated;
    });
    
    return tempPassword;
  }, []);

  const rejectResetRequest = useCallback((email: string) => {
    setResetRequests(prev => {
      const updated = prev.map(r => r.email === email && r.status === 'pending' ? { ...r, status: 'rejected' as const } : r);
      localStorage.setItem('ferme_diallo_reset_requests', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const getAllUsersWithStatus = useCallback((): UserCredentials[] => {
    const stored = JSON.parse(localStorage.getItem('ferme_diallo_extra_users') || '[]');
    const statuses = JSON.parse(localStorage.getItem('ferme_diallo_user_statuses') || '{}');
    return [...DEFAULT_USERS, ...stored].map(u => ({ ...u, status: statuses[u.email] || 'actif' }));
  }, [userStatuses]);

  return (
    <AuthContext.Provider value={{
      user, isAuthenticated: !!user, login, logout, hasAccess, addUser,
      getAllUsers: getAllUsersWithStatus, removeUser, toggleUserStatus,
      updateProfile, updateLogo, logo,
      requestPasswordReset, getResetRequests, approveResetRequest, rejectResetRequest,
    }}>
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
