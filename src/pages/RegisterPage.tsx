import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import loginImg from '@/assets/login-3d.jpg';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) { toast.error('Please fill in all fields'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    setLoading(true);
    const { error } = await signUp(email, password, fullName);
    setLoading(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Account created! Check your email to confirm.');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex bg-background">
      <div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        <img src={loginImg} alt="Smart System" className="w-full max-w-lg rounded-2xl relative z-10 animate-float" loading="lazy" width={800} height={900} />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full blur-[100px]" />
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <Link to="/" className="font-display text-2xl font-bold gradient-text mb-2 block">NEXUS AI</Link>
          <h1 className="text-3xl font-display font-bold text-foreground mt-6 mb-2">Sign up</h1>
          <p className="text-muted-foreground mb-8">Create your account to get started.</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="name" className="text-muted-foreground text-sm">Full Name</Label>
              <Input id="name" value={fullName} onChange={e => setFullName(e.target.value)}
                placeholder="John Doe" className="mt-1.5 bg-secondary border-border focus:border-primary" />
            </div>
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
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>

          <p className="mt-6 text-center text-muted-foreground text-sm">
            Already a member?{' '}
            <Link to="/login" className="text-primary hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
