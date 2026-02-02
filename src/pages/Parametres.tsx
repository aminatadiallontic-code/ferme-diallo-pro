import { Settings } from 'lucide-react';

const Parametres = () => {
  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-1">
          Paramètres du Système
        </h1>
        <p className="text-muted-foreground">
          Configurez les paramètres de votre application
        </p>
      </div>

      <div className="bg-card rounded-2xl p-12 border border-border text-center">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-4">
          <Settings className="text-muted-foreground" size={32} />
        </div>
        <h2 className="text-xl font-semibold text-foreground mb-2">
          Page en construction
        </h2>
        <p className="text-muted-foreground">
          Les paramètres du système seront bientôt disponibles.
        </p>
      </div>
    </div>
  );
};

export default Parametres;
