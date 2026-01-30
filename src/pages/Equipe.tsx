import { useState } from 'react';
import { Search, Trash2, UserPlus, Mail, Phone, Shield } from 'lucide-react';
import Header from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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

interface TeamMember {
  id: number;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: 'actif' | 'inactif';
  joinDate: string;
}

const initialTeam: TeamMember[] = [
  { id: 1, name: 'Mamadou Diallo', email: 'mamadou@diallo.com', phone: '+221 77 123 45 67', role: 'Administrateur', status: 'actif', joinDate: '2020-01-15' },
  { id: 2, name: 'Fatou Sow', email: 'fatou.sow@ferme.com', phone: '+221 77 234 56 78', role: 'Gestionnaire', status: 'actif', joinDate: '2021-03-20' },
  { id: 3, name: 'Ousmane Ba', email: 'ousmane.ba@ferme.com', phone: '+221 77 345 67 89', role: 'Technicien', status: 'actif', joinDate: '2022-06-10' },
  { id: 4, name: 'Aissatou Ndiaye', email: 'aissatou.n@ferme.com', phone: '+221 77 456 78 90', role: 'Vétérinaire', status: 'actif', joinDate: '2021-09-05' },
  { id: 5, name: 'Ibrahima Fall', email: 'ibrahima.f@ferme.com', phone: '+221 77 567 89 01', role: 'Ouvrier', status: 'inactif', joinDate: '2023-01-12' },
  { id: 6, name: 'Mariama Diop', email: 'mariama.d@ferme.com', phone: '+221 77 678 90 12', role: 'Comptable', status: 'actif', joinDate: '2022-11-08' },
];

const roleColors: Record<string, string> = {
  'Administrateur': 'bg-primary/10 text-primary',
  'Gestionnaire': 'bg-success/10 text-success',
  'Technicien': 'bg-warning/10 text-warning',
  'Vétérinaire': 'bg-accent/10 text-accent',
  'Ouvrier': 'bg-muted text-muted-foreground',
  'Comptable': 'bg-destructive/10 text-destructive',
};

const Equipe = () => {
  const [team, setTeam] = useState<TeamMember[]>(initialTeam);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);

  const filteredTeam = team.filter(member =>
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = () => {
    if (deleteTarget) {
      setTeam(team.filter(m => m.id !== deleteTarget.id));
      setDeleteTarget(null);
    }
  };

  const activeCount = team.filter(m => m.status === 'actif').length;

  return (
    <div className="animate-slide-in">
      <Header title="Équipe" />

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-primary/10">
              <Shield className="text-primary" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total membres</p>
              <p className="text-2xl font-black text-foreground">{team.length}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-success/10">
              <UserPlus className="text-success" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Actifs</p>
              <p className="text-2xl font-black text-success">{activeCount}</p>
            </div>
          </div>
        </div>

        <div className="stat-card">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-muted">
              <UserPlus className="text-muted-foreground" size={24} />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Inactifs</p>
              <p className="text-2xl font-black text-muted-foreground">{team.length - activeCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card-xl p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
            <Input
              placeholder="Rechercher par nom, email ou rôle..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-xl"
            />
          </div>
          <Button className="h-12 rounded-xl btn-press gap-2">
            <UserPlus size={18} />
            Ajouter
          </Button>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredTeam.map((member) => (
            <div
              key={member.id}
              className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors group"
            >
              <Avatar className="h-14 w-14">
                <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-lg">
                  {member.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="font-semibold text-foreground truncate">
                    {member.name}
                  </p>
                  <span className={`badge-success ${member.status === 'inactif' ? '!bg-muted !text-muted-foreground' : ''}`}>
                    {member.status}
                  </span>
                </div>
                <span className={`inline-flex px-2 py-0.5 rounded-md text-xs font-medium ${roleColors[member.role] || 'bg-muted text-muted-foreground'}`}>
                  {member.role}
                </span>
                <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Mail size={14} />
                    {member.email}
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <Phone size={14} />
                  {member.phone}
                </div>
              </div>

              <Button
                variant="ghost"
                size="icon"
                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10 btn-press"
                onClick={() => setDeleteTarget(member)}
              >
                <Trash2 size={18} />
              </Button>
            </div>
          ))}
        </div>

        {filteredTeam.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>Aucun membre trouvé</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-[40px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-black">
              Supprimer ce membre ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer <strong>{deleteTarget?.name}</strong> de l'équipe ? Cette action est irréversible.
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

export default Equipe;
