import { useState, useEffect } from 'react';
import { Search, Users, TrendingUp, Home, Activity, Edit, Trash2 } from 'lucide-react';
import { Navigate } from 'react-router-dom';
import Header from '@/components/layout/Header';
import AddUserDialog from '@/components/users/AddUserDialog';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  role: 'Administrateur' | 'Gestionnaire';
  status: 'Actif' | 'Inactif';
  lastActivity: string;
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
  const { hasAccess, getAllUsers, removeUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const loadUsers = () => {
    const allCreds = getAllUsers();
    const mapped: User[] = allCreds.map((u, i) => ({
      id: i + 1,
      name: u.name,
      email: u.email,
      role: u.role === 'fermier' ? 'Administrateur' : 'Gestionnaire',
      status: 'Actif' as const,
      lastActivity: new Date().toISOString().split('T')[0],
    }));
    setUsers(mapped);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  // Restrict access for gestionnaire
  if (!hasAccess('utilisateurs')) {
    return <Navigate to="/dashboard/clients" replace />;
  }

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = () => {
    if (deleteTarget) {
      removeUser(deleteTarget.email);
      loadUsers();
      setDeleteTarget(null);
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter(u => u.status === 'Actif').length;
  const admins = users.filter(u => u.role === 'Administrateur').length;
  const gestionnaires = users.filter(u => u.role === 'Gestionnaire').length;

  return (
    <div className="animate-fade-in">
      <Header title="Utilisateurs" />

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-card rounded-2xl p-4 md:p-5 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Total</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">{totalUsers}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <Users className="text-primary" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-4 md:p-5 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Actifs</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">{activeUsers}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-success/10 flex items-center justify-center">
              <TrendingUp className="text-success" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-4 md:p-5 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Admins</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">{admins}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-warning/10 flex items-center justify-center">
              <Home className="text-warning" size={20} />
            </div>
          </div>
        </div>
        <div className="bg-card rounded-2xl p-4 md:p-5 border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs md:text-sm text-muted-foreground mb-1">Gestionnaires</p>
              <p className="text-2xl md:text-3xl font-bold text-foreground">{gestionnaires}</p>
            </div>
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-accent/10 flex items-center justify-center">
              <Activity className="text-accent" size={20} />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Add */}
      <div className="bg-card rounded-2xl p-4 md:p-6 border border-border">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Rechercher un utilisateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-xl bg-muted/50 border-0"
            />
          </div>
          <AddUserDialog onUserAdded={loadUsers} />
        </div>

        {/* Users Table - scrollable on mobile */}
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
                    <div>
                      <p className="font-medium text-foreground">{user.name}</p>
                      <p className="text-xs md:text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex px-2 md:px-3 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusColors[user.status]}`}>
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end gap-1 md:gap-2">
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
