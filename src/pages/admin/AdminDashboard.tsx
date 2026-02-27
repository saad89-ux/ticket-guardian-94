import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge, PriorityBadge } from '@/components/shared/Badges';
import { Ticket, AlertCircle, Clock, CheckCircle, AlertTriangle, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#6b7280', '#ef4444'];
const PRIORITY_COLORS = ['#10b981', '#f59e0b', '#f97316', '#ef4444'];

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
const BASE_URL = 'http://localhost:5001';
const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState<any>({});
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [priorityData, setPriorityData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const [agents, setAgents] = useState<number>(0);
  const [activeAgents, setActiveAgents] = useState<number>(0);
  const [users, setUsers] = useState<number>(0);
  const [allTickets, setAllTickets] = useState<any[]>([]);
  const [topAgents, setTopAgents] = useState<any[]>([]);
  const [activeAgentsList, setActiveAgentsList] = useState<any[]>([]);
  const [reassignLoading, setReassignLoading] = useState<string | null>(null);
  // Use toast directly from import
  // Fetch all active agents for dropdown
  useEffect(() => {
    if (!token) return;
    fetch(`${BASE_URL}/api/users/agents`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          setActiveAgentsList(data.filter((a: any) => a.isActive !== false));
        }
      });
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetch(`${BASE_URL}/api/dashboard/superadmin`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (data) {
          setStats(data.overview);
          setCategoryData(data.ticketsByCategory.map((c: any) => ({ name: c._id, count: c.count })));
          setPriorityData(data.ticketsByPriority.map((p: any) => ({ name: p._id, count: p.count })));
          setStatusData([
            { name: 'Open', count: data.overview.openTickets },
            { name: 'In Progress', count: data.overview.inProgressTickets },
            { name: 'Resolved', count: data.overview.resolvedTickets },
            { name: 'Overdue', count: data.overview.overdueTickets },
          ]);
          setAgents(data.users.totalAgents);
          setActiveAgents(data.users.activeAgents);
          setUsers(data.users.totalUsers);
          setTopAgents(data.topAgents || []);
          setAllTickets(data.recentTickets || []);
        }
      });
  }, [token]);

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">System Dashboard</h1>
        <p className="text-muted-foreground">Enterprise governance overview</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title="Total Tickets" value={stats.totalTickets} icon={<Ticket size={24} />} />
        <StatCard title="Open" value={stats.openTickets} icon={<AlertCircle size={24} />} />
        <StatCard title="In Progress" value={stats.inProgressTickets} icon={<Clock size={24} />} />
        <StatCard title="Resolved" value={stats.resolvedTickets} icon={<CheckCircle size={24} />} />
        <StatCard title="Overdue" value={stats.overdueTickets} icon={<AlertTriangle size={24} />} />
      </div>

      {/* System Health */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5 mb-6">
        <h3 className="font-semibold text-foreground mb-3">System Health</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div className="p-3 rounded-lg bg-secondary">
            <p className="text-muted-foreground">Total Agents</p>
            <p className="text-xl font-bold text-foreground">{agents}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary">
            <p className="text-muted-foreground">Active Agents</p>
            <p className="text-xl font-bold text-foreground">{activeAgents}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary">
            <p className="text-muted-foreground">Total Users</p>
            <p className="text-xl font-bold text-foreground">{users}</p>
          </div>
          <div className="p-3 rounded-lg bg-secondary">
            <p className="text-muted-foreground">Avg Resolution</p>
            <p className="text-xl font-bold text-foreground">{stats.avgResolutionTime}</p>
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
              {topAgents.map(agent => (
                <tr key={agent._id || agent.id || agent.agentId} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-2 font-medium text-foreground">{agent.name || agent.agentName}</td>
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
                <tr key={ticket._id || ticket.id} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 px-2 font-mono text-xs text-primary">
                    <Link to={`/superadmin/tickets/${ticket._id || ticket.id}`} className="hover:underline">{ticket.ticketNumber}</Link>
                  </td>
                  <td className="py-3 px-2 text-foreground">{ticket.createdByName || (ticket.createdBy && ticket.createdBy.name)}</td>
                  <td className="py-3 px-2 text-muted-foreground">{ticket.category}</td>
                  <td className="py-3 px-2 text-muted-foreground">{ticket.assignedToName || (ticket.assignedTo && ticket.assignedTo.name) || 'Unassigned'}</td>
                  <td className="py-3 px-2 flex gap-2 items-center">
                    <StatusBadge status={ticket.status} />
                    {/* Reassign dropdown for superadmin */}
                    <div>
                      <select
                        className="border rounded px-2 py-1 text-xs"
                        defaultValue=""
                        disabled={reassignLoading === (ticket._id || ticket.id)}
                        onChange={async (e) => {
                          const agentId = e.target.value;
                          if (!agentId) return;
                          setReassignLoading(ticket._id || ticket.id);
                          try {
                            const res = await fetch(`${BASE_URL}/api/tickets/${ticket._id || ticket.id}/reassign`, {
                              method: 'PUT',
                              headers: {
                                'Content-Type': 'application/json',
                                Authorization: `Bearer ${token}`
                              },
                              body: JSON.stringify({ agentId })
                            });
                            const data = await res.json();
                            if (res.ok) {
                              toast.success('Ticket reassigned!');
                              // Optionally refresh tickets list
                              setAllTickets(prev => prev.map(t => t._id === ticket._id ? { ...t, assignedToName: data.ticket.assignedTo?.name } : t));
                            } else {
                              toast.error(data.message || 'Failed to reassign');
                            }
                          } catch {
                            toast.error('Network error');
                          }
                          setReassignLoading(null);
                        }}
                      >
                        <option value="">Reassign...</option>
                        {activeAgentsList.map(agent => (
                          <option key={agent._id || agent.id} value={agent._id || agent.id}>{agent.name} ({agent.department})</option>
                        ))}
                      </select>
                    </div>
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

export default AdminDashboard;
