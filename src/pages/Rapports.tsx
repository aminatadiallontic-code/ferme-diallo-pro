import Header from '@/components/layout/Header';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { mois: 'Jan', revenus: 650000, depenses: 400000 },
  { mois: 'Fév', revenus: 720000, depenses: 380000 },
  { mois: 'Mar', revenus: 580000, depenses: 420000 },
  { mois: 'Avr', revenus: 890000, depenses: 450000 },
  { mois: 'Mai', revenus: 940000, depenses: 520000 },
  { mois: 'Juin', revenus: 1020000, depenses: 480000 },
  { mois: 'Juil', revenus: 870000, depenses: 390000 },
  { mois: 'Août', revenus: 980000, depenses: 440000 },
  { mois: 'Sep', revenus: 1150000, depenses: 510000 },
  { mois: 'Oct', revenus: 1080000, depenses: 470000 },
  { mois: 'Nov', revenus: 920000, depenses: 420000 },
  { mois: 'Déc', revenus: 1200000, depenses: 550000 },
];

const statsCards = [
  { label: 'Revenu annuel', value: '11.000.000 FCFA', change: '+18%', positive: true },
  { label: 'Profit net', value: '5.440.000 FCFA', change: '+22%', positive: true },
  { label: 'Marge moyenne', value: '49%', change: '+5%', positive: true },
  { label: 'Œufs produits', value: '48.500', change: '+8%', positive: true },
];

const Rapports = () => {
  const formatAmount = (value: number) => {
    return (value / 1000000).toFixed(1) + 'M';
  };

  return (
    <div className="animate-slide-in">
      <Header title="Rapports" />

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statsCards.map((stat, index) => (
          <div key={index} className="stat-card">
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-xl font-black tracking-tight text-foreground">
              {stat.value}
            </p>
            <span className={stat.positive ? 'badge-success mt-2' : 'badge-danger mt-2'}>
              {stat.change}
            </span>
          </div>
        ))}
      </div>

      {/* Main Chart */}
      <div className="card-xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-foreground">
              Performance financière
            </h2>
            <p className="text-sm text-muted-foreground">
              Revenus et dépenses sur 12 mois
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-success" />
              <span className="text-sm text-muted-foreground">Revenus</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-destructive" />
              <span className="text-sm text-muted-foreground">Dépenses</span>
            </div>
          </div>
        </div>

        <div className="h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenus" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDepenses" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
              <XAxis 
                dataKey="mois" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 12 }}
              />
              <YAxis 
                tickFormatter={formatAmount}
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#64748B', fontSize: 12 }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: 'none',
                  borderRadius: '16px',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                  padding: '12px 16px',
                }}
                formatter={(value: number) => [
                  new Intl.NumberFormat('fr-FR').format(value) + ' FCFA',
                ]}
              />
              <Area
                type="monotone"
                dataKey="revenus"
                stroke="#10B981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorRevenus)"
              />
              <Area
                type="monotone"
                dataKey="depenses"
                stroke="#F43F5E"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorDepenses)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Rapports;
