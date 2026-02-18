import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge, PriorityBadge } from '@/components/shared/Badges';
import { mockTickets, mockAgentPerformance, mockUsers } from '@/lib/mock-data';
import { Ticket, AlertCircle, Clock, CheckCircle, AlertTriangle, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#6b7280', '#ef4444'];
const PRIORITY_COLORS = ['#10b981', '#f59e0b', '#f97316', '#ef4444'];

const AdminDashboard = () => {
  const allTickets = mockTickets;
  const agents = mockUsers.filter(u => u.role === 'agent');
  const users = mockUsers.filter(u => u.role === 'user');

  const stats = {
    total: allTickets.length,
    open: allTickets.filter(t => t.status === 'Open').length,
    inProgress: allTickets.filter(t => t.status === 'In Progress').length,
    resolved: allTickets.filter(t => t.status === 'Resolved').length,
    overdue: 5,
  };

  const statusData = [
    { name: 'Open', count: stats.open },
    { name: 'In Progress', count: stats.inProgress },
    { name: 'Resolved', count: stats.resolved },
    { name: 'Closed', count: allTickets.filter(t => t.status === 'Closed').length },
    { name: 'Reopened', count: allTickets.filter(t => t.status === 'Reopened').length },
  ].filter(d => d.count > 0);

  const categoryData = ['Technical', 'Billing', 'General', 'Sales', 'Product'].map(cat => ({
    name: cat,
    count: allTickets.filter(t => t.category === cat).length,
  }));

  const priorityData = ['Low', 'Medium', 'High', 'Critical'].map(p => ({
    name: p,
    count: allTickets.filter(t => t.priority === p).length,
  }));

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">System Dashboard</h1>
        <p className="text-muted-foreground">Enterprise governance overview</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title="Total Tickets" value={stats.total} icon={<Ticket size={24} />} />
        <StatCard title="Open" value={stats.open} icon={<AlertCircle size={24} />} />
        <StatCard title="In Progress" value={stats.inProgress} icon={<Clock size={24} />} />
        <StatCard title="Resolved" value={stats.resolved} icon={<CheckCircle size={24} />} />
        <StatCard title="Overdue" value={stats.overdue} icon={<AlertTriangle size={24} />} />
      </div>

      {/* System Health */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5 mb-6">
        <h3 className="font-semibold text-foreground mb-3">System Health</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div className="p-3 rounded-lg bg-secondary">
            <p className="text-muted-foreground">Total Agents</p>
            <p className="text-xl font-bold text-foreground">{agents.length}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary">
            <p className="text-muted-foreground">Active Agents</p>
            <p className="text-xl font-bold text-foreground">{agents.filter(a => a.isActive !== false).length}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary">
            <p className="text-muted-foreground">Total Users</p>
            <p className="text-xl font-bold text-foreground">{users.length}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary">
            <p className="text-muted-foreground">Avg Resolution</p>
            <p className="text-xl font-bold text-foreground">22.3h</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Priority Breakdown</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={priorityData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                {priorityData.map((_, i) => <Cell key={i} fill={PRIORITY_COLORS[i]} />)}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Top Agents */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Top Performing Agents</h3>
          <Link to="/superadmin/agents"><Button variant="outline" size="sm">Manage Agents</Button></Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Agent</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Dept.</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Resolved</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Avg Time</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Rating</th>
              </tr>
            </thead>
            <tbody>
              {mockAgentPerformance.map(agent => (
                <tr key={agent.agentId} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-2 font-medium text-foreground">{agent.agentName}</td>
                  <td className="py-3 px-2 text-muted-foreground">{agent.department}</td>
                  <td className="py-3 px-2 text-foreground">{agent.totalResolved}</td>
                  <td className="py-3 px-2 text-muted-foreground">{agent.avgResolutionTime}h</td>
                  <td className="py-3 px-2 text-foreground">⭐ {agent.rating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Recent Activity */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Recent System Activity</h3>
          <div className="flex gap-2">
            <Link to="/superadmin/tickets"><Button variant="outline" size="sm">All Tickets</Button></Link>
            <Link to="/superadmin/audit-logs"><Button variant="outline" size="sm">Audit Logs</Button></Link>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border">
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Ticket</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">User</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Category</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Agent</th>
                <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {allTickets.slice(0, 8).map(ticket => (
                <tr key={ticket.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-2 font-mono text-xs text-primary">
                    <Link to={`/superadmin/tickets/${ticket.id}`} className="hover:underline">{ticket.ticketNumber}</Link>
                  </td>
                  <td className="py-3 px-2 text-foreground">{ticket.createdByName}</td>
                  <td className="py-3 px-2 text-muted-foreground">{ticket.category}</td>
                  <td className="py-3 px-2 text-muted-foreground">{ticket.assignedToName || 'Unassigned'}</td>
                  <td className="py-3 px-2"><StatusBadge status={ticket.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
