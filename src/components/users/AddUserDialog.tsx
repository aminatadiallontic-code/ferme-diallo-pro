import { useState } from 'react';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth, UserRole } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

interface AddUserDialogProps {
  onUserAdded: () => void;
}

const AddUserDialog = ({ onUserAdded }: AddUserDialogProps) => {
  const { addUser } = useAuth();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: '' as string,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Le nom est requis';
    if (!form.email.trim()) errs.email = "L'email est requis";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Email invalide';
    if (!form.password.trim()) errs.password = 'Le mot de passe est requis';
    else if (form.password.length < 6) errs.password = 'Minimum 6 caractères';
    if (!form.role) errs.role = 'Le rôle est requis';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    addUser({
      name: form.name.trim(),
      email: form.email.trim(),
      password: form.password,
      role: form.role as UserRole,
    });

    toast({
      title: 'Utilisateur ajouté',
      description: `${form.name} a été ajouté en tant que ${form.role === 'fermier' ? 'Administrateur' : 'Gestionnaire'}.`,
    });

    setForm({ name: '', email: '', password: '', role: '' });
    setErrors({});
    setOpen(false);
    onUserAdded();
  };

  const resetForm = () => {
    setForm({ name: '', email: '', password: '', role: '' });
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
      <DialogTrigger asChild>
        <Button className="h-12 px-6 rounded-xl bg-success hover:bg-success/90 text-white gap-2 whitespace-nowrap">
          <UserPlus size={18} />
          <span className="hidden sm:inline">Ajouter un utilisateur</span>
          <span className="sm:hidden">Ajouter</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Nouvel utilisateur</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <Label htmlFor="user-name">Nom complet *</Label>
            <Input
              id="user-name"
              placeholder="Ex: Aminata Diallo"
              value={form.name}
              onChange={(e) => setForm(p => ({ ...p, name: e.target.value }))}
              className="h-12 rounded-xl"
            />
            {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-email">Email *</Label>
            <Input
              id="user-email"
              type="email"
              placeholder="Ex: aminata@gmail.com"
              value={form.email}
              onChange={(e) => setForm(p => ({ ...p, email: e.target.value }))}
              className="h-12 rounded-xl"
            />
            {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="user-password">Mot de passe *</Label>
            <Input
              id="user-password"
              type="password"
              placeholder="Minimum 6 caractères"
              value={form.password}
              onChange={(e) => setForm(p => ({ ...p, password: e.target.value }))}
              className="h-12 rounded-xl"
            />
            {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
          </div>
          <div className="space-y-2">
            <Label>Rôle *</Label>
            <Select value={form.role} onValueChange={(v) => setForm(p => ({ ...p, role: v }))}>
              <SelectTrigger className="h-12 rounded-xl">
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fermier">Administrateur (accès total)</SelectItem>
                <SelectItem value="gestionnaire">Gestionnaire (accès restreint)</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline" className="rounded-xl">Annuler</Button>
          </DialogClose>
          <Button onClick={handleSubmit} className="rounded-xl bg-success hover:bg-success/90 text-white">
            Ajouter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddUserDialog;
