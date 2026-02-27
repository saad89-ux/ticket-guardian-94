import { useParams, useNavigate } from 'react-router-dom';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { StatusBadge, PriorityBadge, CategoryBadge } from '@/components/shared/Badges';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow, isPast } from 'date-fns';
import { Calendar, User, Tag, Clock, AlertTriangle, CheckCircle, MessageSquare } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';

const BASE_URL = 'http://localhost:5001';

// ── Types ─────────────────────────────────────────────────────────────────────
type TicketCategory = 'Technical' | 'Billing' | 'General' | 'Sales' | 'Product';
type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';

interface InvestigationNote {
  _id: string;
  note: string;                                        // ✅ backend field is `note`, not `content`
  addedBy: { _id: string; name: string } | null;
  addedAt: string;
}

interface Ticket {
  _id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: string;
  createdBy: { _id: string; name: string; email: string };
  assignedTo: { _id: string; name: string; email: string; department: string } | null;
  investigationNotes: InvestigationNote[];             // ✅ backend field is `investigationNotes`
  resolution?: { summary: string; resolvedBy: { name: string }; resolvedAt: string };
  sla?: { dueDate?: string; isBreached?: boolean; breachedAt?: string };
  statusHistory?: { status: string; changedBy: { name: string }; changedAt: string; reason?: string }[];
  createdAt: string;
  updatedAt: string;
}

// ── SLA badge helper ──────────────────────────────────────────────────────────
const getSLABadge = (ticket: Ticket) => {
  if (!ticket.sla?.dueDate) return null;
  const TERMINAL = ['Resolved', 'Closed'];
  if (TERMINAL.includes(ticket.status))
    return { label: 'SLA Met', classes: 'bg-green-100 text-green-700 border-green-200', icon: false };
  const due = new Date(ticket.sla.dueDate);
  if (ticket.sla.isBreached)
    return {
      label: `SLA Breached${ticket.sla.breachedAt ? ` · ${formatDistanceToNow(new Date(ticket.sla.breachedAt), { addSuffix: true })}` : ''}`,
      classes: 'bg-red-100 text-red-700 border-red-300', icon: true,
    };
  if (isPast(due))
    return { label: `SLA Overdue · ${formatDistanceToNow(due)} ago`, classes: 'bg-red-100 text-red-600 border-red-200', icon: true };
  const msLeft = due.getTime() - Date.now();
  if (msLeft < 2 * 60 * 60 * 1000)
    return { label: `SLA Critical · due ${formatDistanceToNow(due, { addSuffix: true })}`, classes: 'bg-orange-100 text-orange-600 border-orange-200', icon: true };
  if (msLeft < 24 * 60 * 60 * 1000)
    return { label: `SLA At Risk · due ${formatDistanceToNow(due, { addSuffix: true })}`, classes: 'bg-yellow-100 text-yellow-700 border-yellow-200', icon: false };
  return { label: `SLA due ${formatDistanceToNow(due, { addSuffix: true })}`, classes: 'bg-slate-100 text-slate-500 border-slate-200', icon: false };
};

// ── Reusable modal shell ──────────────────────────────────────────────────────
const Modal = ({
  title, onClose, children,
}: { title: string; onClose: () => void; children: React.ReactNode }) => (
  <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white rounded-2xl shadow-2xl w-full max-w-lg"
    >
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <h2 className="text-lg font-semibold">{title}</h2>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground text-2xl leading-none transition-colors"
          aria-label="Close"
        >
          ×
        </button>
      </div>
      <div className="px-6 py-5 space-y-4">{children}</div>
    </motion.div>
  </div>
);

