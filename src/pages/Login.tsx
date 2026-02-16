import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Send } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import logo from '@/assets/logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showResetForm, setShowResetForm] = useState(false);
  const [resetEmail, setResetEmail] = useState('');

  const { login, isAuthenticated, requestPasswordReset } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    const result = login(email, password);
    if (result) {
      navigate('/dashboard');
    } else {
      setError('Email ou mot de passe incorrect, ou compte inactif.');
    }
    setIsLoading(false);
  };

  const handleResetRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!resetEmail.trim()) {
      setError('Veuillez entrer votre adresse email.');
      return;
    }
    const sent = requestPasswordReset(resetEmail);
    if (sent) {
      setSuccess('Demande envoyée ! L\'administrateur doit approuver la réinitialisation de votre mot de passe.');
      setResetEmail('');
    } else {
      setError('Aucun compte trouvé avec cette adresse email.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-success/5 via-background to-primary/5 p-4">
      {/* Decorative circles */}
      <div className="fixed top-[-120px] right-[-120px] w-[300px] h-[300px] rounded-full bg-success/5 blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-100px] left-[-100px] w-[250px] h-[250px] rounded-full bg-primary/5 blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="w-24 h-24 mx-auto mb-4 rounded-3xl bg-card shadow-lg border border-border/30 flex items-center justify-center p-3">
          <img src={logo} alt="Ferme Diallo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-4xl font-black tracking-tight text-foreground">
          Ferme <span className="text-success">Diallo</span>
        </h1>
        <p className="text-muted-foreground mt-2 text-sm">
          Gestion intelligente de votre élevage
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-md bg-card rounded-3xl p-8 shadow-xl border border-border/30 animate-scale-in backdrop-blur-sm">
        {showResetForm ? (
          <>
            <button
              onClick={() => { setShowResetForm(false); setError(''); setSuccess(''); }}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
            >
              <ArrowLeft size={16} /> Retour à la connexion
            </button>
            <h2 className="text-2xl font-bold text-foreground mb-2">
              Réinitialiser le mot de passe
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              Entrez votre email. L'administrateur devra approuver la demande.
            </p>
            <form onSubmit={handleResetRequest} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Adresse email</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    className="h-12 pl-12 rounded-xl bg-secondary border-0"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm text-center animate-fade-in">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 rounded-xl bg-success/10 text-success text-sm text-center animate-fade-in">
                  {success}
                </div>
              )}

              <Button type="submit" className="w-full h-12 rounded-xl font-semibold bg-success hover:bg-success/90 text-success-foreground btn-press gap-2">
                <Send size={18} />
                Envoyer la demande
              </Button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-2xl font-bold text-foreground mb-6">Se connecter</h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">Email</Label>
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
                <Label htmlFor="password" className="text-foreground font-medium">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pl-12 pr-12 rounded-xl bg-secondary border-0"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => { setShowResetForm(true); setError(''); }}
                  className="text-success text-sm hover:underline font-medium"
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

            <div className="mt-6 p-4 rounded-2xl bg-secondary/50 space-y-2">
              <p className="text-xs font-semibold text-foreground text-center mb-2">Comptes de démonstration</p>
              <p className="text-xs text-muted-foreground text-center">
                <span className="font-medium text-foreground">Fermier:</span>{' '}
                admin@gmail.com / Di@llo2026
              </p>
              <p className="text-xs text-muted-foreground text-center">
                <span className="font-medium text-foreground">Gestionnaire:</span>{' '}
                gestionnaire@gmail.com / Gest@2026
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
