import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Ticket, Eye, EyeOff } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      const success = login(email, password);
      if (success) {
        toast.success('Login successful!');
        // Auth context sets user, ProtectedRoute handles redirect
        const user = email.includes('admin') ? '/superadmin/dashboard' : email.includes('support') ? '/agent/dashboard' : '/dashboard';
        navigate(user);
      } else {
        toast.error('Invalid credentials. Try one of the demo accounts.');
      }
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex bg-background">
      {/* Left - Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
              <Ticket size={20} className="text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">SupportDesk</span>
          </div>

          <h1 className="text-2xl font-bold text-foreground mb-1">Welcome back</h1>
          <p className="text-muted-foreground mb-8">Sign in to your account to continue</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1.5" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <div className="relative mt-1.5">
                <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={e => setPassword(e.target.value)} required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-sm text-center text-muted-foreground mt-6">
            Don't have an account? <Link to="/signup" className="text-primary font-medium hover:underline">Sign up</Link>
          </p>

          {/* Demo accounts */}
          <div className="mt-8 p-4 rounded-xl bg-secondary/50 border border-border">
            <p className="text-xs font-semibold text-foreground mb-3">Demo Accounts</p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <button onClick={() => { setEmail('john@example.com'); setPassword('demo'); }} className="block w-full text-left hover:text-primary transition-colors">
                👤 <span className="font-medium">User:</span> john@example.com
              </button>
              <button onClick={() => { setEmail('ahmed@support.com'); setPassword('demo'); }} className="block w-full text-left hover:text-primary transition-colors">
                🛠️ <span className="font-medium">Agent:</span> ahmed@support.com
              </button>
              <button onClick={() => { setEmail('admin@support.com'); setPassword('demo'); }} className="block w-full text-left hover:text-primary transition-colors">
                👑 <span className="font-medium">Admin:</span> admin@support.com
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Right - Hero */}
      <div className="hidden lg:flex flex-1 bg-primary items-center justify-center p-12">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-center text-primary-foreground max-w-lg"
        >
          <div className="h-20 w-20 rounded-2xl bg-primary-foreground/20 flex items-center justify-center mx-auto mb-8">
            <Ticket size={40} className="text-primary-foreground" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Enterprise Support Governance</h2>
          <p className="text-primary-foreground/80 text-lg">
            A structured, auditable, performance-driven support ecosystem with role-based access control and SLA monitoring.
          </p>
          <div className="mt-10 grid grid-cols-3 gap-4 text-center">
            <div className="p-3 rounded-xl bg-primary-foreground/10">
              <p className="text-2xl font-bold">250+</p>
              <p className="text-xs text-primary-foreground/70">Tickets Managed</p>
            </div>
            <div className="p-3 rounded-xl bg-primary-foreground/10">
              <p className="text-2xl font-bold">99.2%</p>
              <p className="text-xs text-primary-foreground/70">Resolution Rate</p>
            </div>
            <div className="p-3 rounded-xl bg-primary-foreground/10">
              <p className="text-2xl font-bold">18.5h</p>
              <p className="text-xs text-primary-foreground/70">Avg Resolution</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default LoginPage;
