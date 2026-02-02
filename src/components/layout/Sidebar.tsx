import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Users, 
  Wallet, 
  Settings, 
  BarChart3, 
  Package, 
  LogOut,
  Home
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';

const navItems = [
  { icon: Users, label: 'Gestion des Utilisateurs', path: '/dashboard' },
  { icon: Wallet, label: 'Gestion Financière', path: '/dashboard/finance' },
  { icon: Settings, label: 'Paramètres du Système', path: '/dashboard/parametres' },
  { icon: BarChart3, label: 'Rapports Avancés', path: '/dashboard/rapports' },
  { icon: Package, label: 'Gestion des Stocks Maîtres', path: '/dashboard/stocks' },
];

const Sidebar = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

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
            <Home className="text-white" size={20} />
          </div>
          <div>
            <h1 className="font-bold text-base text-foreground">
              Ferme Diallo
            </h1>
            <p className="text-xs text-muted-foreground">
              Administrateur
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
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
        <p className="text-sm font-medium text-foreground mb-3">{user?.email || 'admin@gmail.com'}</p>
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
