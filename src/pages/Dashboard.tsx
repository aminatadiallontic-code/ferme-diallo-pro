import { 
  TrendingUp, 
  Users, 
  Package, 
  Egg, 
  AlertTriangle, 
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart
} from 'lucide-react';
import { Navigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

// Sample data for charts and stats
const kpiData = [
  { label: 'Chiffre d\'affaires', value: '4.8M FCFA', change: '+18%', positive: true },
  { label: 'Clients actifs', value: '24', change: '+3', positive: true },
  { label: 'Stocks critiques', value: '3', change: '-1', positive: true },
  { label: 'Œufs produits/sem', value: '2 890', change: '+12%', positive: true },
];

const revenueData = [
  { mois: 'Jan', revenus: 650000, depenses: 400000 },
  { mois: 'Fév', revenus: 720000, depenses: 380000 },
  { mois: 'Mar', revenus: 580000, depenses: 420000 },
  { mois: 'Avr', revenus: 890000, depenses: 450000 },
  { mois: 'Mai', revenus: 940000, depenses: 520000 },
  { mois: 'Juin', revenus: 1020000, depenses: 480000 },
];

const productionData = [
  { jour: 'Lun', oeufs: 420 },
  { jour: 'Mar', oeufs: 380 },
  { jour: 'Mer', oeufs: 450 },
  { jour: 'Jeu', oeufs: 390 },
  { jour: 'Ven', oeufs: 470 },
  { jour: 'Sam', oeufs: 430 },
  { jour: 'Dim', oeufs: 350 },
];

const recentActivities = [
  { id: 1, type: 'vente', text: 'Vente de 500 œufs - Marché Dakar', time: 'Il y a 2h', icon: ShoppingCart, positive: true },
  { id: 2, type: 'stock', text: 'Stock aliments bas - 320kg restants', time: 'Il y a 4h', icon: AlertTriangle, positive: false },
  { id: 3, type: 'revenu', text: 'Paiement reçu - 450 000 FCFA', time: 'Il y a 6h', icon: ArrowUpRight, positive: true },
  { id: 4, type: 'depense', text: 'Achat vaccins - 75 000 FCFA', time: 'Hier', icon: ArrowDownRight, positive: false },
];

const alerts = [
  { id: 1, level: 'danger', text: '3 lots de vaccins expirent dans 5 jours' },
  { id: 2, level: 'warning', text: 'Stock d\'aliments pondeuses sous le seuil critique' },
  { id: 3, level: 'info', text: 'Production d\'œufs en hausse de 12% cette semaine' },
];

const Dashboard = () => {
  const { hasAccess } = useAuth();

  // Gestionnaire cannot access dashboard
  if (!hasAccess('dashboard')) {
    return <Navigate to="/dashboard/clients" replace />;
  }

  const formatAmount = (value: number) => {
    return (value / 1000000).toFixed(1) + 'M';
  };

  const kpis = [
    { label: 'Chiffre d\'affaires', value: '4.8M FCFA', change: '+18%', positive: true, icon: TrendingUp, color: 'success' },
    { label: 'Clients actifs', value: '24', change: '+3', positive: true, icon: Users, color: 'primary' },
    { label: 'Stocks critiques', value: '3', change: '-1', positive: true, icon: Package, color: 'warning' },
    { label: 'Œufs produits/sem', value: '2 890', change: '+12%', positive: true, icon: Egg, color: 'accent' },
  ];

  return (
    <div className="animate-slide-in">
      <Header title="Dashboard" />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi, index) => (
          <div key={index} className="stat-card">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 rounded-2xl bg-${kpi.color}/10`}>
                <kpi.icon className={`text-${kpi.color}`} size={22} />
              </div>
              <span className={kpi.positive ? 'badge-success' : 'badge-danger'}>
                {kpi.change}
              </span>
            </div>
            <p className="text-sm text-muted-foreground mb-1">{kpi.label}</p>
            <p className="text-2xl font-black tracking-tight text-foreground">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Revenue Chart */}
        <div className="card-xl p-4 md:p-6">
          <h3 className="text-lg font-bold text-foreground mb-1">Tendance financière</h3>
          <p className="text-sm text-muted-foreground mb-4">Revenus vs Dépenses (6 mois)</p>
          <div className="h-[200px] md:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="gradRevenu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradDepense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis tickFormatter={formatAmount} axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', padding: '12px 16px' }}
                  formatter={(value: number) => [new Intl.NumberFormat('fr-FR').format(value) + ' FCFA']}
                />
                <Area type="monotone" dataKey="revenus" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#gradRevenu)" />
                <Area type="monotone" dataKey="depenses" stroke="#F43F5E" strokeWidth={2} fillOpacity={1} fill="url(#gradDepense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Production Chart */}
        <div className="card-xl p-4 md:p-6">
          <h3 className="text-lg font-bold text-foreground mb-1">Production d'œufs</h3>
          <p className="text-sm text-muted-foreground mb-4">Cette semaine (plateaux)</p>
          <div className="h-[200px] md:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                <XAxis dataKey="jour" axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748B', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'white', border: 'none', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', padding: '12px 16px' }}
                />
                <Bar dataKey="oeufs" fill="hsl(160, 84%, 39%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Bottom Row: Alerts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-xl p-4 md:p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">⚠️ Alertes</h3>
          <div className="space-y-3">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-4 rounded-2xl ${
                  alert.level === 'danger'
                    ? 'bg-destructive/10 border border-destructive/20'
                    : alert.level === 'warning'
                    ? 'bg-warning/10 border border-warning/20'
                    : 'bg-success/10 border border-success/20'
                }`}
              >
                <p className={`text-sm font-medium ${
                  alert.level === 'danger'
                    ? 'text-destructive'
                    : alert.level === 'warning'
                    ? 'text-warning'
                    : 'text-success'
                }`}>
                  {alert.text}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="card-xl p-4 md:p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">📋 Activité récente</h3>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-center gap-4 p-3 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors">
                <div className={`p-2 rounded-xl ${activity.positive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                  <activity.icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{activity.text}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
