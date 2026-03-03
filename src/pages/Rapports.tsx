import Header from '@/components/layout/Header';
import ExportBar from '@/components/ExportBar';
import { exportToCSV, printSection } from '@/lib/exportUtils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { mois: 'Jan', revenus: 0, depenses: 0 },
  { mois: 'Fév', revenus: 0, depenses: 0 },
  { mois: 'Mar', revenus: 0, depenses: 0 },
  { mois: 'Avr', revenus: 0, depenses: 0 },
  { mois: 'Mai', revenus: 0, depenses: 0 },
  { mois: 'Juin', revenus: 0, depenses: 0 },
  { mois: 'Juil', revenus: 0, depenses: 0 },
  { mois: 'Août', revenus: 0, depenses: 0 },
  { mois: 'Sep', revenus: 0, depenses: 0 },
  { mois: 'Oct', revenus: 0, depenses: 0 },
  { mois: 'Nov', revenus: 0, depenses: 0 },
  { mois: 'Déc', revenus: 0, depenses: 0 },
];

const statsCards = [
  { label: 'Revenu annuel', value: '0 FCFA', change: '0%', positive: true },
  { label: 'Profit net', value: '0 FCFA', change: '0%', positive: true },
  { label: 'Marge moy.', value: '0%', change: '0%', positive: true },
  { label: 'Œufs produits', value: '0', change: '0%', positive: true },
];

const Rapports = () => {
  const formatAmount = (value: number) => (value / 1000000).toFixed(1) + 'M';
  const formatFull = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';

  const handleExportCSV = () => {
    exportToCSV(data.map(d => ({
      Mois: d.mois, Revenus: d.revenus, Dépenses: d.depenses, Profit: d.revenus - d.depenses,
    })), 'rapport_annuel');
  };

  const handlePrint = () => {
    printSection('Rapport Annuel - Performance Financière', `
      <div class="stats">
        ${statsCards.map(s => `<div class="stat-box"><div class="label">${s.label}</div><div class="value positive">${s.value} (${s.change})</div></div>`).join('')}
      </div>
      <table><thead><tr><th>Mois</th><th>Revenus</th><th>Dépenses</th><th>Profit</th></tr></thead><tbody>
        ${data.map(d => `<tr><td>${d.mois}</td><td class="positive">${formatFull(d.revenus)}</td><td class="negative">${formatFull(d.depenses)}</td><td class="positive">${formatFull(d.revenus - d.depenses)}</td></tr>`).join('')}
      </tbody></table>
    `);
  };

  return (
    <div className="animate-slide-in">
      <div className="flex items-center justify-between gap-3 mb-2">
        <Header title="Rapports" />
        <ExportBar onExportCSV={handleExportCSV} onPrint={handlePrint} />
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        {statsCards.map((stat, index) => (
          <div key={index} className="stat-card hover:shadow-lg hover:-translate-y-0.5 transition-all">
            <p className="text-xs md:text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-lg md:text-xl font-black tracking-tight text-foreground">{stat.value}</p>
            <span className={stat.positive ? 'badge-success mt-2' : 'badge-danger mt-2'}>{stat.change}</span>
          </div>
        ))}
      </div>

      {/* Main Chart */}
      <div className="card-xl p-4 md:p-6 hover:shadow-lg transition-shadow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-foreground">Performance financière</h2>
            <p className="text-sm text-muted-foreground">Revenus et dépenses sur 12 mois</p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-success" /><span className="text-xs md:text-sm text-muted-foreground">Revenus</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-destructive" /><span className="text-xs md:text-sm text-muted-foreground">Dépenses</span></div>
          </div>
        </div>

        <div className="h-[280px] md:h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(160, 84%, 39%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDepenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(350, 89%, 60%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(350, 89%, 60%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 32%, 91%)" />
              <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 11 }} />
              <YAxis tickFormatter={formatAmount} axisLine={false} tickLine={false} tick={{ fill: 'hsl(215, 16%, 47%)', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(0, 0%, 100%)', border: 'none', borderRadius: '16px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', padding: '12px 16px' }} formatter={(value: number) => [formatFull(value)]} />
              <Area type="monotone" dataKey="revenus" stroke="hsl(160, 84%, 39%)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenus)" />
              <Area type="monotone" dataKey="depenses" stroke="hsl(350, 89%, 60%)" strokeWidth={3} fillOpacity={1} fill="url(#colorDepenses)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Rapports;
