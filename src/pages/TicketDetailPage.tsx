import { useParams } from 'react-router-dom';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { StatusBadge, PriorityBadge, CategoryBadge } from '@/components/shared/Badges';
import { mockTickets } from '@/lib/mock-data';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { Calendar, User, Tag, MessageSquare, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';

const TicketDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const ticket = mockTickets.find(t => t.id === id);
  const [note, setNote] = useState('');

  if (!ticket) {
    return <DashboardLayout><div className="text-center py-12 text-muted-foreground">Ticket not found.</div></DashboardLayout>;
  }

  const isAgent = user?.role === 'agent';
  const isAdmin = user?.role === 'superadmin';
  const canAddNote = isAgent || isAdmin;
  const canResolve = isAgent && ticket.status !== 'Resolved' && ticket.status !== 'Closed';
  const canAssign = isAgent && !ticket.assignedTo;

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="font-mono text-sm text-primary font-bold">{ticket.ticketNumber}</span>
              <StatusBadge status={ticket.status} />
              <PriorityBadge priority={ticket.priority} />
            </div>
            <h1 className="text-2xl font-bold text-foreground">{ticket.title}</h1>
          </div>
          <div className="flex gap-2 shrink-0">
            {canAssign && <Button onClick={() => toast.success('Ticket assigned to you!')}>Assign to Me</Button>}
            {canResolve && <Button variant="outline" onClick={() => toast.success('Ticket resolved!')}>Mark Resolved</Button>}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            <div className="glass-card rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-3">Description</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{ticket.description}</p>
            </div>

            {/* Notes timeline */}
            <div className="glass-card rounded-xl p-5">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <MessageSquare size={18} /> Activity & Notes
              </h3>
              {ticket.notes.length > 0 ? (
                <div className="space-y-4">
                  {ticket.notes.map(n => (
                    <div key={n.id} className="border-l-2 border-primary/30 pl-4 py-2">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-foreground">{n.authorName}</span>
                        <span className="text-xs text-muted-foreground">{format(new Date(n.createdAt), 'MMM d, yyyy h:mm a')}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{n.content}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">No activity notes yet.</p>
              )}

              {canAddNote && (
                <div className="mt-4 pt-4 border-t border-border">
                  <Textarea placeholder="Add an investigation note..." value={note} onChange={e => setNote(e.target.value)} rows={3} />
                  <Button size="sm" className="mt-2" onClick={() => { toast.success('Note added!'); setNote(''); }}>Add Note</Button>
                </div>
              )}
            </div>

            {ticket.resolutionSummary && (
              <div className="glass-card rounded-xl p-5 border-l-4 border-status-resolved">
                <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
                  <CheckCircle size={18} className="text-status-resolved" /> Resolution Summary
                </h3>
                <p className="text-sm text-muted-foreground">{ticket.resolutionSummary}</p>
              </div>
            )}
          </div>

          {/* Sidebar details */}
          <div className="space-y-4">
            <div className="glass-card rounded-xl p-5 space-y-4">
              <h3 className="font-semibold text-foreground">Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2">
                  <Tag size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">Category:</span>
                  <CategoryBadge category={ticket.category} />
                </div>
                <div className="flex items-center gap-2">
                  <User size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">Created by:</span>
                  <span className="text-foreground font-medium">{ticket.createdByName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <User size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">Assigned to:</span>
                  <span className="text-foreground font-medium">{ticket.assignedToName || 'Unassigned'}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">Created:</span>
                  <span className="text-foreground">{format(new Date(ticket.createdAt), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-muted-foreground" />
                  <span className="text-muted-foreground">Updated:</span>
                  <span className="text-foreground">{format(new Date(ticket.updatedAt), 'MMM d, yyyy')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default TicketDetailPage;
