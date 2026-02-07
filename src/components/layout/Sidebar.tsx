import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Wallet, 
  Settings, 
  BarChart3, 
  Package, 
  LogOut,
  Home,
  LayoutDashboard,
  UserCheck
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const Sidebar = () => {
  const { logout, user, hasAccess } = useAuth();
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

  // Filter nav items based on role access
  const navItems = allNavItems.filter(item => hasAccess(item.section));

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="w-72 h-screen bg-card border-r border-border flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-5 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-success flex items-center justify-center">
            <Home className="text-success-foreground" size={20} />
          </div>
          <div>
            <h1 className="font-bold text-base text-foreground">
              Ferme Diallo
            </h1>
            <p className="text-xs text-muted-foreground capitalize">
              {user?.role || 'Fermier'}
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
