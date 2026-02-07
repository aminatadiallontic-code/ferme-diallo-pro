import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Settings, ChevronDown, Package, DollarSign, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title: string;
}

const notifications = [
  {
    id: 1,
    type: 'warning',
    icon: Package,
    title: 'Stock critique',
    message: 'Aliments en quantité basse',
    time: 'Il y a 2h',
  },
  {
    id: 2,
    type: 'success',
    icon: DollarSign,
    title: 'Vente confirmée',
    message: '500 œufs vendus à Dakar',
    time: 'Il y a 4h',
  },
  {
    id: 3,
    type: 'danger',
    icon: AlertTriangle,
    title: 'Vaccins expirés',
    message: '3 lots de vaccins à remplacer',
    time: 'Hier',
  },
];

const Header = ({ title }: HeaderProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [hasUnread, setHasUnread] = useState(true);

  const handleNotificationClick = () => {
    setHasUnread(false);
  };

  return (
    <header className="flex items-center justify-between mb-8">
      {/* Title */}
      <h1 className="text-4xl font-black tracking-tighter text-foreground">
        {title}
      </h1>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Settings Icon */}
        <Button
          variant="ghost"
          size="icon"
          className="btn-press"
          onClick={() => navigate('/dashboard/parametres')}
        >
          <Settings size={22} />
        </Button>

        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative btn-press"
              onClick={handleNotificationClick}
            >
              <Bell size={22} />
              {hasUnread && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-destructive rounded-full" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-2 rounded-2xl">
            <div className="px-3 py-2 border-b border-border mb-2">
              <h3 className="font-semibold text-foreground">Notifications</h3>
            </div>
            {notifications.map((notif) => (
              <DropdownMenuItem
                key={notif.id}
                className="flex items-start gap-3 p-3 rounded-xl cursor-pointer"
              >
                <div
                  className={`p-2 rounded-lg ${
                    notif.type === 'warning'
                      ? 'bg-warning/10 text-warning'
                      : notif.type === 'success'
                      ? 'bg-success/10 text-success'
                      : 'bg-destructive/10 text-destructive'
                  }`}
                >
                  <notif.icon size={16} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-sm">
                    {notif.title}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {notif.message}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {notif.time}
                  </p>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="flex items-center gap-3 btn-press">
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                  {user?.name?.split(' ').map(n => n[0]).join('') || 'MD'}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="font-medium text-foreground text-sm">
                  {user?.name || 'Mamadou Diallo'}
                </p>
                <p className="text-xs text-muted-foreground capitalize">
                  {user?.role || 'Fermier'}
                </p>
              </div>
              <ChevronDown size={16} className="text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 rounded-xl">
            <DropdownMenuItem className="rounded-lg" onClick={() => navigate('/dashboard/parametres')}>
              Paramètres
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
