import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge, PriorityBadge } from '@/components/shared/Badges';
import { mockTickets, mockAgentPerformance } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { Ticket, Clock, CheckCircle, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const AgentDashboard = () => {
  const { user } = useAuth();
  const agentTickets = mockTickets.filter(t => t.assignedTo === user?.id);
  const unassigned = mockTickets.filter(t => !t.assignedTo && t.status === 'Open');
  const perf = mockAgentPerformance.find(p => p.agentId === user?.id) || mockAgentPerformance[0];

  const stats = {
    assigned: agentTickets.length,
    active: agentTickets.filter(t => t.status === 'Open' || t.status === 'In Progress').length,
    resolved: agentTickets.filter(t => t.status === 'Resolved').length,
    avgTime: `${perf.avgResolutionTime}h`,
  };

  const trendData = [
    { day: 'Mon', resolved: 3 }, { day: 'Tue', resolved: 5 }, { day: 'Wed', resolved: 2 },
    { day: 'Thu', resolved: 7 }, { day: 'Fri', resolved: 4 }, { day: 'Sat', resolved: 1 }, { day: 'Sun', resolved: 2 },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Agent Dashboard</h1>
        <p className="text-muted-foreground">{user?.name} • {user?.department || 'Technical'} Department</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="Assigned" value={stats.assigned} icon={<Ticket size={24} />} />
        <StatCard title="Active" value={stats.active} icon={<Clock size={24} />} />
        <StatCard title="Resolved" value={stats.resolved} icon={<CheckCircle size={24} />} />
        <StatCard title="Avg Resolution" value={stats.avgTime} icon={<BarChart3 size={24} />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-2">Performance Metrics</h3>
          <div className="space-y-3 mt-4">
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Total Assigned</span>
              <span className="font-semibold text-foreground">{perf.totalAssigned}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Total Resolved</span>
              <span className="font-semibold text-foreground">{perf.totalResolved}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-border/50">
              <span className="text-sm text-muted-foreground">Avg Resolution Time</span>
              <span className="font-semibold text-foreground">{perf.avgResolutionTime}h</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-sm text-muted-foreground">Rating</span>
              <span className="font-semibold text-foreground">⭐ {perf.rating}/5</span>
            </div>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Resolution Trend (This Week)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="day" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="resolved" stroke="hsl(217, 91%, 60%)" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Ticket Queue</h3>
          <Link to="/agent/tickets"><Button variant="outline" size="sm">View All</Button></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Ticket</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">User</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Priority</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Created</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {[...unassigned.slice(0, 3), ...agentTickets.slice(0, 3)].map(ticket => (
                <tr key={ticket.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-2 font-mono text-xs text-primary">{ticket.ticketNumber}</td>
                  <td className="py-3 px-2 text-foreground">{ticket.createdByName}</td>
                  <td className="py-3 px-2"><StatusBadge status={ticket.status} /></td>
                  <td className="py-3 px-2"><PriorityBadge priority={ticket.priority} /></td>
                  <td className="py-3 px-2 text-muted-foreground text-xs">{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</td>
                  <td className="py-3 px-2">
                    <Link to={`/agent/tickets/${ticket.id}`}>
                      <Button variant="outline" size="sm">{ticket.assignedTo ? 'View' : 'Assign'}</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default AgentDashboard;
