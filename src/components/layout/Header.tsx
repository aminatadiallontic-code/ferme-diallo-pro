import { useNavigate } from 'react-router-dom';
import { Bell, Settings, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNotifications } from '@/contexts/NotificationContext';
import { useMobileSidebar } from '@/contexts/SidebarContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  title: string;
}

const Header = ({ title }: HeaderProps) => {
  const { user } = useAuth();
  const { unreadCount } = useNotifications();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const { toggle: toggleSidebar } = useMobileSidebar();

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

        <Button
          variant="ghost"
          size="icon"
          className="relative btn-press rounded-xl h-9 w-9"
          onClick={() => navigate('/dashboard/alertes')}
        >
          <Bell size={18} className="text-muted-foreground" />
          {unreadCount > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center bg-destructive text-destructive-foreground text-[10px] font-bold rounded-full px-1 ring-2 ring-card">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </Button>

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
