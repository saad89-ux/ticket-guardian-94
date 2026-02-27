import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { StatCard } from '@/components/shared/StatCard';
import { StatusBadge, PriorityBadge } from '@/components/shared/Badges';
import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Ticket, Clock, CheckCircle, BarChart3, RefreshCw, AlertTriangle, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { formatDistanceToNow, isPast } from 'date-fns';
import { Button } from '@/components/ui/button';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const BASE_URL = 'http://localhost:5001';

// ── SLA helpers (mirror backend slaChecker.js logic) ─────────────────────────
// Backend checks every 5 min: dueDate < now AND !isBreached AND status not Resolved/Closed
// We replicate the same rules client-side so UI is always accurate between polls

const SLA_POLL_MS = 5 * 60 * 1000; // match backend cron interval exactly

const getSLAState = (ticket) => {
  if (!ticket?.sla?.dueDate) return null;

  const due = new Date(ticket.sla.dueDate);
  const now = new Date();
  const isTerminal = ['Resolved', 'Closed'].includes(ticket.status);

  // ── Terminal tickets ALWAYS show SLA Met — no breach warning ever ──────────
  // Even if backend has isBreached=true (breach happened before resolution),
  // a resolved/closed ticket should never display a breach warning.
  if (isTerminal) {
    return {
      label: 'SLA Met',
      sublabel: null,
      color: 'text-green-600',
      bg: 'bg-green-50 border-green-200',
      badge: 'bg-green-100 text-green-700 border-green-200',
      icon: 'ok',
      severity: 0,
    };
  }

  // Already confirmed breached by backend (only for non-terminal tickets)
  if (ticket.sla.isBreached) {
    return {
      label: 'SLA Breached',
      sublabel: ticket.sla.breachedAt
        ? `Breached ${formatDistanceToNow(new Date(ticket.sla.breachedAt), { addSuffix: true })}`
        : null,
      color: 'text-red-600',
      bg: 'bg-red-50 border-red-200',
      badge: 'bg-red-100 text-red-700 border-red-300',
      icon: 'breached',
      severity: 3,
    };
  }

  // Past due but backend hasn't processed yet (within next 5-min window)
  if (isPast(due)) {
    return {
      label: 'SLA Overdue',
      sublabel: `Overdue by ${formatDistanceToNow(due)}`,
      color: 'text-red-500',
      bg: 'bg-red-50 border-red-200',
      badge: 'bg-red-100 text-red-600 border-red-200',
      icon: 'overdue',
      severity: 3,
    };
  }

  // Within 2 hours of breach
  const msLeft = due - now;
  if (msLeft < 2 * 60 * 60 * 1000) {
    return {
      label: 'SLA Critical',
      sublabel: `Due ${formatDistanceToNow(due, { addSuffix: true })}`,
      color: 'text-orange-500',
      bg: 'bg-orange-50 border-orange-200',
      badge: 'bg-orange-100 text-orange-600 border-orange-200',
      icon: 'critical',
      severity: 2,
    };
  }

  // Within 24 hours
  if (msLeft < 24 * 60 * 60 * 1000) {
    return {
      label: 'SLA At Risk',
      sublabel: `Due ${formatDistanceToNow(due, { addSuffix: true })}`,
      color: 'text-yellow-600',
      bg: 'bg-yellow-50 border-yellow-200',
      badge: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      icon: 'atrisk',
      severity: 1,
    };
  }

  // Healthy
  return {
    label: `Due ${formatDistanceToNow(due, { addSuffix: true })}`,
    sublabel: null,
    color: 'text-slate-500',
    bg: 'bg-slate-50 border-slate-200',
    badge: 'bg-slate-100 text-slate-500 border-slate-200',
    icon: 'ok',
    severity: 0,
  };
};

// ── Tiny helpers ──────────────────────────────────────────────────────────────
const formatMetricValue = (key, val) => {
  if (val === null || val === undefined) return '—';
  if (typeof val === 'boolean') return val ? 'Yes' : 'No';
  if (key.toLowerCase().includes('time') || key.toLowerCase().includes('duration'))
    return `${Number(val).toFixed(1)}h`;
  if (key.toLowerCase().includes('rate') || key.toLowerCase().includes('percent'))
    return `${Number(val).toFixed(1)}%`;
  if (key.toLowerCase().includes('rating') || key.toLowerCase().includes('score'))
    return `⭐ ${val}/5`;
  if (typeof val === 'number') return val;
  return val;
};

