import { useState } from 'react';
import { Package, Pill, Egg, AlertTriangle, CheckCircle, Plus, Minus, Archive } from 'lucide-react';
import Header from '@/components/layout/Header';
import ExportBar from '@/components/ExportBar';
import { Button } from '@/components/ui/button';
import { exportToCSV, printSection } from '@/lib/exportUtils';
import { api, type PaginatedResponse } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import StockForm from '@/components/StockForm';

interface StockItem {
  id: number; name: string; category: 'aliments' | 'vaccins' | 'oeufs';
  quantity: number; unit: string; threshold: number; last_update: string | null;
}

const categoryIcons = { aliments: Package, vaccins: Pill, oeufs: Egg };
const categoryLabels = { aliments: 'Aliments', vaccins: 'Vaccins', oeufs: 'Œufs' };

const Stocks = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const queryClient = useQueryClient();

  const { data: stocksResp } = useQuery({
    queryKey: ['stock-items'],
    queryFn: () => api.get<PaginatedResponse<StockItem>>('/api/stock-items'),
  });

  const stocks = stocksResp?.data ?? [];

  const updateStockMutation = useMutation({
    mutationFn: (payload: { id: number; quantity: number }) =>
      api.patch<StockItem>(`/api/stock-items/${payload.id}/quantity`, {
        quantity: payload.quantity,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['stock-items'] });
    },
  });

  const getStatus = (item: StockItem) => item.quantity >= item.threshold ? 'optimal' : 'critique';
  const filteredStocks = selectedCategory === 'all' ? stocks : stocks.filter(s => s.category === selectedCategory);

  const updateQuantity = (id: number, delta: number) => {
    const item = stocks.find(s => s.id === id);
    if (!item) return;
    const nextQty = Math.max(0, item.quantity + delta);
    updateStockMutation.mutate({ id, quantity: nextQty });
  };

  const criticalCount = stocks.filter(s => getStatus(s) === 'critique').length;
  const optimalCount = stocks.filter(s => getStatus(s) === 'optimal').length;

  const handleExportCSV = () => {
    exportToCSV(stocks.map(s => ({
      Nom: s.name, Catégorie: categoryLabels[s.category], Quantité: s.quantity,
      Unité: s.unit, Seuil: s.threshold, Statut: getStatus(s) === 'optimal' ? 'Optimal' : 'Critique',
      'Dernière MAJ': s.last_update || '-',
    })), 'stocks');
  };

  const handlePrint = () => {
    printSection('Inventaire des Stocks', `
      <div class="stats">
        <div class="stat-box"><div class="label">Optimal</div><div class="value positive">${optimalCount}</div></div>
        <div class="stat-box"><div class="label">Critique</div><div class="value negative">${criticalCount}</div></div>
        <div class="stat-box"><div class="label">Total articles</div><div class="value">${stocks.length}</div></div>
      </div>
      <table><thead><tr><th>Article</th><th>Catégorie</th><th>Quantité</th><th>Seuil</th><th>Statut</th></tr></thead><tbody>
        ${stocks.map(s => `<tr><td>${s.name}</td><td>${categoryLabels[s.category]}</td><td>${s.quantity} ${s.unit}</td><td>${s.threshold} ${s.unit}</td><td class="${getStatus(s) === 'optimal' ? 'positive' : 'negative'}">${getStatus(s) === 'optimal' ? 'Optimal' : 'Critique'}</td></tr>`).join('')}
      </tbody></table>
    `);
  };

  return (
    <div className="animate-slide-in space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Header title="Stocks" />
        <div className="flex items-center gap-3">
          <Button 
            onClick={() => setShowAddForm(true)}
            className="rounded-xl btn-press text-xs h-9"
          >
            <Plus size={14} className="mr-2" />
            Ajouter un article
          </Button>
          <ExportBar onExportCSV={handleExportCSV} onPrint={handlePrint} />
        </div>
      </div>

      {/* Add Stock Form */}
      {showAddForm && (
        <div className="flex justify-center">
          <StockForm 
            onSuccess={() => setShowAddForm(false)}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-success/10"><CheckCircle className="text-success" size={18} /></div>
          </div>
          <p className="text-xs text-muted-foreground mb-0.5">Optimal</p>
          <p className="text-lg md:text-xl font-extrabold text-success">{optimalCount}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-destructive/10"><AlertTriangle className="text-destructive" size={18} /></div>
          </div>
          <p className="text-xs text-muted-foreground mb-0.5">Critique</p>
          <p className="text-lg md:text-xl font-extrabold text-destructive">{criticalCount}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-primary/10"><Archive className="text-primary" size={18} /></div>
          </div>
          <p className="text-xs text-muted-foreground mb-0.5">Total articles</p>
          <p className="text-lg md:text-xl font-extrabold text-foreground">{stocks.length}</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 flex-wrap">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          className="rounded-xl btn-press text-xs h-9"
          onClick={() => setSelectedCategory('all')}
        >
          Tous
        </Button>
        {Object.entries(categoryLabels).map(([key, label]) => {
          const Icon = categoryIcons[key as keyof typeof categoryIcons];
          return (
            <Button
              key={key}
              variant={selectedCategory === key ? 'default' : 'outline'}
              className="rounded-xl btn-press gap-2 text-xs h-9"
              onClick={() => setSelectedCategory(key)}
            >
              <Icon size={14} />{label}
            </Button>
          );
        })}
      </div>

      {/* Stock Items */}
      <div className="card-xl p-5 md:p-6">
        <div className="space-y-2">
          {filteredStocks.map((item) => {
            const status = getStatus(item);
            const Icon = categoryIcons[item.category];
            const percentage = Math.min(100, Math.round((item.quantity / item.threshold) * 100));
            return (
              <div key={item.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-colors">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`p-2.5 rounded-xl shrink-0 ${status === 'optimal' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                    <Icon size={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-foreground text-[13px]">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="flex-1 max-w-[120px] h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${status === 'optimal' ? 'bg-success' : 'bg-destructive'}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-[11px] text-muted-foreground">{percentage}%</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between sm:justify-end gap-3">
                  <div className="text-left sm:text-right">
                    <p className={`font-bold text-sm ${status === 'optimal' ? 'text-success' : 'text-destructive'}`}>
                      {item.quantity} <span className="text-xs font-normal text-muted-foreground">{item.unit}</span>
                    </p>
                    <span className={status === 'optimal' ? 'badge-success' : 'badge-danger'}>
                      {status === 'optimal' ? 'Optimal' : 'Critique'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button size="icon" variant="outline" className="h-8 w-8 rounded-lg btn-press" onClick={() => updateQuantity(item.id, -10)}>
                      <Minus size={13} />
                    </Button>
                    <Button size="icon" variant="outline" className="h-8 w-8 rounded-lg btn-press" onClick={() => updateQuantity(item.id, 10)}>
                      <Plus size={13} />
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Stocks;
