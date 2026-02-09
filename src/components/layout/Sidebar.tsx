import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Wallet, 
  Settings, 
  BarChart3, 
  Package, 
  LogOut,
  LayoutDashboard,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import logoDefault from '@/assets/logo.png';

interface SidebarProps {
  isMobile?: boolean;
  onNavClick?: () => void;
}

const Sidebar = ({ isMobile = false, onNavClick }: SidebarProps) => {
  const { logout, user, hasAccess, logo: logoCustom } = useAuth();
  const navigate = useNavigate();

  const allNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', section: 'dashboard' },
    { icon: Users, label: 'Gestion des Utilisateurs', path: '/dashboard/utilisateurs', section: 'utilisateurs' },
    { icon: UserCheck, label: 'Clients', path: '/dashboard/clients', section: 'clients' },
    { icon: Wallet, label: 'Gestion Financière', path: '/dashboard/finance', section: 'finance' },
    { icon: Package, label: 'Gestion des Stocks', path: '/dashboard/stocks', section: 'stocks' },
    { icon: BarChart3, label: 'Rapports Avancés', path: '/dashboard/rapports', section: 'rapports' },
    { icon: Settings, label: 'Paramètres', path: '/dashboard/parametres', section: 'parametres' },
  ];

  const navItems = allNavItems.filter(item => hasAccess(item.section));

  const handleLogout = () => {
    onNavClick?.();
    logout();
    navigate('/');
  };

  const handleNavClick = () => {
    onNavClick?.();
  };

  return (
    <aside className={`${isMobile ? 'w-full h-full' : 'w-72 h-screen fixed left-0 top-0'} bg-card border-r border-border flex flex-col`}>
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <img src={user?.role === 'fermier' && logoCustom ? logoCustom : logoDefault} alt="Ferme Diallo" className="w-10 h-10 rounded-xl object-contain" />
          <div>
            <h1 className="font-bold text-base text-foreground">
              Ferme Diallo
            </h1>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role === 'fermier' ? 'Administrateur' : user?.role || 'Utilisateur'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            onClick={handleNavClick}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                isActive 
                  ? 'bg-success/10 text-success font-medium' 
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`
            }
          >
            <item.icon size={20} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Info & Logout */}
      <div className="p-4 border-t border-border">
        <p className="text-xs text-muted-foreground mb-1">Connecté en tant que</p>
        <p className="text-sm font-medium text-foreground mb-3">{user?.name || 'Utilisateur'}</p>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut size={18} />
          <span className="font-medium">Déconnexion</span>
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
