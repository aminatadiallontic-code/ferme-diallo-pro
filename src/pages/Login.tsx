import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import logoFerme from '@/assets/logo-ferme.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const success = login(email, password);
    
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Email ou mot de passe incorrect');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-[480px] card-xl p-8 animate-scale-in">
        {/* Logo and Title */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-24 h-24 mb-4 rounded-full bg-secondary flex items-center justify-center overflow-hidden">
            <img 
              src={logoFerme} 
              alt="Ferme Diallo" 
              className="w-20 h-20 object-contain"
            />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-foreground">
            Ferme Diallo
          </h1>
          <p className="text-muted-foreground mt-1">
            Gestion Avicole Professionnelle
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Adresse email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@diallo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 rounded-xl"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Mot de passe</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 rounded-xl pr-12"
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

          {error && (
            <div className="p-3 rounded-xl bg-destructive/10 text-destructive text-sm text-center animate-fade-in">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full h-12 rounded-xl font-semibold btn-press"
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                Connexion...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <LogIn size={20} />
                Se connecter
              </span>
            )}
          </Button>
        </form>

        {/* Demo credentials hint */}
        <div className="mt-6 p-4 rounded-xl bg-secondary text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Identifiants de démo:</span>
            <br />
            admin@gmail.com / Di@llo2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
