import { 
  TrendingUp, Users, Package, Egg, AlertTriangle,
  ArrowUpRight, ArrowDownRight, ShoppingCart, FileText
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
    { label: "Chiffre d'affaires", value: '0 GNF', change: '0%', positive: true, icon: TrendingUp, color: 'success' },
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
        ${revenueData.map(d => `<tr><td>${d.mois}</td><td class="positive">${new Intl.NumberFormat('fr-FR').format(d.revenus)} GNF</td><td class="negative">${new Intl.NumberFormat('fr-FR').format(d.depenses)} GNF</td><td class="positive">${new Intl.NumberFormat('fr-FR').format(d.revenus - d.depenses)} GNF</td></tr>`).join('')}
      </tbody></table>
    `;
    printSection('Dashboard - Ferme Diallo', statsHtml);
  };

  const colorSuccess = 'hsl(160, 84%, 39%)';
  const colorDanger = 'hsl(0, 72%, 51%)';
  const colorMuted = 'hsl(220, 10%, 46%)';
  const colorGrid = 'hsl(220, 13%, 91%)';

  return (
    <div className="animate-slide-in space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Header title="Dashboard" />
        <ExportBar onExportCSV={handleExportCSV} onPrint={handlePrint} />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {kpis.map((kpi, index) => (
          <div key={index} className="stat-card group">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-2.5 rounded-xl bg-${kpi.color}/10 group-hover:scale-105 transition-transform duration-300`}>
                <kpi.icon className={`text-${kpi.color}`} size={20} />
              </div>
              <span className={kpi.positive ? 'badge-success' : 'badge-danger'}>{kpi.change}</span>
            </div>
            <p className="text-xs text-muted-foreground mb-0.5">{kpi.label}</p>
            <p className="text-lg md:text-xl font-extrabold tracking-tight text-foreground">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card-xl p-5 md:p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-foreground">Tendance financière</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Revenus vs Dépenses</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-success" /><span className="text-[11px] text-muted-foreground">Revenus</span></div>
              <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-destructive" /><span className="text-[11px] text-muted-foreground">Dépenses</span></div>
            </div>
          </div>
          <div className="h-[200px] md:h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="gradRevenu" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colorSuccess} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={colorSuccess} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradDepense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={colorDanger} stopOpacity={0.2} />
                    <stop offset="95%" stopColor={colorDanger} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke={colorGrid} />
                <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{ fill: colorMuted, fontSize: 11 }} />
                <YAxis tickFormatter={formatAmount} axisLine={false} tickLine={false} tick={{ fill: colorMuted, fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(0, 0%, 100%)', border: 'none', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '10px 14px', fontSize: '12px' }} formatter={(value: number) => [new Intl.NumberFormat('fr-FR').format(value) + ' GNF']} />
                <Area type="monotone" dataKey="revenus" stroke={colorSuccess} strokeWidth={2} fillOpacity={1} fill="url(#gradRevenu)" />
                <Area type="monotone" dataKey="depenses" stroke={colorDanger} strokeWidth={2} fillOpacity={1} fill="url(#gradDepense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-xl p-5 md:p-6">
          <div className="mb-5">
            <h3 className="text-sm font-bold text-foreground">Production d'œufs</h3>
            <p className="text-xs text-muted-foreground mt-0.5">Cette semaine (plateaux)</p>
          </div>
          <div className="h-[200px] md:h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productionData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colorGrid} />
                <XAxis dataKey="jour" axisLine={false} tickLine={false} tick={{ fill: colorMuted, fontSize: 11 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: colorMuted, fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: 'hsl(0, 0%, 100%)', border: 'none', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '10px 14px', fontSize: '12px' }} />
                <Bar dataKey="oeufs" fill={colorSuccess} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Alerts + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card-xl p-5 md:p-6">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <AlertTriangle size={16} className="text-warning" /> Alertes
          </h3>
          {alerts.length === 0 ? (
            <div className="empty-state py-10">
              <div className="empty-state-icon"><AlertTriangle size={24} /></div>
              <p className="text-sm font-medium text-muted-foreground">Aucune alerte</p>
              <p className="text-xs text-muted-foreground mt-1">Tout fonctionne normalement</p>
            </div>
          ) : (
            <div className="space-y-2">
              {alerts.map((alert) => (
                <div key={alert.id} className={`p-3 rounded-xl transition-all ${
                  alert.level === 'danger' ? 'bg-destructive/5 border border-destructive/15' :
                  alert.level === 'warning' ? 'bg-warning/5 border border-warning/15' :
                  'bg-success/5 border border-success/15'
                }`}>
                  <p className={`text-xs font-medium ${
                    alert.level === 'danger' ? 'text-destructive' :
                    alert.level === 'warning' ? 'text-warning' : 'text-success'
                  }`}>{alert.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card-xl p-5 md:p-6">
          <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
            <FileText size={16} className="text-muted-foreground" /> Activité récente
          </h3>
          {recentActivities.length === 0 ? (
            <div className="empty-state py-10">
              <div className="empty-state-icon"><FileText size={24} /></div>
              <p className="text-sm font-medium text-muted-foreground">Aucune activité</p>
              <p className="text-xs text-muted-foreground mt-1">Les actions récentes apparaîtront ici</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 rounded-xl bg-secondary/60 hover:bg-secondary transition-colors">
                  <div className={`p-2 rounded-lg ${activity.positive ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                    <activity.icon size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{activity.text}</p>
                    <p className="text-[11px] text-muted-foreground">{activity.time}</p>
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
