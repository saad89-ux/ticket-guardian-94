import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Ticket } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const SignupPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      signup(name, email, password);
      toast.success('Account created successfully!');
      navigate('/dashboard');
      setLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 rounded-xl bg-primary flex items-center justify-center">
            <Ticket size={20} className="text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">SupportDesk</span>
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-1">Create an account</h1>
        <p className="text-muted-foreground mb-8">Sign up to start submitting support tickets</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input id="name" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)} required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1.5" />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" placeholder="Create a password" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1.5" />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </Button>
        </form>
        <p className="text-sm text-center text-muted-foreground mt-6">
          Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default SignupPage;
