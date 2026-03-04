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
      setSuccess("Demande envoyée ! L'administrateur doit approuver la réinitialisation.");
      setResetEmail('');
    } else {
      setError('Aucun compte trouvé avec cette adresse email.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Decorative elements */}
      <div className="fixed top-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full bg-success/[0.04] blur-3xl pointer-events-none" />
      <div className="fixed bottom-[-150px] left-[-150px] w-[400px] h-[400px] rounded-full bg-primary/[0.03] blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="w-20 h-20 mx-auto mb-5 rounded-2xl bg-card shadow-sm border border-border/60 flex items-center justify-center p-3">
          <img src={logo} alt="Ferme Diallo" className="w-full h-full object-contain" />
        </div>
        <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
          Ferme <span className="text-success">Diallo</span>
        </h1>
        <p className="text-muted-foreground mt-1.5 text-sm">
          Gestion intelligente de votre élevage
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-[420px] bg-card rounded-2xl p-7 shadow-sm border border-border/60 animate-scale-in">
        {showResetForm ? (
          <>
            <button
              onClick={() => { setShowResetForm(false); setError(''); setSuccess(''); }}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors font-medium"
            >
              <ArrowLeft size={14} /> Retour
            </button>
            <h2 className="text-xl font-extrabold text-foreground mb-1 tracking-tight">
              Réinitialiser le mot de passe
            </h2>
            <p className="text-xs text-muted-foreground mb-5">
              L'administrateur devra approuver la demande.
            </p>
            <form onSubmit={handleResetRequest} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="reset-email" className="text-xs font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    id="reset-email" type="email" placeholder="votre@email.com"
                    value={resetEmail} onChange={(e) => setResetEmail(e.target.value)}
                    className="h-11 pl-10 rounded-xl bg-secondary/80 border-0" required
                  />
                </div>
              </div>

              {error && <div className="p-3 rounded-xl bg-destructive/5 text-destructive text-xs text-center animate-fade-in border border-destructive/10">{error}</div>}
              {success && <div className="p-3 rounded-xl bg-success/5 text-success text-xs text-center animate-fade-in border border-success/10">{success}</div>}

              <Button type="submit" className="w-full h-11 rounded-xl font-semibold bg-success hover:bg-success/90 text-success-foreground btn-press gap-2 text-sm">
                <Send size={16} /> Envoyer la demande
              </Button>
            </form>
          </>
        ) : (
          <>
            <h2 className="text-xl font-extrabold text-foreground mb-5 tracking-tight">Se connecter</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    id="email" type="email" placeholder="exemple@email.com"
                    value={email} onChange={(e) => setEmail(e.target.value)}
                    className="h-11 pl-10 rounded-xl bg-secondary/80 border-0" required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium">Mot de passe</Label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                  <Input
                    id="password" type={showPassword ? 'text' : 'password'} placeholder="••••••••"
                    value={password} onChange={(e) => setPassword(e.target.value)}
                    className="h-11 pl-10 pr-11 rounded-xl bg-secondary/80 border-0" required
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="button" onClick={() => { setShowResetForm(true); setError(''); }}
                  className="text-success text-xs hover:underline font-medium">
                  Mot de passe oublié ?
                </button>
              </div>

              {error && <div className="p-3 rounded-xl bg-destructive/5 text-destructive text-xs text-center animate-fade-in border border-destructive/10">{error}</div>}

              <Button type="submit" className="w-full h-11 rounded-xl font-semibold bg-success hover:bg-success/90 text-success-foreground btn-press text-sm" disabled={isLoading}>
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-success-foreground/30 border-t-success-foreground rounded-full animate-spin" />
                    Connexion...
                  </span>
                ) : 'Se connecter'}
              </Button>
            </form>

            <div className="mt-5 p-3.5 rounded-xl bg-secondary/60 space-y-1.5">
              <p className="text-[10px] font-semibold text-muted-foreground text-center uppercase tracking-wider mb-2">Comptes démo</p>
              <p className="text-[11px] text-muted-foreground text-center">
                <span className="font-semibold text-foreground">Admin:</span> admin@gmail.com / Di@llo2026
              </p>
              <p className="text-[11px] text-muted-foreground text-center">
                <span className="font-semibold text-foreground">Gestionnaire:</span> gestionnaire@gmail.com / Gest@2026
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Login;
