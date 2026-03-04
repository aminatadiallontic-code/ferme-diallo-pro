import { useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import { Camera, Lock, User, Globe, Bell } from 'lucide-react';

const Parametres = () => {
  const { hasAccess, user, updateProfile, updateLogo, logo } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [systemName, setSystemName] = useState('Ferme Diallo');
  const [notificationEmail, setNotificationEmail] = useState('admin@fermediallo.com');
  const [timezone, setTimezone] = useState('Africa/Conakry');
  const [language, setLanguage] = useState('fr');
  const [notifications, setNotifications] = useState(true);
  const [autoReports, setAutoReports] = useState(true);
  const [dataRetention, setDataRetention] = useState('12');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const [newName, setNewName] = useState(user?.name || '');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!hasAccess('parametres')) {
    return <Navigate to="/dashboard/clients" replace />;
  }

  const handleSave = () => toast.success('Paramètres enregistrés');

  const handleProfileSave = () => {
    const updates: { name?: string; password?: string } = {};
    if (newName && newName !== user?.name) updates.name = newName;
    if (newPassword) {
      if (newPassword !== confirmPassword) { toast.error('Les mots de passe ne correspondent pas'); return; }
      if (newPassword.length < 6) { toast.error('Min. 6 caractères requis'); return; }
      updates.password = newPassword;
    }
    if (Object.keys(updates).length === 0) { toast.info('Aucune modification'); return; }
    updateProfile(updates);
    setNewPassword('');
    setConfirmPassword('');
    toast.success('Profil mis à jour');
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { toast.error('Fichier trop volumineux (max 2 Mo)'); return; }
    const reader = new FileReader();
    reader.onload = (ev) => { updateLogo(ev.target?.result as string); toast.success('Logo mis à jour'); };
    reader.readAsDataURL(file);
  };

  return (
    <div className="animate-fade-in space-y-6">
      <Header title="Paramètres" />

      {/* Profile */}
      <div className="card-xl p-5 md:p-7">
        <h2 className="text-sm font-bold text-foreground mb-5 flex items-center gap-2">
          <User size={16} /> Mon Profil
        </h2>

        <div className="space-y-5 max-w-xl">
          {/* Logo */}
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Logo</Label>
            <div className="flex items-center gap-3">
              <div
                className="w-16 h-16 rounded-xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden cursor-pointer hover:border-success transition-colors"
                onClick={() => fileInputRef.current?.click()}
              >
                {logo ? <img src={logo} alt="Logo" className="w-full h-full object-contain" /> : <Camera className="text-muted-foreground" size={22} />}
              </div>
              <div>
                <Button variant="outline" className="rounded-xl h-9 text-xs" onClick={() => fileInputRef.current?.click()}>Changer</Button>
                <p className="text-[11px] text-muted-foreground mt-1">PNG, JPG · Max 2 Mo</p>
              </div>
              <input ref={fileInputRef} type="file" accept="image/png,image/jpeg,image/webp" className="hidden" onChange={handleLogoChange} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Nom</Label>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} className="h-11 rounded-xl bg-secondary/60 border-0" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium flex items-center gap-1.5"><Lock size={13} /> Nouveau mot de passe</Label>
            <Input type="password" placeholder="Nouveau mot de passe" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="h-11 rounded-xl bg-secondary/60 border-0" />
            <Input type="password" placeholder="Confirmer" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="h-11 rounded-xl bg-secondary/60 border-0" />
          </div>

          <Button onClick={handleProfileSave} className="h-10 px-6 rounded-xl font-semibold btn-press text-sm">
            Mettre à jour
          </Button>
        </div>
      </div>

      {/* General */}
      <div className="card-xl p-5 md:p-7">
        <h2 className="text-sm font-bold text-foreground mb-5 flex items-center gap-2">
          <Globe size={16} /> Paramètres généraux
        </h2>

        <div className="space-y-5 max-w-xl">
          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Nom du système</Label>
            <Input value={systemName} onChange={(e) => setSystemName(e.target.value)} className="h-11 rounded-xl bg-secondary/60 border-0" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Email de notification</Label>
            <Input type="email" value={notificationEmail} onChange={(e) => setNotificationEmail(e.target.value)} className="h-11 rounded-xl bg-secondary/60 border-0" />
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Fuseau horaire</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger className="h-11 rounded-xl bg-secondary/60 border-0"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Africa/Conakry">Africa/Conakry</SelectItem>
                <SelectItem value="Africa/Dakar">Africa/Dakar</SelectItem>
                <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                <SelectItem value="UTC">UTC</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Langue</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="h-11 rounded-xl bg-secondary/60 border-0"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium cursor-pointer flex items-center gap-1.5"><Bell size={13} /> Notifications</Label>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium cursor-pointer">Rapports automatiques</Label>
              <Switch checked={autoReports} onCheckedChange={setAutoReports} />
            </div>
            <div className="flex items-center justify-between">
              <Label className="text-xs font-medium cursor-pointer">Mode maintenance</Label>
              <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs font-medium">Rétention des données</Label>
            <Select value={dataRetention} onValueChange={setDataRetention}>
              <SelectTrigger className="h-11 rounded-xl bg-secondary/60 border-0"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="6">6 mois</SelectItem>
                <SelectItem value="12">12 mois</SelectItem>
                <SelectItem value="24">24 mois</SelectItem>
                <SelectItem value="36">36 mois</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSave} className="h-10 px-6 rounded-xl font-semibold bg-success hover:bg-success/90 text-success-foreground btn-press text-sm">
            Enregistrer
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Parametres;
