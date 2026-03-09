import { useEffect, useState } from 'react';
import { Search, Phone, Mail, MapPin, ShoppingBag, Plus, UserPlus, Pencil, Trash2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import ExportBar from '@/components/ExportBar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { exportToCSV, printSection } from '@/lib/exportUtils';
import { api, type PaginatedResponse } from '@/lib/api';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Client {
  id: number;
  name: string;
  phone: string;
  email: string | null;
  address: string;
  total_orders: number;
  last_order: string | null;
  total_spent: number;
}

const Clients = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', phone: '', email: '', address: '' });
  const [editClient, setEditClient] = useState<{ id: number; name: string; phone: string; email: string; address: string } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Client | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const { data: clientsResp } = useQuery({
    queryKey: ['clients', debouncedSearch],
    queryFn: () => {
      const q = debouncedSearch.trim();
      const url = q
        ? `/api/clients?q=${encodeURIComponent(q)}&per_page=200`
        : '/api/clients?per_page=200';

      return api.get<PaginatedResponse<Client>>(url);
    },
  });

  const updateClientMutation = useMutation({
    mutationFn: (payload: { id: number; name: string; phone: string; email?: string | null; address: string }) =>
      api.put<Client>(`/api/clients/${payload.id}`, {
        name: payload.name,
        phone: payload.phone,
        email: payload.email,
        address: payload.address,
      }),
    onSuccess: async (updated) => {
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
      setEditClient(null);
      setErrors({});
      setEditOpen(false);
      toast({ title: 'Client modifié', description: `${updated.name} a été modifié avec succès.` });
    },
  });

  const deleteClientMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/clients/${id}`),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
      setDeleteTarget(null);
      toast({ title: 'Client supprimé' });
    },
  });

  const clients = clientsResp?.data ?? [];

  const createClientMutation = useMutation({
    mutationFn: (payload: { name: string; phone: string; email?: string | null; address: string }) =>
      api.post<Client>('/api/clients', payload),
    onSuccess: async (created) => {
      await queryClient.invalidateQueries({ queryKey: ['clients'] });
      setNewClient({ name: '', phone: '', email: '', address: '' });
      setErrors({});
      setOpen(false);
      toast({ title: 'Client ajouté', description: `${created.name} a été ajouté avec succès.` });
    },
  });

  const validate = () => {
    const errs: Record<string, string> = {};
    const name = (editClient ? editClient.name : newClient.name).trim();
    const phone = (editClient ? editClient.phone : newClient.phone).trim();
    const email = (editClient ? editClient.email : newClient.email).trim();
    const address = (editClient ? editClient.address : newClient.address).trim();

    if (!name) errs.name = 'Le nom est requis';
    if (!phone) errs.phone = 'Le téléphone est requis';
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Email invalide';
    if (!address) errs.address = "L'adresse est requise";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddClient = () => {
    if (!validate()) return;
    createClientMutation.mutate({
      name: newClient.name.trim(),
      phone: newClient.phone.trim(),
      email: newClient.email.trim() ? newClient.email.trim() : null,
      address: newClient.address.trim(),
    });
  };

  const handleEditClient = () => {
    if (!editClient) return;
    if (!validate()) return;

    updateClientMutation.mutate({
      id: editClient.id,
      name: editClient.name.trim(),
      phone: editClient.phone.trim(),
      email: editClient.email.trim() ? editClient.email.trim() : null,
      address: editClient.address.trim(),
    });
  };

  const filteredClients = clients;

  const formatAmount = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount) + ' GNF';

  const handleExportCSV = () => {
    exportToCSV(filteredClients.map(c => ({
      Nom: c.name, Téléphone: c.phone, Email: c.email, Adresse: c.address,
      Commandes: c.total_orders, 'Total dépensé': c.total_spent,
    })), 'clients');
  };

  const handlePrint = () => {
    printSection('Liste des Clients', `
      <div class="stats">
        <div class="stat-box"><div class="label">Total clients</div><div class="value">${filteredClients.length}</div></div>
        <div class="stat-box"><div class="label">Commandes</div><div class="value">${filteredClients.reduce((s, c) => s + c.total_orders, 0)}</div></div>
        <div class="stat-box"><div class="label">CA Total</div><div class="value positive">${formatAmount(filteredClients.reduce((s, c) => s + c.total_spent, 0))}</div></div>
      </div>
      <table><thead><tr><th>Nom</th><th>Téléphone</th><th>Email</th><th>Adresse</th><th>Commandes</th><th>Total</th></tr></thead><tbody>
        ${filteredClients.map(c => `<tr><td>${c.name}</td><td>${c.phone}</td><td>${c.email ?? ''}</td><td>${c.address}</td><td>${c.total_orders}</td><td class="positive">${formatAmount(c.total_spent)}</td></tr>`).join('')}
      </tbody></table>
    `);
  };

  return (
    <div className="animate-slide-in space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Header title="Clients" />
        <div className="flex items-center gap-2">
          <ExportBar onExportCSV={handleExportCSV} onPrint={handlePrint} />
          <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setErrors({}); setNewClient({ name: '', phone: '', email: '', address: '' }); } }}>
            <DialogTrigger asChild>
              <Button className="rounded-xl gap-2 shrink-0 btn-press h-9 text-xs">
                <Plus size={16} />
                <span className="hidden sm:inline">Nouveau client</span>
                <span className="sm:hidden">Ajouter</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader><DialogTitle className="text-lg font-extrabold tracking-tight">Ajouter un client</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="client-name" className="text-xs font-medium">Nom complet *</Label>
                  <Input id="client-name" placeholder="Ex: Ousmane Ba" value={newClient.name} onChange={(e) => setNewClient(p => ({ ...p, name: e.target.value }))} className="h-11 rounded-xl" />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="client-phone" className="text-xs font-medium">Téléphone *</Label>
                  <Input id="client-phone" placeholder="Ex: +224 62 123 45 67" value={newClient.phone} onChange={(e) => setNewClient(p => ({ ...p, phone: e.target.value }))} className="h-11 rounded-xl" />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="client-email" className="text-xs font-medium">Email</Label>
                  <Input id="client-email" type="email" placeholder="Ex: ousmane@mail.com" value={newClient.email} onChange={(e) => setNewClient(p => ({ ...p, email: e.target.value }))} className="h-11 rounded-xl" />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="client-address" className="text-xs font-medium">Adresse *</Label>
                  <Input id="client-address" placeholder="Ex: Conakry, Kaloum" value={newClient.address} onChange={(e) => setNewClient(p => ({ ...p, address: e.target.value }))} className="h-11 rounded-xl" />
                  {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline" className="rounded-xl">Annuler</Button></DialogClose>
                <Button onClick={handleAddClient} className="rounded-xl">Ajouter</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog
            open={editOpen}
            onOpenChange={(v) => {
              setEditOpen(v);
              if (!v) {
                setErrors({});
                setEditClient(null);
              }
            }}
          >
            <DialogContent className="sm:max-w-md rounded-2xl">
              <DialogHeader><DialogTitle className="text-lg font-extrabold tracking-tight">Modifier le client</DialogTitle></DialogHeader>
              <div className="space-y-4 py-2">
                <div className="space-y-1.5">
                  <Label htmlFor="client-edit-name" className="text-xs font-medium">Nom complet *</Label>
                  <Input id="client-edit-name" placeholder="Ex: Ousmane Ba" value={editClient?.name ?? ''} onChange={(e) => setEditClient(p => p ? ({ ...p, name: e.target.value }) : p)} className="h-11 rounded-xl" />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="client-edit-phone" className="text-xs font-medium">Téléphone *</Label>
                  <Input id="client-edit-phone" placeholder="Ex: +224 62 123 45 67" value={editClient?.phone ?? ''} onChange={(e) => setEditClient(p => p ? ({ ...p, phone: e.target.value }) : p)} className="h-11 rounded-xl" />
                  {errors.phone && <p className="text-xs text-destructive">{errors.phone}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="client-edit-email" className="text-xs font-medium">Email</Label>
                  <Input id="client-edit-email" type="email" placeholder="Ex: ousmane@mail.com" value={editClient?.email ?? ''} onChange={(e) => setEditClient(p => p ? ({ ...p, email: e.target.value }) : p)} className="h-11 rounded-xl" />
                  {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="client-edit-address" className="text-xs font-medium">Adresse *</Label>
                  <Input id="client-edit-address" placeholder="Ex: Conakry, Kaloum" value={editClient?.address ?? ''} onChange={(e) => setEditClient(p => p ? ({ ...p, address: e.target.value }) : p)} className="h-11 rounded-xl" />
                  {errors.address && <p className="text-xs text-destructive">{errors.address}</p>}
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline" className="rounded-xl">Annuler</Button></DialogClose>
                <Button onClick={handleEditClient} className="rounded-xl">Enregistrer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <div className="stat-card">
          <p className="text-xs text-muted-foreground mb-0.5">Total clients</p>
          <p className="text-lg md:text-xl font-extrabold text-foreground">{clients.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground mb-0.5">Commandes</p>
          <p className="text-lg md:text-xl font-extrabold text-foreground">{clients.reduce((sum, c) => sum + c.total_orders, 0)}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground mb-0.5">Chiffre d'affaires</p>
          <p className="text-lg md:text-xl font-extrabold text-success">{formatAmount(clients.reduce((sum, c) => sum + c.total_spent, 0))}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground mb-0.5">Moy. / client</p>
          <p className="text-lg md:text-xl font-extrabold text-foreground">{clients.length > 0 ? formatAmount(Math.round(clients.reduce((sum, c) => sum + c.total_spent, 0) / clients.length)) : '0 GNF'}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
        <Input placeholder="Rechercher un client..." value={search} onChange={(e) => setSearch(e.target.value)} className="h-11 pl-10 rounded-xl bg-card border-border/60" />
      </div>

      {/* Client List */}
      <div className="card-xl p-5 md:p-6">
        {filteredClients.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><UserPlus size={24} /></div>
            <p className="text-sm font-medium text-muted-foreground">Aucun client enregistré</p>
            <p className="text-xs text-muted-foreground mt-1">Ajoutez votre premier client</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredClients.map((client) => (
              <div key={client.id} className="p-4 rounded-xl bg-secondary/40 hover:bg-secondary/70 transition-colors">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-bold text-foreground text-[15px]">{client.name}</h3>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center gap-2 text-xs text-muted-foreground"><Phone size={12} className="shrink-0" /><span>{client.phone}</span></div>
                      {client.email && <div className="flex items-center gap-2 text-xs text-muted-foreground"><Mail size={12} className="shrink-0" /><span className="truncate">{client.email}</span></div>}
                      <div className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin size={12} className="shrink-0" /><span>{client.address}</span></div>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <div className="flex items-center gap-1.5 mb-1">
                      <ShoppingBag size={14} className="text-success" />
                      <span className="font-semibold text-foreground text-xs">{client.total_orders} commandes</span>
                    </div>
                    <p className="text-sm font-extrabold text-success">{formatAmount(client.total_spent)}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Dernière: {client.last_order ? new Date(client.last_order).toLocaleDateString('fr-FR') : '-'}</p>

                    <div className="flex items-center gap-2 mt-3 md:justify-end">
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl gap-1.5 h-8 text-xs"
                        onClick={() => navigate(`/dashboard/clients/${client.id}/commandes`)}
                      >
                        <ShoppingBag size={13} /> Commandes
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl gap-1.5 h-8 text-xs"
                        onClick={() => {
                          setErrors({});
                          setEditClient({
                            id: client.id,
                            name: client.name,
                            phone: client.phone,
                            email: client.email ?? '',
                            address: client.address,
                          });
                          setEditOpen(true);
                        }}
                      >
                        <Pencil size={13} /> Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-xl gap-1.5 h-8 text-xs text-destructive hover:text-destructive"
                        onClick={() => setDeleteTarget(client)}
                      >
                        <Trash2 size={13} /> Supprimer
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-extrabold">Supprimer ce client ?</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">
              Êtes-vous sûr de vouloir supprimer <strong>{deleteTarget?.name}</strong> ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
              onClick={() => {
                if (!deleteTarget) return;
                deleteClientMutation.mutate(deleteTarget.id);
              }}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Clients;
