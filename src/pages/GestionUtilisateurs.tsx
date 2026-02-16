import { useState, useEffect } from 'react';
import { Search, Users, TrendingUp, Home, Activity, Trash2, KeyRound, Check, X } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import ExportBar from '@/components/ExportBar';
import AddUserDialog from '@/components/users/AddUserDialog';
import { useAuth, type PasswordResetRequest } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { exportToCSV, printSection } from '@/lib/exportUtils';
import { toast } from 'sonner';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface User {
  id: number; name: string; email: string;
  role: 'Administrateur' | 'Gestionnaire'; status: 'Actif' | 'Inactif'; lastActivity: string;
}

const roleColors: Record<string, string> = {
  'Administrateur': 'bg-success/10 text-success border border-success/30',
  'Gestionnaire': 'bg-primary/10 text-primary border border-primary/30',
};

const statusColors: Record<string, string> = {
  'Actif': 'bg-success/10 text-success',
  'Inactif': 'bg-muted text-muted-foreground',
};

const GestionUtilisateurs = () => {
  const { hasAccess, getAllUsers, removeUser, toggleUserStatus, getResetRequests, approveResetRequest, rejectResetRequest } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [resetRequests, setResetRequests] = useState<PasswordResetRequest[]>([]);

  const loadUsers = () => {
    const allCreds = getAllUsers();
    const mapped: User[] = allCreds.map((u, i) => ({
      id: i + 1, name: u.name, email: u.email,
      role: u.role === 'fermier' ? 'Administrateur' : 'Gestionnaire',
      status: (u.status === 'inactif' ? 'Inactif' : 'Actif') as 'Actif' | 'Inactif',
      lastActivity: new Date().toISOString().split('T')[0],
    }));
    setUsers(mapped);
    setResetRequests(getResetRequests());
  };

  useEffect(() => { loadUsers(); }, []);

  if (!hasAccess('utilisateurs')) return <Navigate to="/dashboard/clients" replace />;

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = () => {
    if (deleteTarget) { removeUser(deleteTarget.email); loadUsers(); setDeleteTarget(null); }
  };

  const handleApproveReset = (email: string) => {
    const tempPwd = approveResetRequest(email);
    toast.success(`Mot de passe réinitialisé pour ${email}`, { description: `Nouveau mot de passe temporaire: ${tempPwd}`, duration: 15000 });
    loadUsers();
  };

  const handleRejectReset = (email: string) => {
    rejectResetRequest(email);
    toast.info(`Demande de réinitialisation rejetée pour ${email}`);
    loadUsers();
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'Actif').length;
  const admins = users.filter(u => u.role === 'Administrateur').length;
  const gestionnaires = users.filter(u => u.role === 'Gestionnaire').length;

  const handleExportCSV = () => {
    exportToCSV(users.map(u => ({
      Nom: u.name, Email: u.email, Rôle: u.role, Statut: u.status,
    })), 'utilisateurs');
  };

  const handlePrint = () => {
    printSection('Liste des Utilisateurs', `
      <div class="stats">
        <div class="stat-box"><div class="label">Total</div><div class="value">${totalUsers}</div></div>
        <div class="stat-box"><div class="label">Actifs</div><div class="value positive">${activeUsers}</div></div>
        <div class="stat-box"><div class="label">Admins</div><div class="value">${admins}</div></div>
        <div class="stat-box"><div class="label">Gestionnaires</div><div class="value">${gestionnaires}</div></div>
      </div>
      <table><thead><tr><th>Nom</th><th>Email</th><th>Rôle</th><th>Statut</th></tr></thead><tbody>
        ${users.map(u => `<tr><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td><td class="${u.status === 'Actif' ? 'positive' : 'negative'}">${u.status}</td></tr>`).join('')}
      </tbody></table>
    `);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between gap-3 mb-2">
        <Header title="Utilisateurs" />
        <ExportBar onExportCSV={handleExportCSV} onPrint={handlePrint} />
      </div>

      {/* Reset Requests Banner */}
      {resetRequests.length > 0 && (
        <div className="mb-6 card-xl p-4 md:p-6 border-2 border-warning/30 bg-warning/5">
          <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
            <KeyRound size={18} className="text-warning" />
            Demandes de réinitialisation ({resetRequests.length})
          </h3>
          <div className="space-y-3">
            {resetRequests.map((req) => (
              <div key={req.email} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border gap-3">
                <div>
                  <p className="font-medium text-foreground text-sm">{req.email}</p>
                  <p className="text-xs text-muted-foreground">Demandé le {new Date(req.requestedAt).toLocaleDateString('fr-FR')}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={() => handleApproveReset(req.email)} className="rounded-lg gap-1 bg-success hover:bg-success/90 text-success-foreground h-8">
                    <Check size={14} /> Approuver
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => handleRejectReset(req.email)} className="rounded-lg gap-1 h-8 text-destructive hover:text-destructive">
                    <X size={14} /> Rejeter
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-8">
        <div className="stat-card hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <div><p className="text-xs md:text-sm text-muted-foreground mb-1">Total</p><p className="text-2xl md:text-3xl font-bold text-foreground">{totalUsers}</p></div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center"><Users className="text-primary" size={20} /></div>
          </div>
        </div>
        <div className="stat-card hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <div><p className="text-xs md:text-sm text-muted-foreground mb-1">Actifs</p><p className="text-2xl md:text-3xl font-bold text-foreground">{activeUsers}</p></div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-success/10 flex items-center justify-center"><TrendingUp className="text-success" size={20} /></div>
          </div>
        </div>
        <div className="stat-card hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <div><p className="text-xs md:text-sm text-muted-foreground mb-1">Admins</p><p className="text-2xl md:text-3xl font-bold text-foreground">{admins}</p></div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-warning/10 flex items-center justify-center"><Home className="text-warning" size={20} /></div>
          </div>
        </div>
        <div className="stat-card hover:shadow-lg hover:-translate-y-0.5 transition-all">
          <div className="flex items-center justify-between">
            <div><p className="text-xs md:text-sm text-muted-foreground mb-1">Gestionnaires</p><p className="text-2xl md:text-3xl font-bold text-foreground">{gestionnaires}</p></div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-accent/10 flex items-center justify-center"><Activity className="text-accent" size={20} /></div>
          </div>
        </div>
      </div>

      {/* Search & Add */}
      <div className="card-xl p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input placeholder="Rechercher un utilisateur..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="pl-12 h-12 rounded-xl bg-muted/50 border-0" />
          </div>
          <AddUserDialog onUserAdded={loadUsers} />
        </div>

        <div className="rounded-xl border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold">Utilisateur</TableHead>
                <TableHead className="font-semibold">Rôle</TableHead>
                <TableHead className="font-semibold hidden sm:table-cell">Statut</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/20">
                  <TableCell>
                    <div><p className="font-medium text-foreground">{user.name}</p><p className="text-xs md:text-sm text-muted-foreground">{user.email}</p></div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 md:px-3 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>{user.role}</span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <div className="flex items-center gap-2">
                      <Switch checked={user.status === 'Actif'} onCheckedChange={() => { toggleUserStatus(user.email); loadUsers(); }} />
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusColors[user.status]}`}>{user.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1 md:gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10" onClick={() => setDeleteTarget(user)}>
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground"><p>Aucun utilisateur trouvé</p></div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">Supprimer cet utilisateur ?</AlertDialogTitle>
            <AlertDialogDescription>Êtes-vous sûr de vouloir supprimer <strong>{deleteTarget?.name}</strong> ? Cette action est irréversible.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl">Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GestionUtilisateurs;
