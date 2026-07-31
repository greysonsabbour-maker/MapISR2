import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { Button, Input } from '@/components/ui';
import { APP_NAME, APP_SUBTITLE } from '@/config/constants';
import { Train } from 'lucide-react';

export function LoginPage() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const success = login(password);
    if (success) {
      navigate('/dashboard');
    } else {
      setError('Invalid password. Please try again.');
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 h-full w-full rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 h-full w-full rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md animate-slide-in">
        <div className="glass-panel p-8 shadow-2xl">
          <div className="mb-8 text-center">
            <img
              src="/assets/logo-full.png"
              alt="Ironstate Railroad"
              className="mx-auto mb-4 h-20 object-contain"
            />
            <h1 className="text-2xl font-bold text-foreground">{APP_NAME}</h1>
            <p className="mt-1 text-sm text-foreground/50">{APP_SUBTITLE}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Access Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              autoFocus
              error={error}
            />
            <Button type="submit" className="w-full" loading={loading}>
              <Train size={16} />
              Enter Operations Center
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-foreground/30">
            Ironstate Railroad — Live Operations Viewer
          </p>
        </div>
      </div>
    </div>
  );
}
