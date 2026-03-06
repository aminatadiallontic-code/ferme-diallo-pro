import React, { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react';

export type NotifType = 'warning' | 'danger' | 'success' | 'info';
export type NotifCategory = 'stock' | 'finance' | 'production' | 'sante' | 'client' | 'system';

export interface Notification {
  id: string;
  type: NotifType;
  category: NotifCategory;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
  addNotification: (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

function generateRealisticNotifications(): Notification[] {
  const now = new Date();
  const mins = (m: number) => new Date(now.getTime() - m * 60000).toISOString();
  const hours = (h: number) => new Date(now.getTime() - h * 3600000).toISOString();
  const days = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();

  return [
    {
      id: 'n1', type: 'danger', category: 'stock',
      title: 'Stock critique — Aliment croissance',
      message: 'Le stock d\'aliment croissance est à 0 kg. Seuil minimum : 500 kg. Commandez immédiatement pour éviter une rupture.',
      timestamp: mins(15), read: false,
    },
    {
      id: 'n2', type: 'danger', category: 'sante',
      title: 'Vaccins Gumboro en rupture',
      message: 'Le stock de vaccins Gumboro est épuisé (0/80 doses). Le programme de vaccination est compromis.',
      timestamp: mins(45), read: false,
    },
    {
      id: 'n3', type: 'warning', category: 'stock',
      title: 'Stock bas — Aliment pondeuses',
      message: 'Le stock d\'aliment pondeuses est à 0 kg (seuil : 400 kg). Prévoyez un réapprovisionnement.',
      timestamp: hours(1), read: false,
    },
    {
      id: 'n4', type: 'warning', category: 'production',
      title: 'Production d\'œufs en baisse',
      message: 'Aucun plateau d\'œufs en stock. La production semble interrompue ou les données ne sont pas à jour.',
      timestamp: hours(2), read: false,
    },
    {
      id: 'n5', type: 'warning', category: 'stock',
      title: 'Maïs concassé — Niveau zéro',
      message: 'Le stock de maïs concassé est à 0 kg (seuil critique : 600 kg). L\'alimentation des volailles est menacée.',
      timestamp: hours(3), read: false,
    },
    {
      id: 'n6', type: 'info', category: 'finance',
      title: 'Aucune transaction enregistrée',
      message: 'Aucune entrée ou sortie financière n\'a été enregistrée. Pensez à saisir vos opérations quotidiennes.',
      timestamp: hours(4), read: false,
    },
    {
      id: 'n7', type: 'danger', category: 'sante',
      title: 'Antibiotiques épuisés',
      message: 'Stock d\'antibiotiques à 0 flacons (seuil : 30). Les traitements d\'urgence ne sont plus possibles.',
      timestamp: hours(5), read: false,
    },
    {
      id: 'n8', type: 'info', category: 'client',
      title: 'Base clients vide',
      message: 'Aucun client enregistré. Ajoutez vos clients pour suivre les commandes et le chiffre d\'affaires.',
      timestamp: hours(8), read: true,
    },
    {
      id: 'n9', type: 'success', category: 'system',
      title: 'Système opérationnel',
      message: 'L\'application de gestion avicole fonctionne correctement. Toutes les fonctionnalités sont disponibles.',
      timestamp: days(1), read: true,
    },
    {
      id: 'n10', type: 'warning', category: 'stock',
      title: 'Vaccin Newcastle — Stock à surveiller',
      message: 'Le stock de vaccin Newcastle est à 0 doses (seuil : 50). Contactez votre fournisseur.',
      timestamp: days(1), read: true,
    },
  ];
}

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(() => {
    const stored = localStorage.getItem('ferme_diallo_notifications');
    return stored ? JSON.parse(stored) : generateRealisticNotifications();
  });

  useEffect(() => {
    localStorage.setItem('ferme_diallo_notifications', JSON.stringify(notifications));
  }, [notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const addNotification = useCallback((notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotif: Notification = {
      ...notif,
      id: `n_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    setNotifications(prev => [newNotif, ...prev]);
  }, []);

  return (
    <NotificationContext.Provider value={{ notifications, unreadCount, markAsRead, markAllAsRead, clearAll, addNotification }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error('useNotifications must be used within NotificationProvider');
  return ctx;
}
