import { useState } from 'react';
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

const Parametres = () => {
  const { hasAccess } = useAuth();
  const [systemName, setSystemName] = useState('Ferme Diallo');
  const [notificationEmail, setNotificationEmail] = useState('admin@fermediallo.com');
  const [timezone, setTimezone] = useState('Europe/Paris');
  const [language, setLanguage] = useState('fr');
  const [notifications, setNotifications] = useState(true);
  const [autoReports, setAutoReports] = useState(true);
  const [dataRetention, setDataRetention] = useState('12');
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  // Gestionnaire cannot access parametres
  if (!hasAccess('parametres')) {
    return <Navigate to="/dashboard/clients" replace />;
  }

  const handleSave = () => {
    toast.success('Paramètres enregistrés avec succès');
  };

  return (
    <div className="animate-fade-in">
      <Header title="Paramètres" />

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
  );
};

export default Parametres;
