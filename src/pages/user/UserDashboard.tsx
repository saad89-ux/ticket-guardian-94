import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { Ticket, AlertCircle, Clock, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, BarChart, CartesianGrid, XAxis, YAxis, Bar } from 'recharts';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { StatusBadge, PriorityBadge } from '@/components/shared/Badges';
import { formatDistanceToNow } from 'date-fns';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#6b7280', '#ef4444'];
const BASE_URL = 'http://localhost:5001';

const UserDashboard = () => {
  const { user, token } = useAuth();
  const [stats, setStats] = useState({ total: 0, open: 0, inProgress: 0, resolved: 0 });
  const [statusData, setStatusData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [recentTickets, setRecentTickets] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch(`${BASE_URL}/api/dashboard/user`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setStats(data.myStats);
          setRecentTickets(data.recentTickets || []);
          setStatusData([
            { name: 'Open', count: data.myStats.open },
            { name: 'In Progress', count: data.myStats.inProgress },
            { name: 'Resolved', count: data.myStats.resolved },
          ].filter(d => d.count > 0));
          // Calculate categoryData from backend data directly
          const tickets = data.recentTickets || [];
          setCategoryData([
            { name: 'Technical', count: tickets.filter(t => t.category === 'Technical').length },
            { name: 'Billing', count: tickets.filter(t => t.category === 'Billing').length },
            { name: 'General', count: tickets.filter(t => t.category === 'General').length },
            { name: 'Sales', count: tickets.filter(t => t.category === 'Sales').length },
            { name: 'Product', count: tickets.filter(t => t.category === 'Product').length },
          ].filter(d => d.count > 0));
        }
      });
  }, [token]);

  const myTickets = recentTickets;

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
                <tr key={ticket.id || ticket.ticketNumber} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
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
