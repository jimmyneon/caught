import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export default function AuthPage() {
  const navigate = useNavigate();
  const { user, signInWithEmail, signUpWithEmail, isSupabaseConfigured } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Redirect to home when user becomes available
  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      if (mode === 'signin') {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password);
        setInfo('Check your email for a confirmation link, then sign in.');
      }
    } catch (err: any) {
      setError(err.message ?? 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full flex-col justify-center px-6 py-8">
      <div className="w-full">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: 'var(--c-accent)' }}>
            <span className="text-2xl font-extrabold text-white">C</span>
          </div>
          <div className="text-center">
            <h1 className="text-xl font-extrabold text-ink">Caught</h1>
            <p className="mt-0.5 text-sm text-ink-3">
              {mode === 'signin' ? 'Sign in to sync your catches' : 'Create an account'}
            </p>
          </div>
        </div>

        {!isSupabaseConfigured && (
          <div className="mb-4 rounded-xl p-3 text-xs text-ink-3" style={{ background: 'var(--c-surface-3)' }}>
            Cloud sync not configured yet. You can still use the app locally.
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            className="field w-full"
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
          />
          <input
            className="field w-full"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            minLength={6}
          />

          {error && (
            <div className="rounded-xl p-3 text-xs font-medium" style={{ background: 'var(--c-red-soft)', color: 'var(--c-red-accent)' }}>
              {error}
            </div>
          )}
          {info && (
            <div className="rounded-xl p-3 text-xs font-medium" style={{ background: 'var(--c-accent-bg)', color: 'var(--c-accent)' }}>
              {info}
            </div>
          )}

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading || !isSupabaseConfigured}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 size={18} className="animate-spin" /> Please wait…
              </span>
            ) : mode === 'signin' ? 'Sign in' : 'Sign up'}
          </button>
        </form>

        {/* Mode toggle */}
        <button
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setInfo(null); }}
          className="mt-4 w-full text-center text-sm font-medium text-ink-3"
        >
          {mode === 'signin' ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>

        <button
          onClick={() => navigate('/')}
          className="mt-2 w-full text-center text-xs text-ink-3"
        >
          Continue without account
        </button>
      </div>
    </div>
  );
}
