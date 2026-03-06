import { useState } from 'react';
import { Bell, AlertTriangle, Package, Heart, Users, DollarSign, Monitor, Check, CheckCheck, Trash2, Filter } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useNotifications, type Notification, type NotifCategory } from '@/contexts/NotificationContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const categoryConfig: Record<NotifCategory, { label: string; icon: typeof Package; color: string }> = {
  stock: { label: 'Stock', icon: Package, color: 'bg-warning/10 text-warning' },
  finance: { label: 'Finance', icon: DollarSign, color: 'bg-primary/10 text-primary' },
  production: { label: 'Production', icon: Package, color: 'bg-accent/10 text-accent-foreground' },
  sante: { label: 'Santé', icon: Heart, color: 'bg-destructive/10 text-destructive' },
  client: { label: 'Clients', icon: Users, color: 'bg-success/10 text-success' },
  system: { label: 'Système', icon: Monitor, color: 'bg-muted text-muted-foreground' },
};

const typeStyles: Record<string, string> = {
  danger: 'border-l-destructive bg-destructive/[0.03]',
  warning: 'border-l-warning bg-warning/[0.03]',
  success: 'border-l-success bg-success/[0.03]',
  info: 'border-l-primary bg-primary/[0.03]',
};

const typeIconStyles: Record<string, string> = {
  danger: 'bg-destructive/10 text-destructive',
  warning: 'bg-warning/10 text-warning',
  success: 'bg-success/10 text-success',
  info: 'bg-primary/10 text-primary',
};

function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `Il y a ${mins} min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `Il y a ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'Hier';
  return `Il y a ${days} jours`;
}

const Alertes = () => {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearAll } = useNotifications();
  const [selectedCategory, setSelectedCategory] = useState<NotifCategory | 'all'>('all');

  const categories: (NotifCategory | 'all')[] = ['all', 'stock', 'sante', 'finance', 'production', 'client', 'system'];

  const filtered = selectedCategory === 'all'
    ? notifications
    : notifications.filter(n => n.category === selectedCategory);

  const dangerCount = notifications.filter(n => n.type === 'danger' && !n.read).length;
  const warningCount = notifications.filter(n => n.type === 'warning' && !n.read).length;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Header title="Alertes & Notifications" />
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-1.5 rounded-xl text-xs h-9">
              <CheckCheck size={14} /> Tout lire
            </Button>
          )}
          {notifications.length > 0 && (
            <Button variant="outline" size="sm" onClick={clearAll} className="gap-1.5 rounded-xl text-xs h-9 text-destructive hover:text-destructive">
              <Trash2 size={14} /> Effacer
            </Button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Non lues</p>
              <p className="text-xl font-extrabold text-foreground">{unreadCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell className="text-primary" size={18} />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Critiques</p>
              <p className="text-xl font-extrabold text-destructive">{dangerCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
              <AlertTriangle className="text-destructive" size={18} />
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Avertissements</p>
              <p className="text-xl font-extrabold text-warning">{warningCount}</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-warning/10 flex items-center justify-center">
              <AlertTriangle className="text-warning" size={18} />
            </div>
          </div>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <Filter size={14} className="text-muted-foreground shrink-0" />
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
              selectedCategory === cat
                ? 'bg-primary text-primary-foreground shadow-sm'
                : 'bg-secondary/60 text-muted-foreground hover:bg-secondary'
            }`}
          >
            {cat === 'all' ? 'Toutes' : categoryConfig[cat].label}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      <div className="space-y-2">
        {filtered.map((notif) => {
          const catConf = categoryConfig[notif.category];
          const CatIcon = catConf.icon;
          return (
            <div
              key={notif.id}
              onClick={() => markAsRead(notif.id)}
              className={`card-xl p-4 border-l-4 cursor-pointer transition-all hover:shadow-md ${typeStyles[notif.type]} ${
                notif.read ? 'opacity-60' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <div className={`p-2.5 rounded-xl shrink-0 ${typeIconStyles[notif.type]}`}>
                  <CatIcon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-bold text-foreground text-[13px]">{notif.title}</p>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-primary shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{notif.message}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className={`text-[10px] px-2 py-0 h-5 rounded-full font-semibold ${catConf.color}`}>
                      {catConf.label}
                    </Badge>
                    <span className="text-[11px] text-muted-foreground">{timeAgo(notif.timestamp)}</span>
                    {notif.read && (
                      <Check size={12} className="text-success ml-auto" />
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filtered.length === 0 && (
          <div className="card-xl p-10 text-center">
            <div className="w-14 h-14 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-3">
              <Bell size={24} className="text-success" />
            </div>
            <p className="font-semibold text-foreground text-sm">Aucune notification</p>
            <p className="text-xs text-muted-foreground mt-1">Tout est en ordre !</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alertes;
