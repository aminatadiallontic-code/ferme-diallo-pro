import { useState } from 'react';
import { Search, UserPlus, Users, TrendingUp, Home, Activity, Edit, Trash2 } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface User {
  id: number;
  name: string;
  email: string;
  role: 'Fermier' | 'Gestionnaire' | 'Admin';
  status: 'Actif' | 'Inactif';
  fermes: number;
  lastActivity: string;
}

const initialUsers: User[] = [
  { id: 1, name: 'Jean Dupont', email: 'jean.dupont@example.com', role: 'Fermier', status: 'Actif', fermes: 2, lastActivity: '2026-01-16' },
  { id: 2, name: 'Marie Martin', email: 'marie.martin@example.com', role: 'Gestionnaire', status: 'Actif', fermes: 5, lastActivity: '2026-01-15' },
  { id: 3, name: 'Pierre Dubois', email: 'pierre.dubois@example.com', role: 'Fermier', status: 'Actif', fermes: 1, lastActivity: '2026-01-14' },
  { id: 4, name: 'Sophie Bernard', email: 'sophie.bernard@example.com', role: 'Fermier', status: 'Inactif', fermes: 3, lastActivity: '2026-01-10' },
];

const roleColors: Record<string, string> = {
  'Fermier': 'bg-success/10 text-success border border-success/30',
  'Gestionnaire': 'bg-primary/10 text-primary border border-primary/30',
  'Admin': 'bg-destructive/10 text-destructive border border-destructive/30',
};

const statusColors: Record<string, string> = {
  'Actif': 'bg-success/10 text-success',
  'Inactif': 'bg-muted text-muted-foreground',
};

const GestionUtilisateurs = () => {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = () => {
    if (deleteTarget) {
      setUsers(users.filter(u => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'Actif').length;
  const totalFermes = users.reduce((acc, u) => acc + u.fermes, 0);
  const activityRate = Math.round((activeUsers / totalUsers) * 100);

  return (
    <div className="animate-fade-in">
      <Header title="Gestion des Utilisateurs" />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Utilisateurs</p>
              <p className="text-3xl font-bold text-foreground">{totalUsers}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="text-primary" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Utilisateurs Actifs</p>
              <p className="text-3xl font-bold text-foreground">{activeUsers}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <TrendingUp className="text-success" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Fermes</p>
              <p className="text-3xl font-bold text-foreground">{totalFermes}</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Home className="text-warning" size={24} />
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-5 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Taux d'activité</p>
              <p className="text-3xl font-bold text-foreground">{activityRate}%</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Activity className="text-accent" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Add */}
      <div className="bg-card rounded-2xl p-6 border border-border">
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Rechercher un utilisateur par nom ou email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-xl bg-muted/50 border-0"
            />
          </div>
          <Button className="h-12 px-6 rounded-xl bg-success hover:bg-success/90 text-white gap-2 whitespace-nowrap">
            <UserPlus size={18} />
            Ajouter un utilisateur
          </Button>
        </div>

        {/* Users Table */}
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead className="font-semibold">Utilisateur</TableHead>
                <TableHead className="font-semibold">Rôle</TableHead>
                <TableHead className="font-semibold">Statut</TableHead>
                <TableHead className="font-semibold">Fermes</TableHead>
                <TableHead className="font-semibold">Dernière activité</TableHead>
                <TableHead className="font-semibold text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id} className="hover:bg-muted/20">
                  <TableCell>
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusColors[user.status]}`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-foreground">{user.fermes}</TableCell>
                  <TableCell className="text-muted-foreground">{user.lastActivity}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-primary hover:text-primary hover:bg-primary/10"
                      >
                        <Edit size={16} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => setDeleteTarget(user)}
                      >
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
          <div className="text-center py-12 text-muted-foreground">
            <p>Aucun utilisateur trouvé</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">
              Supprimer cet utilisateur ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{deleteTarget?.name}</strong> ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default GestionUtilisateurs;
