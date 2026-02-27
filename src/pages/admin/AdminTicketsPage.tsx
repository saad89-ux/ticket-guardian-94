import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { StatusBadge, PriorityBadge, CategoryBadge } from '@/components/shared/Badges';
import { mockTickets } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Search } from 'lucide-react';

const BASE_URL = 'http://localhost:5001';
const AdminTicketsPage = () => {
  const { token } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch(`${BASE_URL}/api/tickets/admin/all`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.ok ? res.json() : [])
      .then(data => setTickets(data || []));
  }, [token]);

  const filteredTickets = tickets
    .filter(t => statusFilter === 'all' || t.status === statusFilter)
    .filter(t => priorityFilter === 'all' || t.priority === priorityFilter)
    .filter(t => categoryFilter === 'all' || t.category === categoryFilter)
    .filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.ticketNumber.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">All Tickets</h1>
        <p className="text-muted-foreground">{filteredTickets.length} tickets system-wide</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
            <SelectItem value="Reopened">Reopened</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="Low">Low</SelectItem>
            <SelectItem value="Medium">Medium</SelectItem>
            <SelectItem value="High">High</SelectItem>
            <SelectItem value="Critical">Critical</SelectItem>
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-36"><SelectValue placeholder="Category" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Technical">Technical</SelectItem>
            <SelectItem value="Billing">Billing</SelectItem>
            <SelectItem value="General">General</SelectItem>
            <SelectItem value="Sales">Sales</SelectItem>
            <SelectItem value="Product">Product</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="glass-card rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-secondary/30">
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Ticket</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Title</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">User</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Category</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Status</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Priority</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Agent</th>
                <th className="text-left py-3 px-4 font-medium text-muted-foreground">Created</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(ticket => (
                <tr key={ticket._id || ticket.id} className="border-b border-border/50 hover:bg-secondary/20 transition-colors">
                  <td className="py-3 px-4">
                    <Link to={`/superadmin/tickets/${ticket._id || ticket.id}`} className="font-mono text-xs text-primary hover:underline">{ticket.ticketNumber}</Link>
                  </td>
                  <td className="py-3 px-4 text-foreground font-medium max-w-[200px] truncate">{ticket.title}</td>
                  <td className="py-3 px-4 text-muted-foreground">{ticket.createdBy?.name || ticket.createdByName}</td>
                  <td className="py-3 px-4"><CategoryBadge category={ticket.category} /></td>
                  <td className="py-3 px-4"><StatusBadge status={ticket.status} /></td>
                  <td className="py-3 px-4"><PriorityBadge priority={ticket.priority} /></td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">{ticket.assignedTo?.name || ticket.assignedToName || 'Unassigned'}</td>
                  <td className="py-3 px-4 text-muted-foreground text-xs">{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminTicketsPage;
