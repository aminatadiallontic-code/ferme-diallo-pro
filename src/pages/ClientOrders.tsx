import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle2, Plus, ShoppingBag } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api, type PaginatedResponse } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';

interface Client {
  id: number;
  name: string;
  phone: string;
}

interface StockItem {
  id: number;
  name: string;
  category: 'aliments' | 'vaccins' | 'oeufs';
  quantity: number;
  unit: string;
}

interface OrderItem {
  id: number;
  stock_item_id: number;
  stock_item?: { id: number; name: string; unit: string };
  quantity: number;
  unit_price: number;
  line_total: number;
}

interface Order {
  id: number;
  client_id: number;
  order_date: string;
  status: 'brouillon' | 'confirmee' | 'annulee';
  total_amount: number;
  items: OrderItem[];
}

const formatAmount = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount) + ' GNF';

const ClientOrders = () => {
  const { id } = useParams();
  const clientId = Number(id);
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [open, setOpen] = useState(false);
  const [newOrderDate, setNewOrderDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [newItem, setNewItem] = useState({ stock_item_id: '', quantity: '1', unit_price: '0' });
  const [items, setItems] = useState<Array<{ stock_item_id: number; quantity: number; unit_price: number }>>([]);

  const { data: client } = useQuery({
    queryKey: ['client', clientId],
    queryFn: () => api.get<Client>(`/api/clients/${clientId}`),
    enabled: Number.isFinite(clientId) && clientId > 0,
  });

  const { data: stockResp } = useQuery({
    queryKey: ['stock-items', 'orders'],
    queryFn: () => api.get<PaginatedResponse<StockItem>>('/api/stock-items?per_page=200'),
  });

  const stocks = stockResp?.data ?? [];

  const { data: ordersResp } = useQuery({
    queryKey: ['orders', clientId],
    queryFn: () => api.get<PaginatedResponse<Order>>(`/api/orders?client_id=${clientId}&per_page=200`),
    enabled: Number.isFinite(clientId) && clientId > 0,
  });

  const orders = ordersResp?.data ?? [];

  const selectedStock = useMemo(() => {
    const sid = Number(newItem.stock_item_id);
    return stocks.find(s => s.id === sid) ?? null;
  }, [newItem.stock_item_id, stocks]);

  const addItem = () => {
    const stockId = Number(newItem.stock_item_id);
    const quantity = Number(newItem.quantity);
    const unitPrice = Number(newItem.unit_price);

    if (!stockId || !Number.isFinite(stockId)) return;
    if (!Number.isFinite(quantity) || quantity <= 0) return;
    if (!Number.isFinite(unitPrice) || unitPrice < 0) return;

    setItems(prev => {
      const existing = prev.find(i => i.stock_item_id === stockId);
      if (existing) {
        return prev.map(i => i.stock_item_id === stockId
          ? { ...i, quantity: i.quantity + quantity, unit_price: unitPrice }
          : i);
      }
      return [...prev, { stock_item_id: stockId, quantity, unit_price: unitPrice }];
    });

    setNewItem({ stock_item_id: '', quantity: '1', unit_price: '0' });
  };

  const removeItem = (stockItemId: number) => {
    setItems(prev => prev.filter(i => i.stock_item_id !== stockItemId));
  };

  const createOrderMutation = useMutation({
    mutationFn: (payload: { client_id: number; order_date: string; items: Array<{ stock_item_id: number; quantity: number; unit_price: number }> }) =>
      api.post<Order>('/api/orders', payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['orders', clientId] });
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
      setItems([]);
      setNewOrderDate(new Date().toISOString().split('T')[0]);
      setOpen(false);
      toast({ title: 'Commande créée', description: 'Commande enregistrée en brouillon.' });
    },
    onError: (err: unknown) => {
      toast({ title: 'Erreur', description: err instanceof Error ? err.message : String(err), variant: 'destructive' });
    },
  });

  const confirmOrderMutation = useMutation({
    mutationFn: (orderId: number) => api.post<Order>(`/api/orders/${orderId}/confirm`, {}),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['orders', clientId] });
      await queryClient.invalidateQueries({ queryKey: ['stock-items'] });
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast({ title: 'Commande confirmée', description: 'Stock mis à jour.' });
    },
    onError: (err: unknown) => {
      toast({ title: 'Erreur', description: err instanceof Error ? err.message : String(err), variant: 'destructive' });
    },
  });

  const totalDraft = useMemo(() => items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0), [items]);

  const getStockName = (stockId: number) => stocks.find(s => s.id === stockId)?.name ?? `#${stockId}`;
  const getStockUnit = (stockId: number) => stocks.find(s => s.id === stockId)?.unit ?? '';

  return (
    <div className="animate-slide-in space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Header title={client ? `Commandes - ${client.name}` : 'Commandes client'} />
        <Button variant="outline" className="rounded-xl gap-2" onClick={() => navigate('/dashboard/clients')}>
          <ArrowLeft size={16} /> Retour
        </Button>
      </div>

      <div className="card-xl p-5 md:p-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <ShoppingBag size={16} className="text-success" />
            <span>{orders.length} commandes</span>
          </div>

          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setItems([]); setNewItem({ stock_item_id: '', quantity: '1', unit_price: '0' }); } }}>
            <DialogTrigger asChild>
              <Button className="rounded-xl gap-2">
                <Plus size={16} /> Nouvelle commande
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-xl rounded-2xl">
              <DialogHeader>
                <DialogTitle className="text-lg font-extrabold tracking-tight">Créer une commande</DialogTitle>
              </DialogHeader>

              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="order-date" className="text-xs font-medium">Date *</Label>
                  <Input id="order-date" type="date" value={newOrderDate} onChange={(e) => setNewOrderDate(e.target.value)} className="h-11 rounded-xl" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Article *</Label>
                    <Select value={newItem.stock_item_id} onValueChange={(v) => setNewItem(p => ({ ...p, stock_item_id: v }))}>
                      <SelectTrigger className="h-11 rounded-xl">
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        {stocks.map(s => (
                          <SelectItem key={s.id} value={String(s.id)}>
                            {s.name} ({s.quantity} {s.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Quantité *</Label>
                    <Input value={newItem.quantity} onChange={(e) => setNewItem(p => ({ ...p, quantity: e.target.value }))} className="h-11 rounded-xl" />
                    {selectedStock && (
                      <p className="text-[11px] text-muted-foreground">Unité: {selectedStock.unit}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-medium">Prix unitaire (GNF) *</Label>
                    <Input value={newItem.unit_price} onChange={(e) => setNewItem(p => ({ ...p, unit_price: e.target.value }))} className="h-11 rounded-xl" />
                  </div>

                  <div className="flex items-end">
                    <Button type="button" onClick={addItem} className="rounded-xl w-full">
                      Ajouter l'article
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground">Aucun article ajouté</p>
                  ) : (
                    <div className="space-y-2">
                      {items.map(i => (
                        <div key={i.stock_item_id} className="flex items-center justify-between gap-3 p-3 rounded-xl bg-secondary/40">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold truncate">{getStockName(i.stock_item_id)}</p>
                            <p className="text-xs text-muted-foreground">
                              {i.quantity} {getStockUnit(i.stock_item_id)} x {formatAmount(i.unit_price)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-extrabold text-success">{formatAmount(i.quantity * i.unit_price)}</p>
                            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => removeItem(i.stock_item_id)}>
                              Retirer
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold">Total</p>
                  <p className="text-sm font-extrabold text-success">{formatAmount(totalDraft)}</p>
                </div>
              </div>

              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline" className="rounded-xl">Annuler</Button>
                </DialogClose>
                <Button
                  onClick={() => {
                    if (!clientId || items.length === 0) return;
                    createOrderMutation.mutate({ client_id: clientId, order_date: newOrderDate, items });
                  }}
                  disabled={createOrderMutation.isPending || items.length === 0}
                  className="rounded-xl"
                >
                  Enregistrer (brouillon)
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="card-xl p-5 md:p-6">
        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><ShoppingBag size={24} /></div>
            <p className="text-sm font-medium text-muted-foreground">Aucune commande</p>
            <p className="text-xs text-muted-foreground mt-1">Crée la première commande pour ce client</p>
          </div>
        ) : (
          <div className="space-y-2">
            {orders.map(o => (
              <div key={o.id} className="p-4 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-bold text-foreground text-[15px]">Commande #{o.id}</p>
                    <p className="text-xs text-muted-foreground mt-1">Date: {new Date(o.order_date).toLocaleDateString('fr-FR')}</p>
                    <p className="text-xs text-muted-foreground mt-1">Articles: {o.items?.length ?? 0}</p>
                  </div>

                  <div className="text-left md:text-right">
                    <p className="text-sm font-extrabold text-success">{formatAmount(o.total_amount)}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Statut: {o.status}</p>

                    {o.status === 'brouillon' && (
                      <div className="flex items-center gap-2 mt-3 md:justify-end">
                        <Button
                          className="rounded-xl gap-2"
                          onClick={() => confirmOrderMutation.mutate(o.id)}
                          disabled={confirmOrderMutation.isPending}
                        >
                          <CheckCircle2 size={16} /> Confirmer
                        </Button>
                      </div>
                    )}

                    {o.status === 'confirmee' && (
                      <div className="flex items-center gap-2 mt-3 md:justify-end text-success text-xs font-semibold">
                        <CheckCircle2 size={16} /> Confirmée
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientOrders;