const toLabel = (key) =>
  key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase()).trim();

// ── Safe user field resolver ──────────────────────────────────────────────────
// Handles: populated object { name, email }, plain string ID, or null/undefined.
// Backend populate("createdBy", "name email") should always give an object,
// but if the ticket was created before populate was added we get a raw ObjectId string.
const getUserName  = (field) => field?.name  || (typeof field === 'string' ? `User (${field.slice(-6)})` : '—');
const getUserEmail = (field) => field?.email || '—';

// buildMonthlyTrend replaced by dedicated API endpoint /api/dashboard/agent/monthly-resolved
// which queries ALL resolved tickets this month (not capped at 10 like recentTickets).
// Kept as emergency fallback only.
const buildMonthlyTrend = (tickets) => {
  const now = new Date();
  const buckets = { W1: 0, W2: 0, W3: 0, W4: 0 };
  (tickets || []).forEach(t => {
    if (t.status === 'Resolved' && t.resolution?.resolvedAt) {
      const d = new Date(t.resolution.resolvedAt);
      if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
        const week = `W${Math.min(4, Math.ceil(d.getDate() / 7))}`;
        buckets[week]++;
      }
    }
  });
  return Object.entries(buckets).map(([week, resolved]) => ({ week, resolved }));
};

// ── Sub-components ────────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

const MetricRow = ({ label, value, last = false, highlight = false }) => (
  <div className={`flex justify-between items-center py-2 ${last ? '' : 'border-b border-border/50'}`}>
    <span className="text-sm text-muted-foreground">{label}</span>
    <span className={`font-semibold ${highlight ? 'text-red-600' : 'text-foreground'}`}>{value ?? '—'}</span>
  </div>
);

