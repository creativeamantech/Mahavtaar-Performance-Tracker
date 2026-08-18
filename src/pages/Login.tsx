import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff, Hexagon } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch {
      setError('Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center relative overflow-hidden bg-background">
      {/* Deep Field Elements */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/3 right-1/4 w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[150px] pointer-events-none" />
      
      <div className="w-full max-w-[380px] z-10 p-4">
        <div className="mb-8 text-center flex flex-col items-center">
          <div className="relative flex h-16 w-16 items-center justify-center text-primary mb-6">
            <Hexagon className="absolute inset-0 h-full w-full fill-primary/10 stroke-primary stroke-[1]" />
            <span className="z-10 font-heading text-2xl font-bold text-primary">M</span>
          </div>
          <h1 className="font-heading text-3xl font-bold uppercase tracking-[0.15em] text-primary mb-2">
            Mahavtaar
          </h1>
          <h2 className="font-heading text-sm font-medium tracking-[0.3em] text-muted-foreground uppercase">
            Ledger
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="glass-panel rounded-2xl p-8 relative overflow-hidden">
          {/* Subtle top amber border highlight */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
          
          <div className="mb-5">
            <label className="mb-1.5 block font-heading text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Email</label>
            <input
              type="email"
              autoFocus
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="h-10 w-full glass-input px-3 font-data text-sm text-foreground outline-none"
              placeholder="admin@company.com"
            />
          </div>

          <div className="mb-6">
            <label className="mb-1.5 block font-heading text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-10 w-full glass-input px-3 pr-10 font-data text-sm text-foreground outline-none"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-primary transition-colors"
              >
                {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {error && (
            <div className="mb-5 rounded-lg border border-destructive/20 bg-destructive/10 px-3 py-2.5 text-xs text-destructive text-center font-data">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="flex h-11 w-full items-center justify-center rounded-lg bg-primary font-heading text-sm font-bold uppercase tracking-[0.2em] text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-[0_0_20px_rgba(245,158,11,0.3)] disabled:opacity-50 disabled:hover:shadow-none"
          >
            {loading ? <div className="h-5 w-5 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> : 'Authenticate'}
          </button>
          
          <div className="mt-6 text-center">
            <p className="font-data text-xs text-muted-foreground/60">
              Demo access: admin@company.com / Admin@123
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
