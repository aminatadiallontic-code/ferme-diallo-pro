import { useState } from 'react';
import { TrendingUp, TrendingDown, Wallet, Plus, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface Transaction {
  id: number;
  type: 'revenu' | 'depense';
  description: string;
  amount: number;
  date: string;
  category: string;
}

const initialTransactions: Transaction[] = [
  { id: 1, type: 'revenu', description: 'Vente œufs - Marché Dakar', amount: 450000, date: '2024-01-28', category: 'Ventes' },
  { id: 2, type: 'depense', description: 'Achat aliments volaille', amount: 180000, date: '2024-01-27', category: 'Alimentation' },
  { id: 3, type: 'revenu', description: 'Vente poulets de chair', amount: 320000, date: '2024-01-26', category: 'Ventes' },
  { id: 4, type: 'depense', description: 'Vaccins et médicaments', amount: 75000, date: '2024-01-25', category: 'Santé' },
  { id: 5, type: 'depense', description: 'Salaires employés', amount: 200000, date: '2024-01-24', category: 'Personnel' },
  { id: 6, type: 'revenu', description: 'Vente poussins', amount: 150000, date: '2024-01-23', category: 'Ventes' },
];

const Finance = () => {
  const { hasAccess } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const [isOpen, setIsOpen] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: 'revenu' as 'revenu' | 'depense',
    description: '',
    amount: '',
    category: '',
  });

  if (!hasAccess('finance')) {
    return <Navigate to="/dashboard/clients" replace />;
  }

  const totalRevenus = transactions.filter(t => t.type === 'revenu').reduce((sum, t) => sum + t.amount, 0);
  const totalDepenses = transactions.filter(t => t.type === 'depense').reduce((sum, t) => sum + t.amount, 0);
  const solde = totalRevenus - totalDepenses;

  const formatAmount = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const transaction: Transaction = {
      id: Date.now(),
      type: newTransaction.type,
      description: newTransaction.description,
      amount: parseInt(newTransaction.amount),
      date: new Date().toISOString().split('T')[0],
      category: newTransaction.category,
    };
    setTransactions([transaction, ...transactions]);
    setNewTransaction({ type: 'revenu', description: '', amount: '', category: '' });
    setIsOpen(false);
  };

  return (
    <div className="animate-slide-in">
      <Header title="Finance" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 md:p-3 rounded-2xl bg-success/10">
              <TrendingUp className="text-success" size={22} />
            </div>
            <span className="badge-success">+12%</span>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mb-1">Revenus</p>
          <p className="text-xl md:text-2xl font-black tracking-tight text-success">{formatAmount(totalRevenus)}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 md:p-3 rounded-2xl bg-destructive/10">
              <TrendingDown className="text-destructive" size={22} />
            </div>
            <span className="badge-danger">-5%</span>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mb-1">Dépenses</p>
          <p className="text-xl md:text-2xl font-black tracking-tight text-destructive">{formatAmount(totalDepenses)}</p>
        </div>

        <div className="stat-card">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 md:p-3 rounded-2xl bg-primary/10">
              <Wallet className="text-primary" size={22} />
            </div>
            <span className={solde >= 0 ? 'badge-success' : 'badge-danger'}>
              {solde >= 0 ? 'Positif' : 'Négatif'}
            </span>
          </div>
          <p className="text-xs md:text-sm text-muted-foreground mb-1">Solde</p>
          <p className={`text-xl md:text-2xl font-black tracking-tight ${solde >= 0 ? 'text-success' : 'text-destructive'}`}>
            {formatAmount(solde)}
          </p>
        </div>
      </div>

      {/* Transactions */}
      <div className="card-xl p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
          <h2 className="text-lg md:text-xl font-bold text-foreground">
            Historique des transactions
          </h2>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-xl btn-press gap-2">
                <Plus size={18} />
                <span className="hidden sm:inline">Nouvelle transaction</span>
                <span className="sm:hidden">Ajouter</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl p-6 md:p-8">
              <DialogHeader>
                <DialogTitle className="text-xl md:text-2xl font-black tracking-tighter">
                  Ajouter une transaction
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-5 mt-4">
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select value={newTransaction.type} onValueChange={(value: 'revenu' | 'depense') => setNewTransaction({ ...newTransaction, type: value })}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenu">Revenu</SelectItem>
                      <SelectItem value="depense">Dépense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input value={newTransaction.description} onChange={(e) => setNewTransaction({ ...newTransaction, description: e.target.value })} placeholder="Description" className="h-12 rounded-xl" required />
                </div>
                <div className="space-y-2">
                  <Label>Montant (FCFA)</Label>
                  <Input type="number" value={newTransaction.amount} onChange={(e) => setNewTransaction({ ...newTransaction, amount: e.target.value })} placeholder="0" className="h-12 rounded-xl" required />
                </div>
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select value={newTransaction.category} onValueChange={(value) => setNewTransaction({ ...newTransaction, category: value })}>
                    <SelectTrigger className="h-12 rounded-xl"><SelectValue placeholder="Sélectionner" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ventes">Ventes</SelectItem>
                      <SelectItem value="Alimentation">Alimentation</SelectItem>
                      <SelectItem value="Santé">Santé</SelectItem>
                      <SelectItem value="Personnel">Personnel</SelectItem>
                      <SelectItem value="Équipement">Équipement</SelectItem>
                      <SelectItem value="Autre">Autre</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full h-12 rounded-xl font-semibold btn-press">Ajouter</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="flex items-center justify-between p-3 md:p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors gap-3">
              <div className="flex items-center gap-3 md:gap-4 min-w-0">
                <div className={`p-2 md:p-3 rounded-xl shrink-0 ${transaction.type === 'revenu' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'}`}>
                  {transaction.type === 'revenu' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-foreground text-sm md:text-base truncate">{transaction.description}</p>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    {transaction.category} • {new Date(transaction.date).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
              <p className={`font-bold text-sm md:text-base whitespace-nowrap ${transaction.type === 'revenu' ? 'text-success' : 'text-destructive'}`}>
                {transaction.type === 'revenu' ? '+' : '-'} {formatAmount(transaction.amount)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Finance;
