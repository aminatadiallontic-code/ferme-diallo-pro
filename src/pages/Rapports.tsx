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
  { label: 'Revenu annuel', value: '0 GNF', change: '0%', positive: true },
  { label: 'Profit net', value: '0 GNF', change: '0%', positive: true },
  { label: 'Marge moy.', value: '0%', change: '0%', positive: true },
  { label: 'Œufs produits', value: '0', change: '0%', positive: true },
];

const Rapports = () => {
  const formatAmount = (value: number) => (value / 1000000).toFixed(1) + 'M';
  const formatFull = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount) + ' GNF';

  const colorSuccess = 'hsl(160, 84%, 39%)';
  const colorDanger = 'hsl(0, 72%, 51%)';
  const colorMuted = 'hsl(220, 10%, 46%)';
  const colorGrid = 'hsl(220, 13%, 91%)';

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
    <div className="animate-slide-in space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Header title="Rapports" />
        <ExportBar onExportCSV={handleExportCSV} onPrint={handlePrint} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {statsCards.map((stat, index) => (
          <div key={index} className="stat-card">
            <p className="text-xs text-muted-foreground mb-0.5">{stat.label}</p>
            <p className="text-lg md:text-xl font-extrabold tracking-tight text-foreground">{stat.value}</p>
            <span className={`${stat.positive ? 'badge-success' : 'badge-danger'} mt-2`}>{stat.change}</span>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="card-xl p-5 md:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h2 className="text-sm font-bold text-foreground">Performance financière</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Revenus et dépenses sur 12 mois</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-success" /><span className="text-[11px] text-muted-foreground">Revenus</span></div>
            <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full bg-destructive" /><span className="text-[11px] text-muted-foreground">Dépenses</span></div>
          </div>
        </div>

        <div className="h-[260px] md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colorSuccess} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={colorSuccess} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDepenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={colorDanger} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={colorDanger} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={colorGrid} />
              <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{ fill: colorMuted, fontSize: 11 }} />
              <YAxis tickFormatter={formatAmount} axisLine={false} tickLine={false} tick={{ fill: colorMuted, fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: 'hsl(0, 0%, 100%)', border: 'none', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', padding: '10px 14px', fontSize: '12px' }} formatter={(value: number) => [formatFull(value)]} />
              <Area type="monotone" dataKey="revenus" stroke={colorSuccess} strokeWidth={2} fillOpacity={1} fill="url(#colorRevenus)" />
              <Area type="monotone" dataKey="depenses" stroke={colorDanger} strokeWidth={2} fillOpacity={1} fill="url(#colorDepenses)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Rapports;
