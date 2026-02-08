import { useState } from 'react';
import { Search, Phone, Mail, MapPin, ShoppingBag, Plus } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';

interface Client {
  id: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  totalOrders: number;
  lastOrder: string;
  totalSpent: number;
}

const initialClients: Client[] = [
  { id: 1, name: 'Ousmane Ba', phone: '+221 77 123 45 67', email: 'ousmane@mail.com', address: 'Dakar, Médina', totalOrders: 24, lastOrder: '2024-01-28', totalSpent: 2400000 },
  { id: 2, name: 'Fatou Ndiaye', phone: '+221 76 234 56 78', email: 'fatou@mail.com', address: 'Thiès, Centre', totalOrders: 18, lastOrder: '2024-01-27', totalSpent: 1850000 },
  { id: 3, name: 'Amadou Sy', phone: '+221 78 345 67 89', email: 'amadou@mail.com', address: 'Saint-Louis, Ndar', totalOrders: 32, lastOrder: '2024-01-26', totalSpent: 3200000 },
  { id: 4, name: 'Mariama Diop', phone: '+221 77 456 78 90', email: 'mariama@mail.com', address: 'Kaolack, Léona', totalOrders: 12, lastOrder: '2024-01-25', totalSpent: 960000 },
  { id: 5, name: 'Moussa Fall', phone: '+221 76 567 89 01', email: 'moussa@mail.com', address: 'Ziguinchor, Centre', totalOrders: 8, lastOrder: '2024-01-23', totalSpent: 640000 },
  { id: 6, name: 'Aissatou Sow', phone: '+221 78 678 90 12', email: 'aissatou@mail.com', address: 'Dakar, Almadies', totalOrders: 45, lastOrder: '2024-01-28', totalSpent: 5600000 },
];

const Clients = () => {
  const [search, setSearch] = useState('');
  const [clients, setClients] = useState<Client[]>(initialClients);
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
      name: newClient.name.trim(),
      phone: newClient.phone.trim(),
      email: newClient.email.trim(),
      address: newClient.address.trim(),
      totalOrders: 0,
      lastOrder: new Date().toISOString().split('T')[0],
      totalSpent: 0,
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

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  return (
    <div className="animate-slide-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-2">
        <Header title="Clients" />
        <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setErrors({}); setNewClient({ name: '', phone: '', email: '', address: '' }); } }}>
          <DialogTrigger asChild>
            <Button className="rounded-2xl gap-2 shrink-0">
              <Plus size={18} />
              <span className="hidden sm:inline">Nouveau client</span>
              <span className="sm:hidden">Ajouter</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Ajouter un client</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="client-name">Nom complet *</Label>
                <Input id="client-name" placeholder="Ex: Ousmane Ba" value={newClient.name} onChange={(e) => setNewClient(p => ({ ...p, name: e.target.value }))} />
                {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-phone">Téléphone *</Label>
                <Input id="client-phone" placeholder="Ex: +221 77 123 45 67" value={newClient.phone} onChange={(e) => setNewClient(p => ({ ...p, phone: e.target.value }))} />
                {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-email">Email</Label>
                <Input id="client-email" type="email" placeholder="Ex: ousmane@mail.com" value={newClient.email} onChange={(e) => setNewClient(p => ({ ...p, email: e.target.value }))} />
                {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="client-address">Adresse *</Label>
                <Input id="client-address" placeholder="Ex: Dakar, Médina" value={newClient.address} onChange={(e) => setNewClient(p => ({ ...p, address: e.target.value }))} />
                {errors.address && <p className="text-sm text-destructive">{errors.address}</p>}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Annuler</Button>
              </DialogClose>
              <Button onClick={handleAddClient}>Ajouter</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        <div className="stat-card">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">Total clients</p>
          <p className="text-xl md:text-2xl font-black text-foreground">{clients.length}</p>
        </div>
        <div className="stat-card">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">Commandes</p>
          <p className="text-xl md:text-2xl font-black text-foreground">
            {clients.reduce((sum, c) => sum + c.totalOrders, 0)}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">Chiffre d'affaires</p>
          <p className="text-lg md:text-2xl font-black text-success">
            {formatAmount(clients.reduce((sum, c) => sum + c.totalSpent, 0))}
          </p>
        </div>
        <div className="stat-card">
          <p className="text-xs md:text-sm text-muted-foreground mb-1">Moy. / client</p>
          <p className="text-lg md:text-2xl font-black text-foreground">
            {formatAmount(Math.round(clients.reduce((sum, c) => sum + c.totalSpent, 0) / clients.length))}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
        <Input
          placeholder="Rechercher un client..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="h-12 pl-12 rounded-2xl bg-card border-border/50"
        />
      </div>

      {/* Client List */}
      <div className="card-xl p-4 md:p-6">
        <div className="space-y-4">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="p-4 md:p-5 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                <div className="flex-1">
                  <h3 className="font-bold text-foreground text-lg">{client.name}</h3>
                  <div className="mt-2 space-y-1">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone size={14} className="shrink-0" />
                      <span>{client.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail size={14} className="shrink-0" />
                      <span className="truncate">{client.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin size={14} className="shrink-0" />
                      <span>{client.address}</span>
                    </div>
                  </div>
                </div>
                <div className="text-left md:text-right">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingBag size={16} className="text-success" />
                    <span className="font-bold text-foreground">{client.totalOrders} commandes</span>
                  </div>
                  <p className="text-lg font-black text-success">{formatAmount(client.totalSpent)}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Dernière: {new Date(client.lastOrder).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>
            </div>
          ))}

          {filteredClients.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-lg">Aucun client trouvé</p>
              <p className="text-sm">Essayez de modifier votre recherche</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Clients;
