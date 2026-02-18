import { useState } from 'react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { StatusBadge, PriorityBadge, CategoryBadge } from '@/components/shared/Badges';
import { mockTickets } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { Plus, Search } from 'lucide-react';
import { TicketStatus } from '@/lib/types';

const MyTicketsPage = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const myTickets = mockTickets
    .filter(t => t.createdBy === user?.id)
    .filter(t => statusFilter === 'all' || t.status === statusFilter)
    .filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()) || t.ticketNumber.toLowerCase().includes(search.toLowerCase()));

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">My Tickets</h1>
          <p className="text-muted-foreground">{myTickets.length} tickets</p>
        </div>
        <Link to="/tickets/create"><Button><Plus size={16} className="mr-2" /> New Ticket</Button></Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Open">Open</SelectItem>
            <SelectItem value="In Progress">In Progress</SelectItem>
            <SelectItem value="Resolved">Resolved</SelectItem>
            <SelectItem value="Closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3">
        {myTickets.map((ticket, i) => (
          <motion.div key={ticket.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={`/tickets/${ticket.id}`} className="block glass-card rounded-xl p-4 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-primary">{ticket.ticketNumber}</span>
                    <CategoryBadge category={ticket.category} />
                  </div>
                  <h3 className="font-medium text-foreground truncate">{ticket.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{ticket.description}</p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <StatusBadge status={ticket.status} />
                  <PriorityBadge priority={ticket.priority} />
                  <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })}</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
        {myTickets.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No tickets found.</p>
            <Link to="/tickets/create"><Button variant="outline" className="mt-4">Create your first ticket</Button></Link>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MyTicketsPage;
