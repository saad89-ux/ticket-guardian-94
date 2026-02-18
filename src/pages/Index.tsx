import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Ticket, Shield, Headphones, Users, ArrowRight, CheckCircle, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
            <Ticket size={18} className="text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground text-lg">SupportDesk</span>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/login"><Button variant="outline" size="sm">Sign In</Button></Link>
          <Link to="/signup"><Button size="sm">Get Started</Button></Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="px-6 pt-16 pb-24 max-w-7xl mx-auto text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
            <Shield size={14} /> Enterprise-Grade Governance
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-foreground leading-tight max-w-4xl mx-auto">
            Customer Support
            <span className="text-primary"> Governance</span> System
          </h1>
          <p className="text-lg text-muted-foreground mt-6 max-w-2xl mx-auto">
            A structured, auditable, performance-driven support ecosystem with role-based access control, SLA monitoring, and regulatory-style governance.
          </p>
          <div className="flex items-center justify-center gap-4 mt-8">
            <Link to="/signup"><Button size="lg">Start Free <ArrowRight size={16} className="ml-2" /></Button></Link>
            <Link to="/login"><Button variant="outline" size="lg">Sign In</Button></Link>
          </div>
        </motion.div>
      </section>

      {/* Features */}
      <section className="px-6 pb-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <Users size={28} />, title: 'Support Users', desc: 'Create tickets, upload evidence, track status in real-time with full audit visibility.' },
            { icon: <Headphones size={28} />, title: 'Support Agents', desc: 'Investigate, assign, resolve tickets with performance tracking and department-based queues.' },
            { icon: <Shield size={28} />, title: 'Super Admins', desc: 'Monitor SLAs, manage agents, view analytics dashboards, and access complete audit trails.' },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + i * 0.1 }}
              className="glass-card rounded-2xl p-8 text-center"
            >
              <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary mx-auto mb-4">
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="px-6 pb-24 max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Tickets Managed', value: '10K+' },
            { label: 'Resolution Rate', value: '99.2%' },
            { label: 'Avg Resolution', value: '18.5h' },
            { label: 'Active Agents', value: '50+' },
          ].map((stat, i) => (
            <motion.div key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 + i * 0.1 }} className="glass-card rounded-xl p-6 text-center">
              <p className="text-2xl font-bold text-primary">{stat.value}</p>
              <p className="text-sm text-muted-foreground mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 text-center text-sm text-muted-foreground">
        <p>© 2024 SupportDesk. Enterprise Customer Support Governance System.</p>
      </footer>
    </div>
  );
};

export default Index;
