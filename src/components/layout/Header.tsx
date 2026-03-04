import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Settings, Package, DollarSign, AlertTriangle, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useMobileSidebar } from '@/contexts/SidebarContext';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title: string;
}

const notifications = [
  { id: 1, type: 'warning', icon: Package, title: 'Stock critique', message: 'Aliments en quantité basse', time: 'Il y a 2h' },
  { id: 2, type: 'success', icon: DollarSign, title: 'Vente confirmée', message: '500 œufs vendus', time: 'Il y a 4h' },
  { id: 3, type: 'danger', icon: AlertTriangle, title: 'Vaccins expirés', message: '3 lots à remplacer', time: 'Hier' },
];

const Header = ({ title }: HeaderProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toggle: toggleSidebar } = useMobileSidebar();
  const [hasUnread, setHasUnread] = useState(true);

  return (
    <header className="flex items-center justify-between mb-6">
      <div className="flex items-center gap-3">
        {isMobile && toggleSidebar && (
          <Button variant="ghost" size="icon" className="btn-press -ml-2" onClick={toggleSidebar}>
            <Menu size={22} />
          </Button>
        )}
        <div>
          <h1 className="text-xl md:text-2xl font-extrabold tracking-tight text-foreground">
            {title}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {!isMobile && (
          <Button variant="ghost" size="icon" className="btn-press rounded-xl h-9 w-9" onClick={() => navigate('/dashboard/parametres')}>
            <Settings size={18} className="text-muted-foreground" />
          </Button>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative btn-press rounded-xl h-9 w-9" onClick={() => setHasUnread(false)}>
              <Bell size={18} className="text-muted-foreground" />
              {hasUnread && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full ring-2 ring-card" />
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 p-2 rounded-2xl">
            <div className="px-3 py-2 border-b border-border mb-1">
              <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
            </div>
            {notifications.map((notif) => (
              <DropdownMenuItem key={notif.id} className="flex items-start gap-3 p-3 rounded-xl cursor-pointer">
                <div className={`p-2 rounded-lg shrink-0 ${
                  notif.type === 'warning' ? 'bg-warning/10 text-warning' :
                  notif.type === 'success' ? 'bg-success/10 text-success' :
                  'bg-destructive/10 text-destructive'
                }`}>
                  <notif.icon size={14} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground text-[13px]">{notif.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{notif.message}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{notif.time}</p>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {!isMobile && (
          <div className="flex items-center gap-2 ml-1 pl-2 border-l border-border">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-success/10 text-success font-bold text-xs">
                {user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="text-left">
              <p className="font-semibold text-foreground text-[13px] leading-tight">
                {user?.name || 'Utilisateur'}
              </p>
              <p className="text-[11px] text-muted-foreground capitalize leading-tight">
                {user?.role === 'fermier' ? 'Admin' : user?.role || 'User'}
              </p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
