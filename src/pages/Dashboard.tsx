import { 
  TrendingUp, Users, Package, Egg, AlertTriangle,
  ArrowUpRight, ArrowDownRight, ShoppingCart
} from 'lucide-react';
import { Navigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import ExportBar from '@/components/ExportBar';
import { useAuth } from '@/contexts/AuthContext';
import { exportToCSV, printSection } from '@/lib/exportUtils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const revenueData = [
  { mois: 'Jan', revenus: 0, depenses: 0 },
  { mois: 'Fév', revenus: 0, depenses: 0 },
  { mois: 'Mar', revenus: 0, depenses: 0 },
  { mois: 'Avr', revenus: 0, depenses: 0 },
  { mois: 'Mai', revenus: 0, depenses: 0 },
  { mois: 'Juin', revenus: 0, depenses: 0 },
];

const productionData = [
  { jour: 'Lun', oeufs: 0 },
  { jour: 'Mar', oeufs: 0 },
  { jour: 'Mer', oeufs: 0 },
  { jour: 'Jeu', oeufs: 0 },
  { jour: 'Ven', oeufs: 0 },
  { jour: 'Sam', oeufs: 0 },
  { jour: 'Dim', oeufs: 0 },
];

const recentActivities: { id: number; text: string; time: string; icon: any; positive: boolean }[] = [];

const alerts: { id: number; level: string; text: string }[] = [];

const Dashboard = () => {
  const { hasAccess } = useAuth();

  if (!hasAccess('dashboard')) {
    return <Navigate to="/dashboard/clients" replace />;
  }

  const formatAmount = (value: number) => (value / 1000000).toFixed(1) + 'M';

  const kpis = [
    { label: 'Chiffre d\'affaires', value: '0 FCFA', change: '0%', positive: true, icon: TrendingUp, color: 'success' },
    { label: 'Clients actifs', value: '0', change: '0', positive: true, icon: Users, color: 'primary' },
    { label: 'Stocks critiques', value: '0', change: '0', positive: true, icon: Package, color: 'warning' },
    { label: 'Œufs produits/sem', value: '0', change: '0%', positive: true, icon: Egg, color: 'accent' },
  ];

  const handleExportCSV = () => {
    exportToCSV(revenueData.map(d => ({
      Mois: d.mois, Revenus: d.revenus, Dépenses: d.depenses, Profit: d.revenus - d.depenses
    })), 'dashboard_finances');
  };

  const handlePrint = () => {
    const statsHtml = `
      <div class="stats">
        ${kpis.map(k => `<div class="stat-box"><div class="label">${k.label}</div><div class="value ${k.positive ? 'positive' : 'negative'}">${k.value}</div></div>`).join('')}
      </div>
      <table><thead><tr><th>Mois</th><th>Revenus</th><th>Dépenses</th><th>Profit</th></tr></thead><tbody>
        ${revenueData.map(d => `<tr><td>${d.mois}</td><td class="positive">${new Intl.NumberFormat('fr-FR').format(d.revenus)} FCFA</td><td class="negative">${new Intl.NumberFormat('fr-FR').format(d.depenses)} FCFA</td><td class="positive">${new Intl.NumberFormat('fr-FR').format(d.revenus - d.depenses)} FCFA</td></tr>`).join('')}
      </tbody></table>
    `;
    printSection('Dashboard - Ferme Diallo', statsHtml);
  };

  return (
    <div className="animate-slide-in">
      <div className="flex items-center justify-between gap-3 mb-2">
        <Header title="Dashboard" />
        <ExportBar onExportCSV={handleExportCSV} onPrint={handlePrint} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        {kpis.map((kpi, index) => (
          <div key={index} className="stat-card group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-3 rounded-2xl bg-${kpi.color}/10 group-hover:scale-110 transition-transform`}>
                <kpi.icon className={`text-${kpi.color}`} size={22} />
              </div>
              <span className={kpi.positive ? 'badge-success' : 'badge-danger'}>{kpi.change}</span>
            </div>
            <p className="text-xs md:text-sm text-muted-foreground mb-1">{kpi.label}</p>
            <p className="text-xl md:text-2xl font-black tracking-tight text-foreground">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-8">
        <div className="card-xl p-4 md:p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-bold text-foreground mb-1">Tendance financière</h3>
          <p className="text-sm text-muted-foreground mb-4">Revenus vs Dépenses (6 mois)</p>
          <div className="h-[200px] md:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="gradRevenu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradDepense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(350, 89%, 60%)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(350, 89%, 60%)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
                <YAxis tickFormatter={formatAmount} axisLine={false} tickLine={false} tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(0, 0%, 100%)', border: 'none', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', padding: '12px 16px' }} formatter={(value: number) => [new Intl.NumberFormat('fr-FR').format(value) + ' FCFA']} />
                <Area type="monotone" dataKey="revenus" stroke="hsl(160, 84%, 39%)" strokeWidth={2.5} fillOpacity={1} fill="url(#gradRevenu)" />
                <Area type="monotone" dataKey="depenses" stroke="hsl(350, 89%, 60%)" strokeWidth={2.5} fillOpacity={1} fill="url(#gradDepense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-xl p-4 md:p-6 hover:shadow-lg transition-shadow">
          <h3 className="text-lg font-bold text-foreground mb-1">Production d'œufs</h3>
          <p className="text-sm text-muted-foreground mb-4">Cette semaine (plateaux)</p>
          <div className="h-[200px] md:h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
                <XAxis dataKey="jour" axisLine={false} tickLine={false} tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 12 }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(0, 0%, 100%)', border: 'none', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', padding: '12px 16px' }} />
                <Bar dataKey="oeufs" fill="hsl(160, 84%, 39%)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alerts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <div className="card-xl p-4 md:p-6">
          <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-warning" /> Alertes
          </h3>
          {alerts.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Aucune alerte pour le moment</p>
          ) : (
            <div className="space-y-3">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-4 rounded-2xl transition-all hover:scale-[1.01] ${
                  alert.level === 'danger' ? 'bg-destructive/10 border border-destructive/20' :
                  alert.level === 'warning' ? 'bg-warning/10 border border-warning/20' :
                  'bg-success/10 border border-success/20'
                }`}>
                  <p className={`text-sm font-medium ${
                    alert.level === 'danger' ? 'text-destructive' :
                    alert.level === 'warning' ? 'text-warning' : 'text-success'
                  }`}>{alert.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-xl p-4 md:p-6">
          <h3 className="text-lg font-bold text-foreground mb-4">📋 Activité récente</h3>
          {recentActivities.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Aucune activité récente</p>
          ) : (
            <div className="space-y-3">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 rounded-2xl bg-secondary/50 hover:bg-secondary transition-all hover:scale-[1.01]">
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