// ── Main page ─────────────────────────────────────────────────────────────────
const TicketDetailPage = () => {
  const { id }          = useParams<{ id: string }>();
  const { user, token } = useAuth();
  const navigate        = useNavigate();

  const [ticket, setTicket]     = useState<Ticket | null>(null);
  const [fetching, setFetching] = useState(true);   // initial page load spinner
  const [loading, setLoading]   = useState(false);  // action button spinner

  // Note state
  const [note, setNote] = useState('');

  // Update modal state — pre-filled from ticket
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateTitle, setUpdateTitle]         = useState('');
  const [updateDesc, setUpdateDesc]           = useState('');
  const [updateCategory, setUpdateCategory]   = useState<TicketCategory>('Technical');
  const [updatePriority, setUpdatePriority]   = useState<TicketPriority>('Medium');

  // Resolve modal state
  const [showResolveModal, setShowResolveModal] = useState(false);
  const [resolveSummary, setResolveSummary]     = useState('');

  // ── Fetch ticket on mount ─────────────────────────────────────────────────
  useEffect(() => {
    if (!token || !id) return;
    setFetching(true);
    fetch(`${BASE_URL}/api/tickets/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(res => res.json())
      .then(data => {
        if (data._id) {
          setTicket(data);
        } else {
          toast.error(data.message || 'Ticket not found');
        }
      })
      .catch(() => toast.error('Network error'))
      .finally(() => setFetching(false));
  }, [token, id]);

  // ── Pre-fill update form whenever ticket object changes ───────────────────
  // This runs on initial load AND after any successful update so the form
  // always shows the current values when the modal is opened.
  useEffect(() => {
    if (!ticket) return;
    setUpdateTitle(ticket.title);
    setUpdateDesc(ticket.description);
    setUpdateCategory(ticket.category);
    setUpdatePriority(ticket.priority);
  }, [ticket]);

  // ── Loading skeleton ──────────────────────────────────────────────────────
  if (fetching) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (!ticket) {
    return (
      <DashboardLayout>
        <div className="text-center py-16 text-muted-foreground">Ticket not found.</div>
      </DashboardLayout>
    );
  }

  // ── Role / permission flags ───────────────────────────────────────────────
  const isAdmin = user?.role === 'superadmin';
  const isAgent = user?.role === 'agent';
  const isOwner = ticket.createdBy?._id?.toString() === (user as any)?._id?.toString();

  const canAssign  = isAgent && !ticket.assignedTo;
  const canAddNote = isAgent && ticket.assignedTo?._id?.toString() === (user as any)?._id?.toString();
  const canResolve = canAddNote && ticket.status === 'In Progress';
  // Only the ticket owner (or admin) can edit, and only while still Open
  const canUpdate  = (isOwner || isAdmin) && ticket.status === 'Open';

  const sla = getSLABadge(ticket);

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleSoftDelete = async () => {
    if (!window.confirm('Delete this ticket? This cannot be undone.')) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/tickets/${ticket._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        toast.success('Ticket deleted');
        navigate('/superadmin/tickets');
      } else {
        const data = await res.json();
        toast.error(data.message || 'Delete failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/tickets/${id}/assign`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setTicket(data.ticket);
        toast.success('Ticket assigned to you');
      } else {
        toast.error(data.message || 'Assignment failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (note.trim().length < 10) { toast.error('Note must be at least 10 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/tickets/${id}/note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ note }),
      });
      const data = await res.json();
      if (res.ok) {
        setTicket(data.ticket);  // ✅ full ticket returned from backend — notes list updates instantly
        setNote('');
        toast.success('Note added');
      } else {
        toast.error(data.message || 'Failed to add note');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateTicket = async () => {
    if (updateTitle.trim().length < 5)  { toast.error('Title must be at least 5 characters'); return; }
    if (updateDesc.trim().length < 20)  { toast.error('Description must be at least 20 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/tickets/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          title:       updateTitle.trim(),
          description: updateDesc.trim(),
          category:    updateCategory,
          priority:    updatePriority,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setTicket(data.ticket);   // ✅ backend returns updated ticket — header, badges, description all re-render
        setShowUpdateModal(false);
        toast.success('Ticket updated');
      } else {
        toast.error(data.message || 'Update failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async () => {
    if (resolveSummary.trim().length < 20) { toast.error('Summary must be at least 20 characters'); return; }
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/tickets/${id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ summary: resolveSummary.trim() }),
      });
      const data = await res.json();
      if (res.ok) {
        setTicket(data.ticket);
        setShowResolveModal(false);
        setResolveSummary('');
        toast.success('Ticket resolved');
      } else {
        toast.error(data.message || 'Resolve failed');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setLoading(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto space-y-6 pb-16"
      >

        {/* ── Header row ── */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <span className="font-mono text-sm text-muted-foreground tracking-wide">
              {ticket.ticketNumber}
            </span>
            <h1 className="text-2xl font-bold text-foreground mt-0.5 leading-tight">
              {ticket.title}
            </h1>
          </div>

          <div className="flex flex-wrap gap-2 shrink-0">
            {canUpdate && (
              <Button variant="outline" onClick={() => setShowUpdateModal(true)} disabled={loading}>
                Edit Ticket
              </Button>
            )}
            {canAssign && (
              <Button onClick={handleAssign} disabled={loading}>
                {loading ? 'Assigning…' : 'Assign To Me'}
              </Button>
            )}
            {canResolve && (
              <Button onClick={() => setShowResolveModal(true)} disabled={loading}>
                <CheckCircle size={14} className="mr-1.5" />
                Resolve
              </Button>
            )}
            {isAdmin && (
              <Button variant="destructive" onClick={handleSoftDelete} disabled={loading}>
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* ── Status / priority / category + SLA ── */}
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge   status={ticket.status} />
          <PriorityBadge priority={ticket.priority} />
          <CategoryBadge category={ticket.category} />
          {sla && (
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full border ${sla.classes}`}>
              {sla.icon && <AlertTriangle size={10} />}
              {sla.label}
            </span>
          )}
        </div>

        {/* ── Meta card ── */}
        <div className="glass-card rounded-xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <User size={13} />
            <span>Reporter: <span className="font-medium text-foreground">{ticket.createdBy?.name}</span></span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Tag size={13} />
            <span>Assigned to: <span className="font-medium text-foreground">{ticket.assignedTo?.name ?? <em>Unassigned</em>}</span></span>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar size={13} />
            <span>Created: <span className="font-medium text-foreground">{format(new Date(ticket.createdAt), 'MMM d, yyyy · h:mm a')}</span></span>
          </div>
          {ticket.sla?.dueDate && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock size={13} />
              <span>SLA due: <span className="font-medium text-foreground">{format(new Date(ticket.sla.dueDate), 'MMM d, yyyy · h:mm a')}</span></span>
            </div>
          )}
        </div>

        {/* ── Description ── */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-3">Description</h3>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
            {ticket.description}
          </p>
        </div>

        {/* ── Resolution block (shown after ticket is resolved) ── */}
        {ticket.resolution?.summary && (
          <div className="glass-card rounded-xl p-5 bg-green-50/40 border border-green-200">
            <h3 className="font-semibold text-green-700 mb-2 flex items-center gap-2">
              <CheckCircle size={15} />
              Resolution
            </h3>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">
              {ticket.resolution.summary}
            </p>
            <p className="text-xs text-muted-foreground mt-3">
              Resolved by <strong>{ticket.resolution.resolvedBy?.name}</strong>
              {ticket.resolution.resolvedAt &&
                ` · ${format(new Date(ticket.resolution.resolvedAt), 'MMM d, yyyy · h:mm a')}`}
            </p>
          </div>
        )}

        {/* ── Investigation notes ── */}
        <div className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <MessageSquare size={15} />
            Investigation Notes
            {!!ticket.investigationNotes?.length && (
              <span className="text-xs font-normal text-muted-foreground ml-1">
                ({ticket.investigationNotes.length})
              </span>
            )}
          </h3>

          {/* ✅ correct fields: investigationNotes[].note  and  .addedBy.name  and  .addedAt */}
          {!ticket.investigationNotes?.length ? (
            <p className="text-sm text-muted-foreground italic">No investigation notes yet.</p>
          ) : (
            <div className="space-y-3">
              {ticket.investigationNotes.map(n => (
                <div key={n._id} className="rounded-lg border border-border bg-secondary/20 p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">
                      {n.addedBy?.name ?? 'Agent'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {n.addedAt ? format(new Date(n.addedAt), 'MMM d, yyyy · h:mm a') : ''}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">{n.note}</p>
                </div>
              ))}
            </div>
          )}

          {/* Add-note form — only the assigned agent sees this */}
          {canAddNote && (
            <div className="mt-5 pt-4 border-t border-border space-y-3">
              <Label htmlFor="note-input">Add Note</Label>
              <Textarea
                id="note-input"
                rows={3}
                placeholder="Describe steps taken, findings, etc. (min 10 chars)"
                value={note}
                onChange={e => setNote(e.target.value)}
              />
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{note.length} chars</span>
                <Button
                  size="sm"
                  onClick={handleAddNote}
                  disabled={loading || note.trim().length < 10}
                >
                  {loading ? 'Saving…' : 'Add Note'}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* ── Status history timeline ── */}
        {!!ticket.statusHistory?.length && (
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-semibold text-foreground mb-4">Status History</h3>
            <ol className="relative border-l border-border ml-2 space-y-4">
              {[...ticket.statusHistory].reverse().map((s, i) => (
                <li key={i} className="ml-5">
                  <span className="absolute -left-1.5 flex h-3 w-3 items-center justify-center rounded-full border-2 border-white bg-primary" />
                  <p className="text-sm font-medium text-foreground">{s.status}</p>
                  {s.reason    && <p className="text-xs text-muted-foreground">{s.reason}</p>}
                  {s.changedAt && <p className="text-xs text-muted-foreground">{format(new Date(s.changedAt), 'MMM d, yyyy · h:mm a')}</p>}
                </li>
              ))}
            </ol>
          </div>
        )}
      </motion.div>

      {/* ════════════════════════════════════════════════════════
          UPDATE MODAL
          Styled to match CreateTicketPage — uses shadcn Select,
          Input, Textarea, and Label. Pre-filled from ticket state.
          On success: setTicket(data.ticket) updates the whole page.
          ════════════════════════════════════════════════════════ */}
      {showUpdateModal && (
        <Modal title="Edit Ticket" onClose={() => !loading && setShowUpdateModal(false)}>
          {/* Title */}
          <div>
            <Label htmlFor="u-title">Title *</Label>
            <Input
              id="u-title"
              className="mt-1.5"
              value={updateTitle}
              onChange={e => setUpdateTitle(e.target.value)}
              maxLength={200}
              placeholder="Brief description of your issue"
            />
            <p className="text-xs text-muted-foreground mt-1">{updateTitle.length}/200 characters</p>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="u-desc">Description *</Label>
            <Textarea
              id="u-desc"
              className="mt-1.5"
              rows={5}
              value={updateDesc}
              onChange={e => setUpdateDesc(e.target.value)}
              placeholder="Detailed information about your issue…"
            />
            <p className="text-xs text-muted-foreground mt-1">{updateDesc.length} characters (min 20)</p>
          </div>

          {/* Category + Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Category *</Label>
              <Select value={updateCategory} onValueChange={v => setUpdateCategory(v as TicketCategory)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Technical">🔧 Technical</SelectItem>
                  <SelectItem value="Billing">💳 Billing</SelectItem>
                  <SelectItem value="General">📋 General</SelectItem>
                  <SelectItem value="Sales">📈 Sales</SelectItem>
                  <SelectItem value="Product">📦 Product</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Priority</Label>
              <Select value={updatePriority} onValueChange={v => setUpdatePriority(v as TicketPriority)}>
                <SelectTrigger className="mt-1.5"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Low">🟢 Low</SelectItem>
                  <SelectItem value="Medium">🟡 Medium</SelectItem>
                  <SelectItem value="High">🟠 High</SelectItem>
                  <SelectItem value="Critical">🔴 Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <Button
              className="flex-1"
              onClick={handleUpdateTicket}
              disabled={loading || updateTitle.trim().length < 5 || updateDesc.trim().length < 20}
            >
              {loading ? 'Saving…' : 'Save Changes'}
            </Button>
            <Button variant="outline" onClick={() => setShowUpdateModal(false)} disabled={loading}>
              Cancel
            </Button>
          </div>
        </Modal>
      )}

      {/* ════════════════════════════════════════════════════════
          RESOLVE MODAL
          ════════════════════════════════════════════════════════ */}
      {showResolveModal && (
        <Modal title="Resolve Ticket" onClose={() => !loading && setShowResolveModal(false)}>
          <p className="text-sm text-muted-foreground">
            Provide a summary explaining how the issue was resolved.
          </p>
          <div>
            <Label htmlFor="r-summary">Resolution Summary *</Label>
            <Textarea
              id="r-summary"
              className="mt-1.5"
              rows={5}
              placeholder="Explain the root cause and the fix applied… (min 20 chars)"
              value={resolveSummary}
              onChange={e => setResolveSummary(e.target.value)}
            />
            <p className="text-xs text-muted-foreground mt-1">{resolveSummary.length} characters (min 20)</p>
          </div>
          <div className="flex gap-3 pt-1">
            <Button
              className="flex-1"
              onClick={handleResolve}
              disabled={loading || resolveSummary.trim().length < 20}
            >
              {loading ? 'Resolving…' : 'Mark as Resolved'}
            </Button>
            <Button variant="outline" onClick={() => setShowResolveModal(false)} disabled={loading}>
              Cancel
            </Button>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};

export default TicketDetailPage;