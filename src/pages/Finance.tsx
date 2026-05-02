import { useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, Plus, ArrowUpRight, ArrowDownRight, Receipt, Trash2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import ExportBar from '@/components/ExportBar';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { exportToCSV, printSection } from '@/lib/exportUtils';
import { api, type PaginatedResponse } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';

interface Transaction {
  id: number; type: 'revenu' | 'depense'; description: string;
  amount: number; date: string; category: string;
}

const Finance = () => {
  const { hasAccess } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({ type: 'revenu' as 'revenu' | 'depense', description: '', amount: '', category: '' });
  const [filterType, setFilterType] = useState<'all' | 'revenu' | 'depense'>('all');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterFrom, setFilterFrom] = useState('');
  const [filterTo, setFilterTo] = useState('');
  const queryClient = useQueryClient();

  if (!hasAccess('finance')) return <Navigate to="/dashboard/clients" replace />;

  const { data: transactionsResp } = useQuery({
    queryKey: ['transactions', filterType, filterCategory, filterFrom, filterTo],
    queryFn: () => {
      const params = new URLSearchParams();

      if (filterType !== 'all') params.set('type', filterType);
      if (filterCategory.trim()) params.set('category', filterCategory.trim());
      if (filterFrom) params.set('from', filterFrom);
      if (filterTo) params.set('to', filterTo);

      params.set('per_page', '200');

      return api.get<PaginatedResponse<Transaction>>(`/api/transactions?${params.toString()}`);
    },
  });

  const transactions = transactionsResp?.data ?? [];

  const createTransactionMutation = useMutation({
    mutationFn: (payload: { type: 'revenu' | 'depense'; description: string; amount: number; date: string; category: string }) =>
      api.post<Transaction>('/api/transactions', payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setNewTransaction({ type: 'revenu', description: '', amount: '', category: '' });
      setIsOpen(false);
    },
  });

  const deleteTransactionMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/transactions/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const totalRevenus = transactions.filter(t => t.type === 'revenu').reduce((sum, t) => sum + t.amount, 0);
  const totalDepenses = transactions.filter(t => t.type === 'depense').reduce((sum, t) => sum + t.amount, 0);
  const solde = totalRevenus - totalDepenses;
  const formatAmount = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount) + ' GNF';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTransactionMutation.mutate({
      type: newTransaction.type,
      description: newTransaction.description,
      amount: parseInt(newTransaction.amount),
      date: new Date().toISOString().split('T')[0],
      category: newTransaction.category,
    });
  };

  const handleExportCSV = () => {
    exportToCSV(transactions.map(t => ({
      Type: t.type === 'revenu' ? 'Revenu' : 'Dépense', Description: t.description,
      Montant: t.amount, Date: t.date, Catégorie: t.category,
    })), 'transactions_financieres');
  };

  const handlePrint = () => {
    printSection('Gestion Financière', `
      <div class="stats">
        <div class="stat-box"><div class="label">Revenus</div><div class="value positive">${formatAmount(totalRevenus)}</div></div>
        <div class="stat-box"><div class="label">Dépenses</div><div class="value negative">${formatAmount(totalDepenses)}</div></div>
        <div class="stat-box"><div class="label">Solde</div><div class="value ${solde >= 0 ? 'positive' : 'negative'}">${formatAmount(solde)}</div></div>
      </div>
      <table><thead><tr><th>Date</th><th>Type</th><th>Description</th><th>Catégorie</th><th>Montant</th></tr></thead><tbody>
        ${transactions.map(t => `<tr><td>${new Date(t.date).toLocaleDateString('fr-FR')}</td><td>${t.type === 'revenu' ? 'Revenu' : 'Dépense'}</td><td>${t.description}</td><td>${t.category}</td><td class="${t.type === 'revenu' ? 'positive' : 'negative'}">${t.type === 'revenu' ? '+' : '-'} ${formatAmount(t.amount)}</td></tr>`).join('')}
      </tbody></table>
    `);
  };

  return (
    <div className="animate-slide-in space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Header title="Finance" />
        <ExportBar onExportCSV={handleExportCSV} onPrint={handlePrint} />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-success/10"><TrendingUp className="text-success" size={20} /></div>
          </div>
          <p className="text-xs text-muted-foreground mb-0.5">Revenus</p>
          <p className="text-lg md:text-xl font-extrabold tracking-tight text-success">{formatAmount(totalRevenus)}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-destructive/10"><TrendingDown className="text-destructive" size={20} /></div>
          </div>
          <p className="text-xs text-muted-foreground mb-0.5">Dépenses</p>
          <p className="text-lg md:text-xl font-extrabold tracking-tight text-destructive">{formatAmount(totalDepenses)}</p>
        </div>
        <div className="stat-card">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-xl bg-primary/10"><Wallet className="text-primary" size={20} /></div>
          </div>
          <p className="text-xs text-muted-foreground mb-0.5">Solde</p>
          <p className={`text-lg md:text-xl font-extrabold tracking-tight ${solde >= 0 ? 'text-success' : 'text-destructive'}`}>{formatAmount(solde)}</p>
        </div>
      </div>

      {/* Transactions */}
      <div className="card-xl p-5 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-5">
          <h2 className="text-sm font-bold text-foreground">Historique des transactions</h2>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl btn-press gap-2 h-9 text-xs">
                <Plus size={16} />
                <span className="hidden sm:inline">Nouvelle transaction</span>
                <span className="sm:hidden">Ajouter</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl p-6">
              <DialogHeader>
                <DialogTitle className="text-lg font-extrabold tracking-tight">Ajouter une transaction</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4 mt-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Type</Label>
                  <Select value={newTransaction.type} onValueChange={(v: 'revenu' | 'depense') => setNewTransaction({ ...newTransaction, type: v })}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="revenu">Revenu</SelectItem><SelectItem value="depense">Dépense</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Description</Label>
                  <Input value={newTransaction.description} onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })} placeholder="Description" className="h-11 rounded-xl" required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Montant (GNF)</Label>
                  <Input type="number" value={newTransaction.amount} onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })} placeholder="0" className="h-11 rounded-xl" required />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Catégorie</Label>
                  <Select value={newTransaction.category} onValueChange={(v) => setNewTransaction({ ...newTransaction, category: v })}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ventes">Ventes</SelectItem><SelectItem value="Alimentation">Alimentation</SelectItem>
                      <SelectItem value="Santé">Santé</SelectItem><SelectItem value="Personnel">Personnel</SelectItem>
                      <SelectItem value="Équipement">Équipement</SelectItem><SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full h-11 rounded-xl font-semibold btn-press">Ajouter</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-5">
          <div className="space-y-1">
            <Label className="text-xs font-medium">Type</Label>
            <Select value={filterType} onValueChange={(v: 'all' | 'revenu' | 'depense') => setFilterType(v)}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="revenu">Revenu</SelectItem>
                <SelectItem value="depense">Dépense</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Catégorie</Label>
            <Input
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              placeholder="Ex: Ventes"
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Du</Label>
            <Input
              type="date"
              value={filterFrom}
              onChange={(e) => setFilterFrom(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>

          <div className="space-y-1">
            <Label className="text-xs font-medium">Au</Label>
            <Input
              type="date"
              value={filterTo}
              onChange={(e) => setFilterTo(e.target.value)}
              className="h-11 rounded-xl"
            />
          </div>

          <div className="md:col-span-4 flex justify-end">
            <Button
              variant="outline"
              className="rounded-xl"
              onClick={() => {
                setFilterType('all');
                setFilterCategory('');
                setFilterFrom('');
                setFilterTo('');
              }}
            >
              Réinitialiser
            </Button>
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><Receipt size={24} /></div>
            <p className="text-sm font-medium text-muted-foreground">Aucune transaction</p>
            <p className="text-xs text-muted-foreground mt-1">Ajoutez votre première transaction</p>
          </div>
        ) : (
          <div className="space-y-2">
            {transactions.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-3 md:p-4 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`p-2 rounded-lg shrink-0 ${t.type === 'revenu' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                    {t.type === 'revenu' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-[13px] truncate">{t.description}</p>
                    <p className="text-[11px] text-muted-foreground">{t.category} · {new Date(t.date).toLocaleDateString('fr-FR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className={`font-bold text-[13px] whitespace-nowrap ${t.type === 'revenu' ? 'text-success' : 'text-destructive'}`}>
                    {t.type === 'revenu' ? '+' : '-'} {formatAmount(t.amount)}
                  </p>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                    onClick={() => deleteTransactionMutation.mutate(t.id)}
                  >
                    <Trash2 size={15} />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Finance;
