import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { mockTickets, mockAgentPerformance } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line, AreaChart, Area } from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f97316', '#ef4444'];

const AdminAnalyticsPage = () => {
  const statusData = ['Open', 'In Progress', 'Resolved', 'Closed', 'Reopened'].map(s => ({
    name: s,
    count: mockTickets.filter(t => t.status === s).length,
  })).filter(d => d.count > 0);

  const categoryData = ['Technical', 'Billing', 'General', 'Sales', 'Product'].map(c => ({
    name: c,
    count: mockTickets.filter(t => t.category === c).length,
  }));

  const weeklyData = [
    { week: 'Week 1', created: 12, resolved: 8 },
    { week: 'Week 2', created: 18, resolved: 15 },
    { week: 'Week 3', created: 10, resolved: 12 },
    { week: 'Week 4', created: 22, resolved: 20 },
  ];

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground">System-wide performance insights</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Status Distribution</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={statusData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip /><Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Tickets by Category</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip /><Bar dataKey="count" fill="hsl(217, 91%, 60%)" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5 mb-6">
        <h3 className="font-semibold text-foreground mb-4">Weekly Trend: Created vs Resolved</h3>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={weeklyData}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="week" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip />
            <Legend />
            <Area type="monotone" dataKey="created" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
            <Area type="monotone" dataKey="resolved" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
        <h3 className="font-semibold text-foreground mb-4">Agent Performance Comparison</h3>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={mockAgentPerformance}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="agentName" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip /><Legend />
            <Bar dataKey="totalResolved" name="Resolved" fill="#10b981" radius={[6, 6, 0, 0]} />
            <Bar dataKey="totalAssigned" name="Assigned" fill="#3b82f6" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </DashboardLayout>
  );
};

export default AdminAnalyticsPage;
