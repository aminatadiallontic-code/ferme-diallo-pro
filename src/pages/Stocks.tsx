import { useState } from 'react';
import { Package, Pill, Egg, AlertTriangle, CheckCircle, Plus, Minus } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import chickenImg from '@/assets/chicken.png';

interface StockItem {
  id: number;
  name: string;
  category: 'aliments' | 'vaccins' | 'oeufs';
  quantity: number;
  unit: string;
  threshold: number;
  lastUpdate: string;
}

const initialStocks: StockItem[] = [
  { id: 1, name: 'Aliment croissance', category: 'aliments', quantity: 850, unit: 'kg', threshold: 500, lastUpdate: '2024-01-28' },
  { id: 2, name: 'Aliment pondeuses', category: 'aliments', quantity: 320, unit: 'kg', threshold: 400, lastUpdate: '2024-01-27' },
  { id: 3, name: 'Maïs concassé', category: 'aliments', quantity: 1200, unit: 'kg', threshold: 600, lastUpdate: '2024-01-26' },
  { id: 4, name: 'Vaccin Newcastle', category: 'vaccins', quantity: 45, unit: 'doses', threshold: 50, lastUpdate: '2024-01-25' },
  { id: 5, name: 'Vaccin Gumboro', category: 'vaccins', quantity: 120, unit: 'doses', threshold: 80, lastUpdate: '2024-01-24' },
  { id: 6, name: 'Antibiotiques', category: 'vaccins', quantity: 25, unit: 'flacons', threshold: 30, lastUpdate: '2024-01-23' },
  { id: 7, name: 'Œufs frais (plateau)', category: 'oeufs', quantity: 280, unit: 'plateaux', threshold: 100, lastUpdate: '2024-01-28' },
  { id: 8, name: 'Œufs calibrés gros', category: 'oeufs', quantity: 85, unit: 'plateaux', threshold: 50, lastUpdate: '2024-01-28' },
];

const categoryIcons = {
  aliments: Package,
  vaccins: Pill,
  oeufs: Egg,
};

const categoryLabels = {
  aliments: 'Aliments',
  vaccins: 'Vaccins',
  oeufs: 'Œufs',
};

const Stocks = () => {
  const [stocks, setStocks] = useState<StockItem[]>(initialStocks);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const getStatus = (item: StockItem) => {
    return item.quantity >= item.threshold ? 'optimal' : 'critique';
  };

  const filteredStocks = selectedCategory === 'all' 
    ? stocks 
    : stocks.filter(s => s.category === selectedCategory);

  const updateQuantity = (id: number, delta: number) => {
    setStocks(stocks.map(s => 
      s.id === id 
        ? { ...s, quantity: Math.max(0, s.quantity + delta), lastUpdate: new Date().toISOString().split('T')[0] }
        : s
    ));
  };

  const criticalCount = stocks.filter(s => getStatus(s) === 'critique').length;
  const optimalCount = stocks.filter(s => getStatus(s) === 'optimal').length;

  return (
    <div className="animate-slide-in">
      <div className="flex items-center justify-between">
        <Header title="Stocks" />
        <img src={chickenImg} alt="Poule" className="w-16 h-16 md:w-20 md:h-20 object-contain" />
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3 md:mb-4">
            <div className="p-2 md:p-3 rounded-2xl bg-success/10">
              <CheckCircle className="text-success" size={20} />
            </div>
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Optimal</p>
              <p className="text-xl md:text-2xl font-black text-success">{optimalCount}</p>
            </div>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">Stocks en bon état</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3 md:mb-4">
            <div className="p-2 md:p-3 rounded-2xl bg-destructive/10">
              <AlertTriangle className="text-destructive" size={20} />
            </div>
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Critique</p>
              <p className="text-xl md:text-2xl font-black text-destructive">{criticalCount}</p>
            </div>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">Réapprovisionnement requis</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3 md:mb-4">
            <div className="p-2 md:p-3 rounded-2xl bg-primary/10">
              <Package className="text-primary" size={20} />
            </div>
            <div>
              <p className="text-xs md:text-sm text-muted-foreground">Total</p>
              <p className="text-xl md:text-2xl font-black text-foreground">{stocks.length}</p>
            </div>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground">Articles en inventaire</p>
        </div>
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 md:gap-3 mb-6 flex-wrap">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          className="rounded-xl btn-press text-sm"
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
              className="rounded-xl btn-press gap-2 text-sm"
              onClick={() => setSelectedCategory(key)}
            >
              <Icon size={16} />
              {label}
            </Button>
          );
        })}
      </div>

      {/* Stock Items */}
      <div className="card-xl p-4 md:p-6">
        <div className="space-y-3 md:space-y-4">
          {filteredStocks.map((item) => {
            const status = getStatus(item);
            const Icon = categoryIcons[item.category];
            
            return (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
              >
                <div className="flex items-center gap-3 md:gap-4">
                  <div className={`p-2 md:p-3 rounded-xl shrink-0 ${
                    status === 'optimal' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                  }`}>
                    <Icon size={20} />
                  </div>
                  <div>
                    <p className="font-medium text-foreground text-sm md:text-base">{item.name}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      Seuil: {item.threshold} {item.unit}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 md:gap-4">
                  <div className="text-left sm:text-right">
                    <p className={`font-bold text-base md:text-lg ${
                      status === 'optimal' ? 'text-success' : 'text-destructive'
                    }`}>
                      {item.quantity} {item.unit}
                    </p>
                    <span className={status === 'optimal' ? 'badge-success' : 'badge-danger'}>
                      {status === 'optimal' ? 'Optimal' : 'Critique'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 rounded-lg btn-press"
                      onClick={() => updateQuantity(item.id, -10)}
                    >
                      <Minus size={14} />
                    </Button>
                    <Button
                      size="icon"
                      variant="outline"
                      className="h-8 w-8 rounded-lg btn-press"
                      onClick={() => updateQuantity(item.id, 10)}
                    >
                      <Plus size={14} />
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
