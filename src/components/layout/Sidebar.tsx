import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  BarChart3, 
  Package, 
  Users, 
  LogOut 
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import logoFerme from '@/assets/logo-ferme.png';

const navItems = [
  { icon: LayoutDashboard, label: 'Finance', path: '/dashboard' },
  { icon: BarChart3, label: 'Rapports', path: '/dashboard/rapports' },
  { icon: Package, label: 'Stocks', path: '/dashboard/stocks' },
  { icon: Users, label: 'Équipe', path: '/dashboard/equipe' },
];

const Sidebar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <aside className="w-80 h-screen bg-card border-r border-border flex flex-col fixed left-0 top-0">
      {/* Logo */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center overflow-hidden">
            <img 
              src={logoFerme} 
              alt="FD" 
              className="w-10 h-10 object-contain"
            />
          </div>
          <div>
            <h1 className="font-black text-lg tracking-tighter text-foreground">
              Ferme Diallo
            </h1>
            <p className="text-xs text-muted-foreground">
              Gestion Avicole
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <item.icon size={20} />
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-border">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10 btn-press"
        >
          <LogOut size={20} />
          <span className="font-medium">Déconnexion</span>
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
