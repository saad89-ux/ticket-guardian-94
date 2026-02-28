import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Stethoscope, Calendar, Brain, Shield, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

const features = [
  { icon: Stethoscope, title: 'Patient Management', desc: 'Complete digital patient records with medical history timeline' },
  { icon: Calendar, title: 'Appointment Booking', desc: 'Seamless scheduling with real-time status tracking' },
  { icon: Brain, title: 'AI Smart Diagnosis', desc: 'AI-powered symptom checker and risk assessment' },
  { icon: Shield, title: 'Role-Based Access', desc: 'Secure access for Admin, Doctor, Receptionist & Patient' },
  { icon: BarChart3, title: 'Analytics Dashboard', desc: 'Real-time insights on clinic performance and trends' },
  { icon: Heart, title: 'Prescription System', desc: 'Digital prescriptions with PDF download & AI explanations' },
];

const Index = () => (
  <div className="min-h-screen bg-background">
    <header className="border-b border-border">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Heart className="h-6 w-6 text-primary" />
          <span className="font-bold text-lg text-foreground">MediClinic AI</span>
        </div>
        <div className="flex gap-3">
          <Link to="/login"><Button variant="outline" size="sm">Login</Button></Link>
          <Link to="/signup"><Button size="sm">Get Started</Button></Link>
        </div>
      </div>
    </header>

    <section className="max-w-6xl mx-auto px-6 py-20 text-center">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <h1 className="text-4xl md:text-5xl font-extrabold text-foreground leading-tight">
          AI-Powered Clinic <br />
          <span className="text-primary">Management System</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
          Digitize your clinic operations with smart diagnosis, appointment scheduling, prescription management, and real-time analytics.
        </p>
        <div className="mt-8 flex gap-4 justify-center">
          <Link to="/signup"><Button size="lg">Start Free Trial</Button></Link>
          <Link to="/login"><Button variant="outline" size="lg">View Demo</Button></Link>
        </div>
      </motion.div>
    </section>

    <section className="max-w-6xl mx-auto px-6 pb-20">
      <div className="grid md:grid-cols-3 gap-6">
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-xl p-6"
          >
            <div className="h-11 w-11 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <f.icon className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">{f.title}</h3>
            <p className="text-sm text-muted-foreground mt-1">{f.desc}</p>
          </motion.div>
        ))}
      </div>
    </section>

    <footer className="border-t border-border py-6 text-center text-sm text-muted-foreground">
      © 2024 MediClinic AI. Built for the future of healthcare.
    </footer>
  </div>
);

export default Index;
