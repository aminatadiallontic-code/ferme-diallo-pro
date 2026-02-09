import { useState, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/layout/Header';
import { Camera, Lock, User } from 'lucide-react';

const Parametres = () => {
  const { hasAccess, user, updateProfile, updateLogo, logo } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [systemName, setSystemName] = useState('Ferme Diallo');
  const [notificationEmail, setNotificationEmail] = useState('admin@fermediallo.com');
  const [timezone, setTimezone] = useState('Europe/Paris');
  const [language, setLanguage] = useState('fr');
  const [notifications, setNotifications] = useState(true);
  const [autoReports, setAutoReports] = useState(true);
  const [dataRetention, setDataRetention] = useState('12');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Profile fields
  const [newName, setNewName] = useState(user?.name || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!hasAccess('parametres')) {
    return <Navigate to="/dashboard/clients" replace />;
  }

  const handleSave = () => {
    toast.success('Paramètres enregistrés avec succès');
  };

  const handleProfileSave = () => {
    const updates: { name?: string; password?: string } = {};
    if (newName && newName !== user?.name) {
      updates.name = newName;
    }
    if (newPassword) {
      if (newPassword !== confirmPassword) {
        toast.error('Les mots de passe ne correspondent pas');
        return;
      }
      if (newPassword.length < 6) {
        toast.error('Le mot de passe doit contenir au moins 6 caractères');
        return;
      }
      updates.password = newPassword;
    }
    if (Object.keys(updates).length === 0) {
      toast.info('Aucune modification détectée');
      return;
    }
    updateProfile(updates);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    toast.success('Profil mis à jour avec succès');
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      toast.error('Le fichier est trop volumineux (max 2 Mo)');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      updateLogo(result);
      toast.success('Logo mis à jour avec succès');
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="animate-fade-in">
      <Header title="Paramètres" />

      <div className="space-y-8">
        {/* Profile Section */}
        <div className="bg-card rounded-2xl p-4 md:p-8 border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-6 flex items-center gap-2">
            <User size={22} /> Mon Profil
          </h2>

          <div className="space-y-6 max-w-2xl">
            {/* Logo Upload */}
            <div className="space-y-2">
              <Label className="text-foreground font-medium">Logo de l'entreprise</Label>
              <div className="flex items-center gap-4">
                <div
                  className="w-20 h-20 rounded-2xl border-2 border-dashed border-border flex items-center justify-center overflow-hidden cursor-pointer hover:border-success transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {logo ? (
                    <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                  ) : (
                    <Camera className="text-muted-foreground" size={28} />
                  )}
                </div>
                <div>
                  <Button
                    variant="outline"
                    className="rounded-xl"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Changer le logo
                  </Button>
                  <p className="text-xs text-muted-foreground mt-1">PNG, JPG. Max 2 Mo.</p>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={handleLogoChange}
                />
              </div>
            </div>

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="profileName" className="text-foreground font-medium">
                Nom d'utilisateur
              </Label>
              <Input
                id="profileName"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="h-12 rounded-xl bg-secondary border-0"
              />
            </div>

            {/* Password Change */}
            <div className="space-y-2">
              <Label className="text-foreground font-medium flex items-center gap-2">
                <Lock size={16} /> Changer le mot de passe
              </Label>
              <Input
                type="password"
                placeholder="Nouveau mot de passe"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="h-12 rounded-xl bg-secondary border-0"
              />
              <Input
                type="password"
                placeholder="Confirmer le mot de passe"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-12 rounded-xl bg-secondary border-0"
              />
            </div>

            <div className="pt-2">
              <Button
                onClick={handleProfileSave}
                className="h-12 px-8 rounded-xl font-semibold bg-primary hover:bg-primary/90 text-primary-foreground btn-press"
              >
                Mettre à jour le profil
              </Button>
            </div>
          </div>
        </div>

        {/* General Settings */}
        <div className="bg-card rounded-2xl p-4 md:p-8 border border-border">
          <h2 className="text-xl font-semibold text-foreground mb-6">
            Paramètres généraux
          </h2>

          <div className="space-y-6 max-w-2xl">
            <div className="space-y-2">
              <Label htmlFor="systemName" className="text-foreground font-medium">
                Nom du système
              </Label>
              <Input
                id="systemName"
                value={systemName}
                onChange={(e) => setSystemName(e.target.value)}
                className="h-12 rounded-xl bg-secondary border-0"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-foreground font-medium">
                Email de notification
              </Label>
              <Input
                id="email"
                type="email"
                value={notificationEmail}
                onChange={(e) => setNotificationEmail(e.target.value)}
                className="h-12 rounded-xl bg-secondary border-0"
              />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground font-medium">Fuseau horaire</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger className="h-12 rounded-xl bg-secondary border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                  <SelectItem value="Africa/Dakar">Africa/Dakar</SelectItem>
                  <SelectItem value="Africa/Abidjan">Africa/Abidjan</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground font-medium">Langue</Label>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="h-12 rounded-xl bg-secondary border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ar">العربية</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between py-2">
              <Label htmlFor="notifications" className="text-foreground font-medium cursor-pointer">
                Notifications
              </Label>
              <Switch id="notifications" checked={notifications} onCheckedChange={setNotifications} />
            </div>

            <div className="flex items-center justify-between py-2">
              <Label htmlFor="autoReports" className="text-foreground font-medium cursor-pointer">
                Rapports automatiques
              </Label>
              <Switch id="autoReports" checked={autoReports} onCheckedChange={setAutoReports} />
            </div>

            <div className="space-y-2">
              <Label className="text-foreground font-medium">Rétention des données (mois)</Label>
              <Select value={dataRetention} onValueChange={setDataRetention}>
                <SelectTrigger className="h-12 rounded-xl bg-secondary border-0">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="6">6 mois</SelectItem>
                  <SelectItem value="12">12 mois</SelectItem>
                  <SelectItem value="24">24 mois</SelectItem>
                  <SelectItem value="36">36 mois</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between py-2">
              <Label htmlFor="maintenance" className="text-foreground font-medium cursor-pointer">
                Mode maintenance
              </Label>
              <Switch id="maintenance" checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
            </div>

            <div className="pt-4">
              <Button
                onClick={handleSave}
                className="h-12 px-8 rounded-xl font-semibold bg-success hover:bg-success/90 text-white btn-press"
              >
                Enregistrer les modifications
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Parametres;
