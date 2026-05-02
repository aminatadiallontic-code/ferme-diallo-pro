import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { api } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ResetPassword = () => {
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get('token') || '';
  const email = params.get('email') || '';

  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const canSubmit = useMemo(() => {
    return !!token && !!email && password.length >= 8 && password === passwordConfirmation;
  }, [token, email, password, passwordConfirmation]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!token || !email) {
      setError('Lien invalide ou incomplet.');
      return;
    }

    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }

    if (password !== passwordConfirmation) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }

    setIsLoading(true);
    try {
      const resp = await api.post<{ message?: string }>('/api/auth/reset-password', {
        email,
        token,
        password,
        password_confirmation: passwordConfirmation,
      });

      setSuccess(resp?.message ? String(resp.message) : 'Mot de passe réinitialisé.');
      setTimeout(() => navigate('/'), 800);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      try {
        const parsed = JSON.parse(message) as { message?: string; errors?: Record<string, string[] | string> };
        const firstFieldError = parsed?.errors ? Object.values(parsed.errors)[0] : undefined;
        const fieldMsg = Array.isArray(firstFieldError) ? String(firstFieldError[0]) : firstFieldError ? String(firstFieldError) : '';
        setError(fieldMsg || (parsed?.message ? String(parsed.message) : 'Échec de la réinitialisation.'));
      } catch {
        setError(message || 'Échec de la réinitialisation.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="w-full max-w-[420px] bg-card rounded-2xl p-7 shadow-sm border border-border/60 animate-scale-in">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-4 transition-colors font-medium"
        >
          <ArrowLeft size={14} /> Retour
        </button>

        <h2 className="text-xl font-extrabold text-foreground mb-1 tracking-tight">Nouveau mot de passe</h2>
        <p className="text-xs text-muted-foreground mb-5">Définis un nouveau mot de passe pour {email || 'ton compte'}.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="password" className="text-xs font-medium">Mot de passe</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 pl-10 rounded-xl bg-secondary/80 border-0"
                required
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password_confirmation" className="text-xs font-medium">Confirmer</Label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
              <Input
                id="password_confirmation"
                type="password"
                placeholder="••••••••"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="h-11 pl-10 rounded-xl bg-secondary/80 border-0"
                required
              />
            </div>
          </div>

          {!token || !email ? (
            <div className="p-3 rounded-xl bg-destructive/5 text-destructive text-xs text-center animate-fade-in border border-destructive/10">
              Lien invalide. Vérifie que tu as ouvert le lien complet depuis l’email.
            </div>
          ) : null}

          {error && (
            <div className="p-3 rounded-xl bg-destructive/5 text-destructive text-xs text-center animate-fade-in border border-destructive/10">{error}</div>
          )}

          {success && (
            <div className="p-3 rounded-xl bg-success/5 text-success text-xs text-center animate-fade-in border border-success/10 flex items-center justify-center gap-2">
              <CheckCircle2 size={16} /> {success}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-11 rounded-xl font-semibold bg-success hover:bg-success/90 text-success-foreground btn-press text-sm"
            disabled={!canSubmit || isLoading}
          >
            {isLoading ? 'Envoi...' : 'Réinitialiser'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
