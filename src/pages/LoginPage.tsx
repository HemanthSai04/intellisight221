import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import loginImg from '@/assets/login-3d.jpg';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Please fill in all fields'); return; }
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Welcome back!');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left - Image */}
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <img src={loginImg} alt="Smart System" className="w-full max-w-lg rounded-2xl relative z-10 animate-float" loading="lazy" width={800} height={900} />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
        <div className="absolute top-20 right-10 w-40 h-40 bg-neon-cyan/10 rounded-full blur-[80px]" />
      </div>

      {/* Right - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="font-display text-2xl font-bold gradient-text mb-2 block">INTELLISIGHT</Link>
          <h1 className="text-3xl font-display font-bold text-foreground mt-6 mb-2">Sign in</h1>
          <p className="text-muted-foreground mb-8">Welcome back. Sign in to access your dashboard.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="email" className="text-muted-foreground text-sm">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com" className="mt-1.5 bg-secondary border-border focus:border-primary" />
            </div>
            <div>
              <Label htmlFor="password" className="text-muted-foreground text-sm">Password</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••" className="mt-1.5 bg-secondary border-border focus:border-primary" />
            </div>
            <Button type="submit" variant="neon" className="w-full" size="lg" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="mt-6 text-center text-muted-foreground text-sm">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary hover:underline">Create Account</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
