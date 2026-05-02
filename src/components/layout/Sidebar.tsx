import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Users, Wallet, Settings, BarChart3, Package, LogOut,
  LayoutDashboard, UserCheck, Bell, ShoppingCart
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
    { icon: Users, label: 'Utilisateurs', path: '/dashboard/utilisateurs', section: 'utilisateurs' },
    { icon: UserCheck, label: 'Clients', path: '/dashboard/clients', section: 'clients' },
    { icon: ShoppingCart, label: 'Commandes', path: '/dashboard/commandes', section: 'commandes' },
    { icon: Wallet, label: 'Finance', path: '/dashboard/finance', section: 'finance' },
    { icon: Package, label: 'Stocks', path: '/dashboard/stocks', section: 'stocks' },
    { icon: BarChart3, label: 'Rapports', path: '/dashboard/rapports', section: 'rapports' },
    { icon: Bell, label: 'Alertes', path: '/dashboard/alertes', section: 'alertes' },
    { icon: Settings, label: 'Paramètres', path: '/dashboard/parametres', section: 'parametres' },
  ];

  const navItems = allNavItems.filter(item => hasAccess(item.section));

  const handleLogout = async () => {
    onNavClick?.();
    await logout();
    navigate('/');
  };

  return (
    <aside className={`${isMobile ? 'w-full h-full' : 'w-[260px] h-screen fixed left-0 top-0'} bg-sidebar flex flex-col`}>
      {/* Logo */}
      <div className="px-5 pt-6 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-sidebar-accent flex items-center justify-center overflow-hidden shrink-0">
            <img
              src={user?.role === 'fermier' && logoCustom ? logoCustom : logoDefault}
              alt="Logo"
              className="w-7 h-7 object-contain"
            />
          </div>
          <div>
            <h1 className="font-bold text-[15px] text-sidebar-primary-foreground leading-tight">
              Ferme Diallo
            </h1>
            <p className="text-[11px] text-sidebar-muted capitalize leading-tight mt-0.5">
              {user?.role === 'fermier' ? 'Administrateur' : user?.role === 'gestionnaire' ? 'Gestionnaire' : user?.role === 'client' ? 'Client' : user?.role || 'Utilisateur'}
            </p>
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="mx-5 h-px bg-sidebar-border mb-2" />

      {/* Navigation */}
      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        <p className="px-3 pt-2 pb-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-sidebar-muted">
          Menu principal
        </p>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/dashboard'}
            onClick={onNavClick}
            className={({ isActive }) =>
              `group flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-success/20'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`
            }
          >
            <item.icon size={18} className="shrink-0" />
            <span className="flex-1">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User Footer */}
      <div className="mx-3 mb-3 p-3 rounded-xl bg-sidebar-accent">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground text-xs font-bold shrink-0">
            {user?.name?.split(' ').map(n => n[0]).join('').slice(0, 2) || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-semibold text-sidebar-accent-foreground truncate">
              {user?.name || 'Utilisateur'}
            </p>
            <p className="text-[11px] text-sidebar-muted truncate">
              {user?.email || ''}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full h-9 justify-start gap-2 text-xs font-medium rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 px-3"
        >
          <LogOut size={15} />
          Déconnexion
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
