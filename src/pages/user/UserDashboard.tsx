import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge, PriorityBadge, CategoryBadge } from '@/components/shared/Badges';
import { mockTickets } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { Ticket, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#6b7280', '#ef4444'];

const UserDashboard = () => {
  const { user } = useAuth();
  const myTickets = mockTickets.filter(t => t.createdBy === user?.id);
  const stats = {
    total: myTickets.length,
    open: myTickets.filter(t => t.status === 'Open').length,
    inProgress: myTickets.filter(t => t.status === 'In Progress').length,
    resolved: myTickets.filter(t => t.status === 'Resolved').length,
  };

  const statusData = [
    { name: 'Open', count: stats.open },
    { name: 'In Progress', count: stats.inProgress },
    { name: 'Resolved', count: stats.resolved },
    { name: 'Closed', count: myTickets.filter(t => t.status === 'Closed').length },
    { name: 'Reopened', count: myTickets.filter(t => t.status === 'Reopened').length },
  ].filter(d => d.count > 0);

  const categoryData = ['Technical', 'Billing', 'General', 'Sales', 'Product'].map(cat => ({
    name: cat,
    count: myTickets.filter(t => t.category === cat).length,
  })).filter(d => d.count > 0);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">My Support Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Total Tickets" value={stats.total} icon={<Ticket size={24} />} />
        <StatCard title="Open" value={stats.open} icon={<AlertCircle size={24} />} />
        <StatCard title="In Progress" value={stats.inProgress} icon={<Clock size={24} />} />
        <StatCard title="Resolved" value={stats.resolved} icon={<CheckCircle size={24} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Category Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Bar dataKey="count" fill="hsl(217, 91%, 60%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Recent Tickets</h3>
          <Link to="/tickets">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Ticket</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Title</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Priority</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Created</th>
              </tr>
            </thead>
            <tbody>
              {myTickets.slice(0, 5).map(ticket => (
                <tr key={ticket.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-2 font-mono text-xs text-primary">{ticket.ticketNumber}</td>
                  <td className="py-3 px-2">
                    <Link to={`/tickets/${ticket.id}`} className="text-foreground hover:text-primary font-medium">{ticket.title}</Link>
                  </td>
                  <td className="py-3 px-2"><StatusBadge status={ticket.status} /></td>
                  <td className="py-3 px-2"><PriorityBadge priority={ticket.priority} /></td>
                  <td className="py-3 px-2 text-muted-foreground text-xs">{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default UserDashboard;
