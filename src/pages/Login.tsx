import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    await new Promise(resolve => setTimeout(resolve, 500));

    const success = login(email, password);
    
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Email ou mot de passe incorrect');
    }
    
    setIsLoading(false);
  };

  const handleForgotPassword = () => {
    // Show hint for now
    setError('Contactez l\'administrateur pour réinitialiser votre mot de passe.');
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-success/5 p-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-success">
          Ferme Diallo
        </h1>
        <p className="text-success mt-2">
          Gestion intelligente de votre élevage
        </p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md bg-card rounded-3xl p-8 shadow-lg border border-border/30 animate-scale-in">
        <h2 className="text-2xl font-semibold text-foreground mb-6">
          Se connecter
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-foreground font-medium">
              Email
            </Label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                id="email"
                type="email"
                placeholder="exemple@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 pl-12 rounded-xl bg-secondary border-0"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-foreground font-medium">
              Mot de passe
            </Label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 pl-12 rounded-xl bg-secondary border-0"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button 
              type="button" 
              onClick={handleForgotPassword}
              className="text-success text-sm hover:underline"
            >
              Mot de passe oublié ?
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm text-center animate-fade-in">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 rounded-xl font-semibold bg-success hover:bg-success/90 text-success-foreground btn-press"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-success-foreground/30 border-t-success-foreground rounded-full animate-spin" />
                Connexion...
              </span>
            ) : (
              'Se connecter'
            )}
          </Button>
        </form>

        {/* Demo credentials hint */}
        <div className="mt-6 p-3 rounded-xl bg-secondary/50 text-center space-y-1">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Fermier:</span>{' '}
            admin@gmail.com / Di@llo2026
          </p>
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">Gestionnaire:</span>{' '}
            gestionnaire@gmail.com / Gest@2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
