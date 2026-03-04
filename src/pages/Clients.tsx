import { useState } from 'react';
import { Search, Phone, Mail, MapPin, ShoppingBag, Plus, UserPlus } from 'lucide-react';
import Header from '@/components/layout/Header';
import ExportBar from '@/components/ExportBar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { exportToCSV, printSection } from '@/lib/exportUtils';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose,
} from '@/components/ui/dialog';

interface Client {
  id: number; name: string; phone: string; email: string; address: string;
  totalOrders: number; lastOrder: string; totalSpent: number;
}

const Clients = () => {
  const [search, setSearch] = useState('');
  const [clients, setClients] = useState<Client[]>([]);
  const [open, setOpen] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', phone: '', email: '', address: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!newClient.name.trim()) errs.name = 'Le nom est requis';
    if (!newClient.phone.trim()) errs.phone = 'Le téléphone est requis';
    if (newClient.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newClient.email)) errs.email = 'Email invalide';
    if (!newClient.address.trim()) errs.address = "L'adresse est requise";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleAddClient = () => {
    if (!validate()) return;
    const client: Client = {
      id: Math.max(...clients.map(c => c.id), 0) + 1,
      name: newClient.name.trim(), phone: newClient.phone.trim(),
      email: newClient.email.trim(), address: newClient.address.trim(),
      totalOrders: 0, lastOrder: new Date().toISOString().split('T')[0], totalSpent: 0,
    };
    setClients(prev => [client, ...prev]);
    setNewClient({ name: '', phone: '', email: '', address: '' });
    setErrors({});
    setOpen(false);
    toast({ title: 'Client ajouté', description: `${client.name} a été ajouté avec succès.` });
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  const formatAmount = (amount: number) => new Intl.NumberFormat('fr-FR').format(amount) + ' GNF';

  const handleExportCSV = () => {
    exportToCSV(clients.map(c => ({
      Nom: c.name, Téléphone: c.phone, Email: c.email, Adresse: c.address,
      Commandes: c.totalOrders, 'Total dépensé': c.totalSpent,
    })), 'clients');
  };

  const handlePrint = () => {
    printSection('Liste des Clients', `
      <div class="stats">
        <div class="stat-box"><div class="label">Total clients</div><div class="value">${clients.length}</div></div>
        <div class="stat-box"><div class="label">Commandes</div><div class="value">${clients.reduce((s, c) => s + c.totalOrders, 0)}</div></div>
        <div class="stat-box"><div class="label">CA Total</div><div class="value positive">${formatAmount(clients.reduce((s, c) => s + c.totalSpent, 0))}</div></div>
      </div>
      <table><thead><tr><th>Nom</th><th>Téléphone</th><th>Email</th><th>Adresse</th><th>Commandes</th><th>Total</th></tr></thead><tbody>
        ${clients.map(c => `<tr><td>${c.name}</td><td>${c.phone}</td><td>${c.email}</td><td>${c.address}</td><td>${c.totalOrders}</td><td class="positive">${formatAmount(c.totalSpent)}</td></tr>`).join('')}
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
          <p className="text-lg md:text-xl font-extrabold text-foreground">{clients.reduce((sum, c) => sum + c.totalOrders, 0)}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground mb-0.5">Chiffre d'affaires</p>
          <p className="text-lg md:text-xl font-extrabold text-success">{formatAmount(clients.reduce((sum, c) => sum + c.totalSpent, 0))}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs text-muted-foreground mb-0.5">Moy. / client</p>
          <p className="text-lg md:text-xl font-extrabold text-foreground">{clients.length > 0 ? formatAmount(Math.round(clients.reduce((sum, c) => sum + c.totalSpent, 0) / clients.length)) : '0 GNF'}</p>
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
                      <span className="font-semibold text-foreground text-xs">{client.totalOrders} commandes</span>
                    </div>
                    <p className="text-sm font-extrabold text-success">{formatAmount(client.totalSpent)}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">Dernière: {new Date(client.lastOrder).toLocaleDateString('fr-FR')}</p>
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

export default Clients;
