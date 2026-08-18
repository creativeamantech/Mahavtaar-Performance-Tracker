import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

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
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary font-heading text-lg font-bold text-primary-foreground">
            LC
          </div>
          <h1 className="font-heading text-2xl font-extrabold uppercase tracking-wide text-primary">
            Loan Collection Tracker
          </h1>
          <p className="mt-1 font-data text-xs text-muted-foreground">EMI · Settlement · Rollback Management</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-lg border border-border bg-card p-6">
          <div className="mb-4">
            <label className="mb-1 block font-data text-[10px] uppercase tracking-[2px] text-muted-foreground">Email</label>
            <input
              type="email"
              autoFocus
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="h-8 w-full rounded-md border border-border bg-input px-3 font-data text-xs text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
              placeholder="admin@company.com"
            />
          </div>
          <div className="mb-4">
            <label className="mb-1 block font-data text-[10px] uppercase tracking-[2px] text-muted-foreground">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="h-8 w-full rounded-md border border-border bg-input px-3 pr-8 font-data text-xs text-foreground outline-none transition-colors focus:border-primary focus:ring-1 focus:ring-primary"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPass(s => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPass ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>
          {error && <div className="mb-3 rounded bg-destructive/10 px-3 py-2 text-xs text-destructive">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="flex h-[34px] w-full items-center justify-center rounded-md bg-primary font-heading text-xs font-bold uppercase tracking-wider text-primary-foreground transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {loading ? <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" /> : 'Sign In'}
          </button>
          <p className="mt-3 text-center font-data text-[10px] text-muted-foreground">
            Demo: admin@company.com / Admin@123
          </p>
        </form>
      </div>
    </div>
  );
}
