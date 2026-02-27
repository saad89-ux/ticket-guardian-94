import { useState, useEffect, useCallback, useRef } from 'react';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { StatusBadge, PriorityBadge, CategoryBadge } from '@/components/shared/Badges';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, format, isPast } from 'date-fns';
import {
  Search,
  UserCheck,
  FileText,
  CheckCircle,
  Eye,
  Clock,
  AlertTriangle,
  Loader2,
  MessageSquarePlus,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';

const BASE_URL = 'http://localhost:5001';

// ─── Color maps ───────────────────────────────────────────────────────────────
const priorityColor = {
  Critical: 'text-red-500 bg-red-50 border-red-200',
  High:     'text-orange-500 bg-orange-50 border-orange-200',
  Medium:   'text-yellow-600 bg-yellow-50 border-yellow-200',
  Low:      'text-green-600 bg-green-50 border-green-200',
};

const statusColor = {
  'Open':        'text-blue-600 bg-blue-50 border-blue-200',
  'In Progress': 'text-purple-600 bg-purple-50 border-purple-200',
  'Resolved':    'text-green-600 bg-green-50 border-green-200',
  'Closed':      'text-gray-500 bg-gray-50 border-gray-200',
  'Reopened':    'text-amber-600 bg-amber-50 border-amber-200',
};

// ─── SLA state machine ────────────────────────────────────────────────────────
// Mirrors backend slaChecker.js rules exactly.
// KEY RULE: terminal tickets (Resolved / Closed) ALWAYS return "SLA Met" — green,
// no warnings — even if DB has isBreached:true (breach happened before resolution).
// Order matters: isTerminal check MUST come before any isBreached / isPast check.

const TERMINAL = ['Resolved', 'Closed'];

// ── Safe user field resolver ──────────────────────────────────────────────────
// Backend must populate createdBy with "name email department".
// If populate is missing or the ticket pre-dates it, field may be a raw ObjectId string.
// These helpers handle all three cases: object, string, null.
const getUserName  = (field) => field?.name  || (typeof field === 'string' ? `User (${field.slice(-6)})` : '—');
const getUserEmail = (field) => field?.email || '—';

const getSLAState = (ticket) => {
  if (!ticket?.sla?.dueDate) return null;

  // ── 1. Terminal check FIRST — never show breach for resolved tickets ──────────
  if (TERMINAL.includes(ticket.status)) {
    return {
      label:    'SLA Met',
      sublabel: null,
      color:    'text-green-600',
      badge:    'bg-green-100 text-green-700 border-green-200',
      severity: 0,
    };
  }

  const due = new Date(ticket.sla.dueDate);
  const now = new Date();

  // ── 2. Backend-confirmed breach (non-terminal only) ──────────────────────────
  if (ticket.sla.isBreached) {
    return {
      label:    'SLA Breached',
      sublabel: ticket.sla.breachedAt
        ? `Breached ${formatDistanceToNow(new Date(ticket.sla.breachedAt), { addSuffix: true })}`
        : null,
      color:    'text-red-600',
      badge:    'bg-red-100 text-red-700 border-red-300',
      severity: 3,
    };
  }

  // ── 3. Past due — client-side catch before next 5-min cron runs ──────────────
  if (isPast(due)) {
    return {
      label:    'SLA Overdue',
      sublabel: `Overdue by ${formatDistanceToNow(due)}`,
      color:    'text-red-500',
      badge:    'bg-red-100 text-red-600 border-red-200',
      severity: 3,
    };
  }

  const msLeft = due - now;

  // ── 4. Within 2 hours ────────────────────────────────────────────────────────
  if (msLeft < 2 * 60 * 60 * 1000) {
    return {
      label:    'SLA Critical',
      sublabel: `Due ${formatDistanceToNow(due, { addSuffix: true })}`,
      color:    'text-orange-500',
      badge:    'bg-orange-100 text-orange-600 border-orange-200',
      severity: 2,
    };
  }

  // ── 5. Within 24 hours ───────────────────────────────────────────────────────
  if (msLeft < 24 * 60 * 60 * 1000) {
    return {
      label:    'SLA At Risk',
      sublabel: `Due ${formatDistanceToNow(due, { addSuffix: true })}`,
      color:    'text-yellow-600',
      badge:    'bg-yellow-100 text-yellow-700 border-yellow-200',
      severity: 1,
    };
  }

  // ── 6. Healthy ───────────────────────────────────────────────────────────────
  return {
    label:    `Due ${formatDistanceToNow(due, { addSuffix: true })}`,
    sublabel: null,
    color:    'text-slate-500',
    badge:    'bg-slate-100 text-slate-500 border-slate-200',
    severity: 0,
  };
};

// SLA pill for table rows — re-evaluates every 30 s via tick state
const SLABadge = ({ ticket }) => {
  const sla = getSLAState(ticket);
  if (!sla) return <span className="text-xs text-slate-300">—</span>;
  return (
    <div>
      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${sla.badge}`}>
        {sla.severity >= 3 && <AlertTriangle size={9} />}
        {sla.severity === 0 && <Clock size={9} />}
        {sla.label}
      </span>
      {sla.sublabel && (
        <p className={`text-xs mt-0.5 ${sla.color}`}>{sla.sublabel}</p>
      )}
    </div>
  );
};

// ─── Status machine helpers ───────────────────────────────────────────────────
const resolvedId = (val) => val?._id?.toString() ?? val?.toString();
const isAssignedToMe = (ticket, uid) =>
  !!uid && !!ticket.assignedTo && resolvedId(ticket.assignedTo) === uid?.toString();
const canAssign  = (ticket)      => !ticket.assignedTo && ticket.status === 'Open';
const canAct     = (ticket, uid) =>
  isAssignedToMe(ticket, uid) && ['In Progress', 'Reopened'].includes(ticket.status);
const isTerminal = (ticket)      => TERMINAL.includes(ticket.status);

// ─── Ticket Detail Modal ──────────────────────────────────────────────────────
const TicketDetailModal = ({ ticket, token, onClose, onRefresh, currentUserId }) => {
  const [note, setNote]           = useState('');
  const [summary, setSummary]     = useState('');
  const [loading, setLoading]     = useState('');
  const [activeTab, setActiveTab] = useState('details');

  const isMine   = isAssignedToMe(ticket, currentUserId);
  const canDoAct = canAct(ticket, currentUserId);
  const terminal = isTerminal(ticket);
  const sla      = getSLAState(ticket); // live, respects terminal

  // Dynamic tabs — only show what's relevant for current workflow state
  const tabs = [
    'details',
    ...(canDoAct || (ticket.investigationNotes?.length > 0) ? ['notes'] : []),
    'history',
    ...(canDoAct || terminal ? ['resolve'] : []),
  ];
  const safeTab = tabs.includes(activeTab) ? activeTab : 'details';

  const apiCall = async (url, method, body) => {
    const res = await fetch(`${BASE_URL}${url}`, {
      method,
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Request failed');
    return data;
  };

  const handleAssign = async () => {
    setLoading('assign');
    try {
      await apiCall(`/api/tickets/${ticket._id}/assign`, 'POST');
      toast.success('Ticket assigned to you!');
      onRefresh(); onClose();
    } catch (e) { toast.error(e.message); }
    finally { setLoading(''); }
  };

  const handleAddNote = async () => {
    if (note.trim().length < 10) return toast.error('Note must be at least 10 characters');
    setLoading('note');
    try {
      await apiCall(`/api/tickets/${ticket._id}/note`, 'POST', { note });
      toast.success('Investigation note added!');
      setNote('');
      onRefresh();
    } catch (e) { toast.error(e.message); }
    finally { setLoading(''); }
  };

  const handleResolve = async () => {
    if (summary.trim().length < 20) return toast.error('Summary must be at least 20 characters');
    setLoading('resolve');
    try {
      await apiCall(`/api/tickets/${ticket._id}/resolve`, 'POST', { summary });
      toast.success('Ticket resolved successfully!');
      onRefresh(); onClose();
    } catch (e) { toast.error(e.message); }
    finally { setLoading(''); }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col p-0">

        {/* ── Header ── */}
        <div className="px-6 pt-6 pb-4 border-b bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className="text-xs font-mono text-slate-400 mb-1">{ticket.ticketNumber}</p>
              <h2 className="text-lg font-semibold text-slate-800 truncate">{ticket.title}</h2>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColor[ticket.status] || 'text-gray-500 bg-gray-50 border-gray-200'}`}>
                  {ticket.status}
                </span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${priorityColor[ticket.priority] || ''}`}>
                  {ticket.priority}
                </span>
                <span className="text-xs text-slate-400">{ticket.category}</span>
              </div>
            </div>

            {/* SLA pill in header — terminal = green SLA Met, never red */}
            {sla && (
              <div className="flex flex-col items-end gap-0.5 flex-shrink-0">
                <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${sla.badge}`}>
                  {sla.severity >= 3 && <AlertTriangle size={9} />}
                  {sla.severity === 0 && <Clock size={9} />}
                  {sla.label}
                </span>
                {sla.sublabel && (
                  <span className={`text-xs ${sla.color}`}>{sla.sublabel}</span>
                )}
              </div>
            )}
          </div>

          {/* Dynamic tabs */}
          <div className="flex gap-1 mt-4">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${
                  safeTab === tab
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                }`}
              >
                {tab === 'notes' ? 'Investigation' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          <AnimatePresence mode="wait">
            <motion.div
              key={safeTab}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.15 }}
            >

              {/* ══ DETAILS ══ */}
              {safeTab === 'details' && (
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Description</p>
                    <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-lg p-4 border border-slate-100">
                      {ticket.description}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <InfoRow label="Reported by" value={getUserName(ticket.createdBy)} />
                    <InfoRow label="Email"        value={getUserEmail(ticket.createdBy)} />
                    <InfoRow label="Assigned to"  value={ticket.assignedTo?.name || 'Unassigned'} />
                    <InfoRow label="Department"   value={ticket.assignedTo?.department || '—'} />
                    <InfoRow label="Created"      value={ticket.createdAt ? format(new Date(ticket.createdAt), 'MMM d, yyyy HH:mm') : '—'} />
                    {/* SLA Due — colored red/orange when breached, normal otherwise */}
                    <InfoRow
                      label="SLA Due"
                      value={ticket.sla?.dueDate ? format(new Date(ticket.sla.dueDate), 'MMM d, yyyy HH:mm') : '—'}
                      valueClass={!terminal && sla && sla.severity >= 2 ? sla.color : ''}
                    />
                  </div>

                  {ticket.attachments?.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Attachments</p>
                      <div className="flex flex-wrap gap-2">
                        {ticket.attachments.map((att, i) => (
                          <a key={i} href={att.url} target="_blank" rel="noreferrer"
                             className="text-xs text-blue-600 hover:underline bg-blue-50 px-3 py-1.5 rounded-md border border-blue-100">
                            📎 {att.fileName}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* SLA warning banner — only for non-terminal + severity >= 2 */}
                  {!terminal && sla && sla.severity >= 2 && (
                    <div className={`p-3 rounded-xl border flex items-center gap-2 ${
                      sla.severity === 3 ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'
                    }`}>
                      <AlertTriangle size={15} className={sla.severity === 3 ? 'text-red-500' : 'text-orange-500'} />
                      <div>
                        <p className={`text-sm font-semibold ${sla.severity === 3 ? 'text-red-700' : 'text-orange-700'}`}>
                          {sla.label}
                        </p>
                        {sla.sublabel && (
                          <p className={`text-xs mt-0.5 ${sla.color}`}>{sla.sublabel}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Open + unassigned → Claim */}
                  {canAssign(ticket) && (
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-blue-800">This ticket is unassigned</p>
                        <p className="text-xs text-blue-600 mt-0.5">Claim it to start working on it</p>
                      </div>
                      <Button onClick={handleAssign} disabled={loading === 'assign'}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs">
                        {loading === 'assign'
                          ? <Loader2 size={14} className="animate-spin mr-1" />
                          : <UserCheck size={14} className="mr-1" />}
                        Assign to Me
                      </Button>
                    </div>
                  )}

                  {/* Assigned to someone else */}
                  {ticket.assignedTo && !isMine && !terminal && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2">
                      <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
                      <p className="text-sm text-amber-700">
                        Assigned to <span className="font-semibold">{ticket.assignedTo?.name || 'another agent'}</span> — view only
                      </p>
                    </div>
                  )}

                  {/* My ticket, actionable */}
                  {isMine && !terminal && (
                    <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center gap-2">
                      <ShieldCheck size={16} className="text-purple-600" />
                      <p className="text-sm text-purple-700 font-medium">
                        You are the assigned agent — status: <span className="font-bold">{ticket.status}</span>
                      </p>
                    </div>
                  )}

                  {/* Terminal notice */}
                  {terminal && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-xl flex items-center gap-2">
                      <CheckCircle size={16} className="text-green-600" />
                      <p className="text-sm text-green-700 font-medium">
                        Ticket is <span className="font-bold">{ticket.status}</span> — no further actions available
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ══ INVESTIGATION NOTES ══ */}
              {safeTab === 'notes' && (
                <div className="space-y-5">
                  {canDoAct && (
                    <div className="space-y-2">
                      <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Add Note</p>
                      <Textarea
                        placeholder="Document your investigation findings... (min 10 chars)"
                        value={note}
                        onChange={e => setNote(e.target.value)}
                        rows={3}
                        className="text-sm resize-none"
                      />
                      <div className="flex items-center justify-between">
                        <span className={`text-xs ${note.length < 10 ? 'text-slate-400' : 'text-green-600'}`}>
                          {note.length}/10 min characters
                        </span>
                        <Button onClick={handleAddNote} disabled={loading === 'note' || note.length < 10}
                                size="sm" className="bg-slate-800 hover:bg-slate-700 text-white text-xs">
                          {loading === 'note'
                            ? <Loader2 size={13} className="animate-spin mr-1" />
                            : <MessageSquarePlus size={13} className="mr-1" />}
                          Add Note
                        </Button>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {ticket.investigationNotes?.length || 0} Note{ticket.investigationNotes?.length !== 1 ? 's' : ''}
                    </p>
                    {!ticket.investigationNotes?.length ? (
                      <div className="text-center py-8 text-slate-400">
                        <FileText size={32} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No investigation notes yet</p>
                      </div>
                    ) : (
                      ticket.investigationNotes.map((n, i) => (
                        <div key={i} className="bg-slate-50 border border-slate-100 rounded-xl p-4">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-semibold text-slate-700">{n.addedBy?.name || 'Agent'}</span>
                            <span className="text-xs text-slate-400">
                              {n.addedAt ? formatDistanceToNow(new Date(n.addedAt), { addSuffix: true }) : ''}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 leading-relaxed">{n.note}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* ══ STATUS HISTORY ══ */}
              {safeTab === 'history' && (
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Status Timeline</p>
                  {!ticket.statusHistory?.length ? (
                    <p className="text-sm text-slate-400 text-center py-6">No history available</p>
                  ) : (
                    <div className="relative">
                      <div className="absolute left-3 top-0 bottom-0 w-px bg-slate-200" />
                      {[...ticket.statusHistory].reverse().map((h, i) => (
                        <div key={i} className="relative flex gap-4 pb-4 last:pb-0">
                          <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                            h.status === 'Resolved'    ? 'bg-green-100 border-green-400'   :
                            h.status === 'In Progress' ? 'bg-purple-100 border-purple-400' :
                            h.status === 'Reopened'    ? 'bg-amber-100 border-amber-400'   :
                            h.status === 'Closed'      ? 'bg-gray-100 border-gray-400'     :
                                                         'bg-blue-100 border-blue-300'
                          }`}>
                            <div className={`w-2 h-2 rounded-full ${
                              h.status === 'Resolved'    ? 'bg-green-500'  :
                              h.status === 'In Progress' ? 'bg-purple-500' :
                              h.status === 'Reopened'    ? 'bg-amber-500'  :
                              h.status === 'Closed'      ? 'bg-gray-500'   : 'bg-blue-400'
                            }`} />
                          </div>
                          <div className="flex-1 pt-0.5">
                            <p className="text-sm font-medium text-slate-700">{h.status}</p>
                            <p className="text-xs text-slate-400">{h.reason}</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              by {h.changedBy?.name || 'System'} ·{' '}
                              {h.changedAt ? formatDistanceToNow(new Date(h.changedAt), { addSuffix: true }) : ''}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* ══ RESOLVE ══ */}
              {safeTab === 'resolve' && (
                <div className="space-y-4">
                  {terminal ? (
                    <div className="text-center py-10">
                      <CheckCircle size={40} className="mx-auto text-green-500 mb-3" />
                      <p className="text-base font-semibold text-slate-700">Ticket {ticket.status}</p>
                      {ticket.resolution?.summary && (
                        <div className="mt-4 text-left bg-green-50 border border-green-100 rounded-xl p-4">
                          <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1">Resolution Summary</p>
                          <p className="text-sm text-slate-700">{ticket.resolution.summary}</p>
                          <p className="text-xs text-slate-400 mt-2">
                            Resolved by {ticket.resolution.resolvedBy?.name || '—'} ·{' '}
                            {ticket.resolution.resolvedAt ? format(new Date(ticket.resolution.resolvedAt), 'MMM d, yyyy') : ''}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : !canDoAct ? (
                    <div className="text-center py-10 text-slate-400">
                      <AlertTriangle size={32} className="mx-auto mb-2 opacity-40" />
                      <p className="text-sm">Only the assigned agent can resolve this ticket</p>
                      <p className="text-xs mt-1 text-slate-300">
                        Current status: <span className="font-medium text-slate-400">{ticket.status}</span>
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
                        <AlertTriangle size={16} className="text-amber-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-sm font-semibold text-amber-800">Before resolving</p>
                          <p className="text-xs text-amber-700 mt-0.5">
                            Provide a clear summary of how this issue was resolved. This cannot be undone.
                          </p>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                          Resolution Summary <span className="text-red-400">*</span>
                        </label>
                        <Textarea
                          placeholder="Describe the steps taken and how the issue was resolved... (min 20 chars)"
                          value={summary}
                          onChange={e => setSummary(e.target.value)}
                          rows={5}
                          className="text-sm resize-none"
                        />
                        <div className="flex items-center justify-between">
                          <span className={`text-xs ${summary.length < 20 ? 'text-slate-400' : 'text-green-600'}`}>
                            {summary.length}/20 min characters
                          </span>
                          <Button
                            onClick={handleResolve}
                            disabled={loading === 'resolve' || summary.length < 20}
                            className="bg-green-600 hover:bg-green-700 text-white text-xs"
                          >
                            {loading === 'resolve'
                              ? <Loader2 size={13} className="animate-spin mr-1" />
                              : <CheckCircle size={13} className="mr-1" />}
                            Mark as Resolved
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const InfoRow = ({ label, value, valueClass = '' }) => (
  <div>
    <p className="text-xs text-slate-400 font-medium">{label}</p>
    <p className={`text-sm mt-0.5 truncate ${valueClass || 'text-slate-700'}`}>{value}</p>
  </div>
);

// ─── Main Page ────────────────────────────────────────────────────────────────
const AgentTicketsPage = () => {
  const { token, user } = useAuth();
  const [tickets, setTickets]               = useState([]);
  const [loading, setLoading]               = useState(true);
  const [refreshing, setRefreshing]         = useState(false);
  const [search, setSearch]                 = useState('');
  const [statusFilter, setStatusFilter]     = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [detailTicket, setDetailTicket]     = useState(null);
  const [detailLoading, setDetailLoading]   = useState(false);
  const [, setTick]                         = useState(0); // drives 30s SLA re-eval
  const pollRef                             = useRef(null);
  const slaRef                              = useRef(null);

  const fetchTickets = useCallback(async (silent = false) => {
    if (!token) return;
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/api/tickets/agent/tickets`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.ok ? await res.json() : [];
      setTickets(Array.isArray(data) ? data : []);
    } catch {
      toast.error('Failed to fetch tickets');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  // Auto-poll every 5 min — syncs with backend slaChecker cron interval
  useEffect(() => {
    fetchTickets();
    pollRef.current = setInterval(() => fetchTickets(true), 5 * 60 * 1000);
    return () => clearInterval(pollRef.current);
  }, [fetchTickets]);

  // Re-evaluate SLA state every 30 s — catches dueDate crossings between polls
  useEffect(() => {
    slaRef.current = setInterval(() => setTick(t => t + 1), 30_000);
    return () => clearInterval(slaRef.current);
  }, []);

  const openDetail = async (ticket) => {
    setSelectedTicket(ticket);
    setDetailLoading(true);
    try {
      const res  = await fetch(`${BASE_URL}/api/tickets/${ticket._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setDetailTicket(data);
    } catch {
      setDetailTicket(ticket);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleRefreshAfterAction = async () => {
    await fetchTickets(true);
    if (selectedTicket) {
      try {
        const res = await fetch(`${BASE_URL}/api/tickets/${selectedTicket._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) setDetailTicket(await res.json());
      } catch { /* keep stale */ }
    }
  };

  const handleAssignDirect = async (ticketId, e) => {
    e.stopPropagation();
    try {
      const res  = await fetch(`${BASE_URL}/api/tickets/${ticketId}/assign`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Ticket assigned to you!');
      fetchTickets(true);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const filtered = tickets
    .filter(t => statusFilter   === 'all' || t.status   === statusFilter)
    .filter(t => priorityFilter === 'all' || t.priority === priorityFilter)
    .filter(t => !search ||
      t.title?.toLowerCase().includes(search.toLowerCase()) ||
      t.ticketNumber?.toLowerCase().includes(search.toLowerCase()) ||
      t.createdBy?.name?.toLowerCase().includes(search.toLowerCase())
    );

  // Stats — slaBreached skips terminal tickets entirely
  const stats = {
    total:      tickets.length,
    open:       tickets.filter(t => t.status === 'Open').length,
    inProgress: tickets.filter(t => t.status === 'In Progress').length,
    resolved:   tickets.filter(t => t.status === 'Resolved').length,
    slaBreached: tickets.filter(t => {
      if (TERMINAL.includes(t.status)) return false;   // resolved = never count
      return t.sla?.isBreached || (t.sla?.dueDate && isPast(new Date(t.sla.dueDate)));
    }).length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 p-6">

        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Ticket Queue</h1>
            <p className="text-sm text-slate-500 mt-1">Manage and resolve support tickets assigned to you</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => fetchTickets(true)} disabled={refreshing}
                  className="gap-1.5 text-xs">
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </div>

        {/* Stats — 5 cards, SLA Breached is dynamic */}
        <div className="grid grid-cols-5 gap-4">
          {[
            { label: 'Total',       value: stats.total,      color: 'text-slate-700',  bg: 'bg-slate-50  border-slate-200' },
            { label: 'Open',        value: stats.open,       color: 'text-blue-700',   bg: 'bg-blue-50   border-blue-200' },
            { label: 'In Progress', value: stats.inProgress, color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200' },
            { label: 'Resolved',    value: stats.resolved,   color: 'text-green-700',  bg: 'bg-green-50  border-green-200' },
          ].map(s => (
            <div key={s.label} className={`rounded-xl border p-4 ${s.bg}`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}

          {/* SLA Breached — green when 0, red when > 0, Resolved tickets excluded */}
          <div className={`rounded-xl border p-4 transition-colors ${
            stats.slaBreached > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
          }`}>
            <div className="flex items-center justify-between mb-1">
              <ShieldAlert size={16} className={stats.slaBreached > 0 ? 'text-red-500' : 'text-green-500'} />
            </div>
            <p className={`text-2xl font-bold ${stats.slaBreached > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {stats.slaBreached}
            </p>
            <p className="text-xs text-slate-500 mt-1">SLA Breached</p>
            <p className={`text-xs mt-0.5 font-medium ${stats.slaBreached > 0 ? 'text-red-500' : 'text-green-500'}`}>
              {stats.slaBreached > 0 ? 'Needs attention' : 'All on track'}
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input placeholder="Search tickets, ID, reporter..." value={search}
                   onChange={e => setSearch(e.target.value)} className="pl-9 text-sm" />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 text-sm"><SelectValue placeholder="Status" /></SelectTrigger>
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
            <SelectTrigger className="w-40 text-sm"><SelectValue placeholder="Priority" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priority</SelectItem>
              <SelectItem value="Critical">Critical</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
          <span className="text-xs text-slate-400 ml-auto">
            {filtered.length} ticket{filtered.length !== 1 ? 's' : ''}
          </span>
        </div>

        {/* Table */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 size={28} className="animate-spin text-slate-400" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <FileText size={40} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm font-medium">No tickets found</p>
              <p className="text-xs mt-1">Try adjusting your filters</p>
            </div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50">
                  {['Ticket', 'Reporter', 'Category', 'Status', 'Priority', 'Assigned', 'SLA', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wider">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filtered.map((ticket, i) => {
                    const sla      = getSLAState(ticket); // re-runs every 30s via tick
                    const isMyTicket = isAssignedToMe(ticket, user?._id);
                    const myCanAct   = canAct(ticket, user?._id);
                    const rowAlert   = sla && sla.severity >= 2;
                    return (
                      <motion.tr
                        key={ticket._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className={`border-b border-slate-50 transition-colors cursor-pointer ${
                          rowAlert ? 'bg-red-50/30 hover:bg-red-50/60' : 'hover:bg-slate-50/70'
                        }`}
                        onClick={() => openDetail(ticket)}
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {rowAlert && <AlertTriangle size={10} className="text-red-400 flex-shrink-0" />}
                            <div>
                              <p className="font-mono text-xs text-slate-400">{ticket.ticketNumber}</p>
                              <p className="font-medium text-slate-700 truncate max-w-[180px]">{ticket.title}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <p className="text-slate-700 font-medium">{getUserName(ticket.createdBy)}</p>
                          <p className="text-slate-400">{getUserEmail(ticket.createdBy)}</p>
                        </td>
                        <td className="px-4 py-3">
                          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">
                            {ticket.category}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColor[ticket.status] || 'text-gray-500 bg-gray-50 border-gray-200'}`}>
                            {ticket.status}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${priorityColor[ticket.priority] || ''}`}>
                            {ticket.priority}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-600">
                          {ticket.assignedTo?.name
                            ? <span className={isMyTicket ? 'text-purple-600 font-medium' : ''}>{ticket.assignedTo.name}</span>
                            : <span className="text-slate-300 italic">Unassigned</span>
                          }
                        </td>

                        {/* SLA column — Resolved/Closed always green "SLA Met" */}
                        <td className="px-4 py-3">
                          <SLABadge ticket={ticket} />
                        </td>

                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5">
                            <Button size="sm" variant="ghost" onClick={() => openDetail(ticket)}
                                    className="h-7 px-2 text-xs text-slate-600 hover:bg-slate-100">
                              <Eye size={12} className="mr-1" /> View
                            </Button>
                            {canAssign(ticket) && (
                              <Button size="sm" onClick={(e) => handleAssignDirect(ticket._id, e)}
                                      className="h-7 px-2 text-xs bg-blue-600 hover:bg-blue-700 text-white">
                                <UserCheck size={12} className="mr-1" /> Claim
                              </Button>
                            )}
                            {myCanAct && (
                              <Button size="sm" variant="ghost"
                                      onClick={(e) => { e.stopPropagation(); openDetail(ticket); }}
                                      className="h-7 px-2 text-xs text-green-600 hover:bg-green-50">
                                <CheckCircle size={12} className="mr-1" /> Resolve
                              </Button>
                            )}
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedTicket && (
        detailLoading ? (
          <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 flex items-center gap-3">
              <Loader2 className="animate-spin text-slate-500" />
              <span className="text-sm text-slate-600">Loading ticket details...</span>
            </div>
          </div>
        ) : detailTicket && (
          <TicketDetailModal
            ticket={detailTicket}
            token={token}
            currentUserId={user?._id}
            onClose={() => { setSelectedTicket(null); setDetailTicket(null); }}
            onRefresh={handleRefreshAfterAction}
          />
        )
      )}
    </DashboardLayout>
  );
};

export default AgentTicketsPage;