import { useMemo } from 'react';
import { Navigate } from 'react-router-dom';
import { ShoppingBag, UserCheck } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';

const ClientDashboard = () => {
  const { user } = useAuth();

  const displayName = useMemo(() => user?.name || 'Client', [user?.name]);

  if (!user) return <Navigate to="/" replace />;

  return (
    <div className="animate-slide-in space-y-6">
      <Header title="Mon espace" />

      <div className="card-xl p-5 md:p-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-success/10 text-success">
            <UserCheck size={18} />
          </div>
          <div>
            <p className="text-sm font-extrabold text-foreground">Bienvenue, {displayName}</p>
            <p className="text-xs text-muted-foreground">Compte: {user.email}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
              <ShoppingBag size={18} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground mb-0.5">Mes commandes</p>
          <p className="text-lg md:text-xl font-extrabold text-foreground">0</p>
          <p className="text-[11px] text-muted-foreground mt-1">(UI à compléter: liste des commandes client)</p>
        </div>

        <div className="stat-card">
          <p className="text-xs text-muted-foreground mb-0.5">Accès client</p>
          <p className="text-lg md:text-xl font-extrabold text-foreground">Mon espace</p>
          <p className="text-[11px] text-muted-foreground mt-1">
            Tu peux consulter ton tableau de bord client. Les pages admin (clients, stocks, finance, utilisateurs, rapports, alertes, paramètres) sont bloquées.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientDashboard;