// SLA badge shown in table rows
const SLABadge = ({ ticket }) => {
  const sla = getSLAState(ticket);
  if (!sla) return <span className="text-xs text-muted-foreground">—</span>;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${sla.badge}`}>
      {sla.severity >= 2 && <AlertTriangle size={10} />}
      {sla.label}
    </span>
  );
};

// ── Main Component ────────────────────────────────────────────────────────────
const AgentDashboard = () => {
  const { user, token } = useAuth();

  const [stats, setStats]                 = useState({ assigned: 0, active: 0, resolved: 0, avgTime: '—', slaBreached: 0 });
  const [perfRows, setPerfRows]           = useState([]);
  const [recentTickets, setRecentTickets] = useState([]);
  const [trendData, setTrendData]         = useState([]);
  const [loading, setLoading]             = useState(true);
  const [refreshing, setRefreshing]       = useState(false);
  const [lastSyncAt, setLastSyncAt]       = useState(null);
  const pollRef                           = useRef(null);

  const fetchDashboard = async (silent = false) => {
    if (!token) return;
    silent ? setRefreshing(true) : setLoading(true);
    try {
      // ── Parallel fetch: main dashboard + dedicated monthly-resolved endpoint ──
      // The main dashboard recentTickets is capped at 10 and not filtered by month,
      // so it cannot reliably power the trend chart or avg resolution time.
      // /api/dashboard/agent/monthly-resolved returns ALL resolved tickets this month.
      const [dashRes, monthlyRes] = await Promise.all([
        fetch(`${BASE_URL}/api/dashboard/agent`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${BASE_URL}/api/dashboard/agent/monthly-resolved`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);

      if (!dashRes.ok) return;
      const data    = await dashRes.json();
      const monthly = monthlyRes.ok ? await monthlyRes.json() : null;

      const ms      = data.myStats ?? {};
      const pm      = ms.performanceMetrics ?? {};
      const tickets = Array.isArray(data.recentTickets) ? data.recentTickets : [];

      // ── SLA breach count — excludes Resolved/Closed ───────────────────────────
      const TERMINAL_STATUSES = ['Resolved', 'Closed'];
      const slaBreachedCount = tickets.filter(t => {
        if (TERMINAL_STATUSES.includes(t.status)) return false;
        if (t.sla?.isBreached) return true;
        if (t.sla?.dueDate && isPast(new Date(t.sla.dueDate))) return true;
        return false;
      }).length;

      // ── Avg resolution time ───────────────────────────────────────────────────
      // Priority order:
      //   1. monthly endpoint — calculated from actual resolution timestamps this month
      //   2. User.performanceMetrics.averageResolutionTime — running average from DB
      //   3. Fallback to '—'
      const avgRaw =
        monthly?.avgResolutionTime ??
        pm.averageResolutionTime   ??
        pm.avgResolutionTime       ??
        null;
      const avgTime = avgRaw != null ? `${Number(avgRaw).toFixed(1)}h` : '—';

      // ── Stat cards ───────────────────────────────────────────────────────────
      setStats({
        assigned:    ms.totalAssigned ?? 0,
        active:      ms.currentOpen   ?? 0,
        resolved:    ms.totalResolved ?? 0,
        avgTime,
        slaBreached: slaBreachedCount,
      });

      // ── Performance Metrics rows — fully dynamic ──────────────────────────────
      const topRows = [
        { key: 'totalAssigned',         val: ms.totalAssigned },
        { key: 'currentOpen',           val: ms.currentOpen   },
        { key: 'totalResolved',         val: ms.totalResolved },
        { key: 'resolvedThisMonth',     val: monthly?.totalResolvedThisMonth ?? null },
        { key: 'slaBreachedTickets',    val: slaBreachedCount },
      ];
      const pmRows = Object.entries(pm).map(([key, val]) => ({ key, val }));
      const allRows = [...topRows, ...pmRows].map(({ key, val }) => ({
        label:     toLabel(key),
        value:     formatMetricValue(key, val),
        highlight: key === 'slaBreachedTickets' && val > 0,
      }));
      setPerfRows(allRows);

      // ── Recent tickets ────────────────────────────────────────────────────────
      setRecentTickets(tickets);

      // ── Monthly trend — from dedicated endpoint (all resolved this month) ──────
      // Falls back to deriving from recentTickets only if endpoint fails.
      if (monthly?.monthlyTrend?.length) {
        setTrendData(monthly.monthlyTrend);
      } else {
        setTrendData(buildMonthlyTrend(tickets));
      }

      setLastSyncAt(new Date());
    } catch (err) {
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // ── Auto-poll every 5 min (matches backend SLA checker interval exactly) ────
  useEffect(() => {
    fetchDashboard();
    pollRef.current = setInterval(() => fetchDashboard(true), SLA_POLL_MS);
    return () => clearInterval(pollRef.current);
  }, [token]);

  // ── Client-side SLA re-evaluation every 30s ──────────────────────────────────
  // Catches tickets that just crossed their dueDate between server polls
  useEffect(() => {
    const timer = setInterval(() => {
      setRecentTickets(prev => [...prev]); // trigger re-render so SLABadge re-evaluates
    }, 30_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Agent Dashboard</h1>
          <p className="text-muted-foreground">
            {user?.name} • {user?.department || 'Technical'} Department
          </p>
        </div>
        <div className="flex items-center gap-3">
          {lastSyncAt && (
            <span className="text-xs text-muted-foreground">
              Last sync: {formatDistanceToNow(lastSyncAt, { addSuffix: true })}
            </span>
          )}
          <Button variant="outline" size="sm" onClick={() => fetchDashboard(true)} disabled={refreshing}
                  className="gap-1.5 text-xs">
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Stats Cards — 5 cards including SLA Breached ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard title="Assigned"       value={loading ? '…' : stats.assigned}    icon={<Ticket size={24} />} />
        <StatCard title="Active"         value={loading ? '…' : stats.active}      icon={<Clock size={24} />} />
        <StatCard title="Resolved"       value={loading ? '…' : stats.resolved}    icon={<CheckCircle size={24} />} />
        <StatCard title="Avg Resolution" value={loading ? '…' : stats.avgTime}     icon={<BarChart3 size={24} />} />
        {/* SLA Breached card — highlights red when > 0 */}
        <div className={`rounded-xl border p-4 transition-colors ${
          !loading && stats.slaBreached > 0
            ? 'bg-red-50 border-red-200'
            : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium text-muted-foreground">SLA Breached</span>
            <ShieldAlert size={18} className={stats.slaBreached > 0 ? 'text-red-500' : 'text-slate-400'} />
          </div>
          <p className={`text-2xl font-bold ${stats.slaBreached > 0 ? 'text-red-600' : 'text-slate-700'}`}>
            {loading ? '…' : stats.slaBreached}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {stats.slaBreached > 0 ? 'Needs attention' : 'All on track'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* ── Performance Metrics — fully dynamic ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Performance Metrics</h3>
            {/* SLA alert banner inside metrics card */}
            {!loading && stats.slaBreached > 0 && (
              <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                <AlertTriangle size={11} />
                {stats.slaBreached} SLA breach{stats.slaBreached > 1 ? 'es' : ''}
              </span>
            )}
          </div>
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : perfRows.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No metrics available</p>
          ) : (
            <div className="space-y-1">
              {perfRows.map((row, i) => (
                <MetricRow
                  key={row.label}
                  label={row.label}
                  value={row.value}
                  highlight={row.highlight}
                  last={i === perfRows.length - 1}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* ── Resolution Trend (This Month) ── */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Resolution Trend (This Month)</h3>
          {loading ? (
            <Skeleton className="h-[220px] w-full" />
          ) : trendData.every(d => d.resolved === 0) ? (
            <div className="h-[220px] flex items-center justify-center text-sm text-muted-foreground">
              No resolutions recorded this month
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="week" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ background: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: 8 }}
                  labelStyle={{ fontWeight: 600 }}
                  formatter={(val) => [`${val} resolved`, 'Tickets']}
                />
                <Line type="monotone" dataKey="resolved" stroke="hsl(217, 91%, 60%)"
                      strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* ── Ticket Queue ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="font-semibold text-foreground">Ticket Queue</h3>
            {/* Live SLA breach count badge */}
            <AnimatePresence>
              {!loading && stats.slaBreached > 0 && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full"
                >
                  <AlertTriangle size={10} />
                  {stats.slaBreached} SLA issue{stats.slaBreached > 1 ? 's' : ''}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          <Link to="/agent/tickets">
            <Button variant="outline" size="sm">View All</Button>
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
          </div>
        ) : recentTickets.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-sm">
            No tickets in your queue
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Ticket</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Title</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">User</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Priority</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">SLA</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Created</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Action</th>
                </tr>
              </thead>
              <tbody>
                {recentTickets.slice(0, 6).map(ticket => {
                  const sla = getSLAState(ticket);
                  const rowHighlight = sla?.severity >= 2;
                  return (
                    <tr
                      key={ticket._id}
                      className={`border-b border-border/50 transition-colors ${
                        rowHighlight
                          ? 'bg-red-50/40 hover:bg-red-50/70'
                          : 'hover:bg-secondary/30'
                      }`}
                    >
                      <td className="py-3 px-2 font-mono text-xs text-primary">
                        <div className="flex items-center gap-1">
                          {rowHighlight && <AlertTriangle size={10} className="text-red-500 flex-shrink-0" />}
                          {ticket.ticketNumber}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-foreground max-w-[160px] truncate">{ticket.title}</td>
                      <td className="py-3 px-2 text-foreground text-xs">
                        {getUserName(ticket.createdBy)}
                      </td>
                      <td className="py-3 px-2"><StatusBadge status={ticket.status} /></td>
                      <td className="py-3 px-2"><PriorityBadge priority={ticket.priority} /></td>
                      {/* ── SLA column — fully dynamic, re-evaluates every 30s ── */}
                      <td className="py-3 px-2">
                        <SLABadge ticket={ticket} />
                        {sla?.sublabel && (
                          <p className={`text-xs mt-0.5 ${sla.color}`}>{sla.sublabel}</p>
                        )}
                      </td>
                      <td className="py-3 px-2 text-muted-foreground text-xs">
                        {ticket.createdAt
                          ? formatDistanceToNow(new Date(ticket.createdAt), { addSuffix: true })
                          : '—'}
                      </td>
                      <td className="py-3 px-2">
                        <Link to="/agent/tickets">
                          <Button variant="outline" size="sm">
                            {ticket.assignedTo ? 'View' : 'Assign'}
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </DashboardLayout>
  );
};

export default AgentDashboard;