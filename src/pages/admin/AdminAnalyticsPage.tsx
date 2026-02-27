import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { RefreshCw, AlertTriangle, ShieldAlert, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  AreaChart, Area,
} from 'recharts';
import { formatDistanceToNow, isPast } from 'date-fns';

const BASE_URL = 'http://localhost:5001';

// ── Colors ────────────────────────────────────────────────────────────────────
const STATUS_COLORS = {
  Open:          '#3b82f6',
  'In Progress': '#a855f7',
  Resolved:      '#10b981',
  Closed:        '#6b7280',
  Reopened:      '#f59e0b',
};
const FALLBACK_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#f97316', '#ef4444'];

// ── SLA State Machine ─────────────────────────────────────────────────────────
const TERMINAL = ['Resolved', 'Closed'];

const getSLAState = (ticket) => {
  if (!ticket?.sla?.dueDate) return null;
  if (TERMINAL.includes(ticket.status)) {
    return { label: 'SLA Met', color: 'text-green-600', badge: 'bg-green-100 text-green-700 border-green-200', severity: 0 };
  }
  const due = new Date(ticket.sla.dueDate);
  const now = new Date();
  if (ticket.sla?.isBreached) {
    return {
      label: 'SLA Breached',
      sublabel: ticket.sla.breachedAt
        ? `Breached ${formatDistanceToNow(new Date(ticket.sla.breachedAt), { addSuffix: true })}`
        : null,
      color: 'text-red-600', badge: 'bg-red-100 text-red-700 border-red-300', severity: 3,
    };
  }
  if (isPast(due)) {
    return {
      label: 'SLA Overdue',
      sublabel: `Overdue by ${formatDistanceToNow(due)}`,
      color: 'text-red-500', badge: 'bg-red-100 text-red-600 border-red-200', severity: 3,
    };
  }
  const msLeft = due - now;
  if (msLeft < 2 * 60 * 60 * 1000) {
    return {
      label: 'SLA Critical',
      sublabel: `Due ${formatDistanceToNow(due, { addSuffix: true })}`,
      color: 'text-orange-500', badge: 'bg-orange-100 text-orange-600 border-orange-200', severity: 2,
    };
  }
  if (msLeft < 24 * 60 * 60 * 1000) {
    return {
      label: 'SLA At Risk',
      sublabel: `Due ${formatDistanceToNow(due, { addSuffix: true })}`,
      color: 'text-yellow-600', badge: 'bg-yellow-100 text-yellow-700 border-yellow-200', severity: 1,
    };
  }
  return {
    label: `Due ${formatDistanceToNow(due, { addSuffix: true })}`,
    color: 'text-slate-500', badge: 'bg-slate-100 text-slate-500 border-slate-200', severity: 0,
  };
};

const computeLiveSLABreached = (tickets) =>
  tickets.filter((t) => {
    if (TERMINAL.includes(t.status)) return false;
    if (t.sla?.isBreached) return true;
    if (t.sla?.dueDate && isPast(new Date(t.sla.dueDate))) return true;
    return false;
  }).length;

// ── Pure helper — stable reference outside component ──────────────────────────
function buildAgentPerf(topAgents) {
  return topAgents.map(a => ({
    agentName:     a.name,
    department:    a.department || '—',
    // Math.max guards against negative values caused by prior reassign bugs
    // where decrement ran on tickets that were never properly incremented.
    totalResolved: Math.max(0, a.performanceMetrics?.totalTicketsResolved ?? 0),
    totalAssigned: Math.max(0, a.performanceMetrics?.totalTicketsAssigned ?? 0),
    avgTime:       Number(a.performanceMetrics?.averageResolutionTime ?? 0).toFixed(1),
    rating:        a.performanceMetrics?.rating ?? 0,
  }));
}

// ── SLA Badge ─────────────────────────────────────────────────────────────────
const SLABadge = ({ ticket, tick }) => {
  void tick; // consumed only to trigger re-render on each 30s interval
  const sla = getSLAState(ticket);
  if (!sla) return <span className="text-xs text-slate-300">—</span>;
  return (
    <div>
      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${sla.badge}`}>
        {sla.severity >= 3 && <AlertTriangle size={9} />}
        {sla.label}
      </span>
      {sla.sublabel && <p className={`text-xs mt-0.5 ${sla.color}`}>{sla.sublabel}</p>}
    </div>
  );
};

// ── Chart Tooltip (outside component — stable reference for Recharts) ─────────
const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-xs">
      {label && <p className="font-semibold text-slate-700 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.value}
        </p>
      ))}
    </div>
  );
};

// ── Skeleton ──────────────────────────────────────────────────────────────────
const Skeleton = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200 rounded ${className}`} />
);

// ── Stat Card ─────────────────────────────────────────────────────────────────
const StatCard = ({ label, value, sub, color = 'text-slate-700', bg = 'bg-slate-50 border-slate-200' }) => (
  <div className={`rounded-xl border p-4 ${bg}`}>
    <p className={`text-2xl font-bold ${color}`}>{value ?? '—'}</p>
    <p className="text-xs font-medium text-slate-500 mt-1">{label}</p>
    {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
  </div>
);

// ── Helpers ───────────────────────────────────────────────────────────────────
const getWeekBucket = (date) => {
  const day = date.getDate();
  if (day <= 0) return 'W1';
  return `W${Math.min(4, Math.ceil(day / 7))}`;
};

const formatAvgTime = (raw) => {
  const n = Number(raw);
  if (!raw && raw !== 0) return '—';
  if (isNaN(n)) return '—';
  return `${n.toFixed(1)}h`;
};

// ── Main Component ────────────────────────────────────────────────────────────
const AdminAnalyticsPage = () => {
  const { token } = useAuth();

  const [overview, setOverview]               = useState(null);
  const [users, setUsers]                     = useState(null);
  const [statusData, setStatusData]           = useState([]);
  const [categoryData, setCategoryData]       = useState([]);
  const [priorityData, setPriorityData]       = useState([]);
  const [agentPerf, setAgentPerf]             = useState([]);
  const [weeklyData, setWeeklyData]           = useState([]);
  const [recentTickets, setRecentTickets]     = useState([]);
  const [loading, setLoading]                 = useState(true);
  const [refreshing, setRefreshing]           = useState(false);
  const [agentRefreshing, setAgentRefreshing] = useState(false);
  const [trendRefreshing, setTrendRefreshing] = useState(false); // ✅ separate trend loading state
  const [lastSyncAt, setLastSyncAt]           = useState(null);
  const [agentSyncAt, setAgentSyncAt]         = useState(null);
  const [tick, setTick]                       = useState(0);
  const pollRef                               = useRef(null);
  const agentPollRef                          = useRef(null);
  const trendPollRef                          = useRef(null);   // ✅ dedicated trend poll ref
  const slaRef                                = useRef(null);

  // liveSLABreached: derived immediately from recentTickets + re-evaluated on each 30s tick
  const liveSLABreached = useMemo(
    () => computeLiveSLABreached(recentTickets),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [recentTickets, tick],
  );

  // ── Full analytics fetch (every 5 min) ───────────────────────────────────
  const fetchAnalytics = useCallback(async (silent = false) => {
    if (!token) return;
    silent ? setRefreshing(true) : setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/dashboard/superadmin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();

      setOverview(data.overview ?? {});
      setUsers(data.users ?? {});

      const ov = data.overview ?? {};
      setStatusData([
        { name: 'Open',        count: ov.openTickets       ?? 0 },
        { name: 'In Progress', count: ov.inProgressTickets ?? 0 },
        { name: 'Resolved',    count: ov.resolvedTickets   ?? 0 },
        { name: 'Overdue',     count: ov.overdueTickets    ?? 0 },
      ].filter(s => s.count > 0));

      setCategoryData((data.ticketsByCategory ?? []).map(c => ({ name: c._id || 'Unknown', count: c.count })));
      setPriorityData((data.ticketsByPriority ?? []).map(p => ({ name: p._id || 'Unknown', count: p.count })));

      setAgentPerf(buildAgentPerf(data.topAgents ?? []));
      setAgentSyncAt(new Date());

      const tickets = Array.isArray(data.recentTickets) ? data.recentTickets : [];
      setRecentTickets(tickets);

      // ✅ Weekly trend is now fetched separately via fetchMonthlyTrend()
      // so it uses ALL tickets this month, not just the recent N from this endpoint.
      setLastSyncAt(new Date());
    } catch (err) {
      console.error('Analytics fetch error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token]);

  // ── Agent-only fast poll (every 60 s) ────────────────────────────────────
  // Lightweight re-fetch so Assigned/Resolved counts update within ~60s after
  // any reassignment — without waiting for the full 5-minute cycle.
  const fetchAgentMetrics = useCallback(async () => {
    if (!token) return;
    setAgentRefreshing(true);
    try {
      const res = await fetch(`${BASE_URL}/api/dashboard/superadmin`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return;
      const data = await res.json();
      setAgentPerf(buildAgentPerf(data.topAgents ?? []));
      setAgentSyncAt(new Date());
    } catch (err) {
      console.error('Agent metrics fetch error:', err);
    } finally {
      setAgentRefreshing(false);
    }
  }, [token]);

  // ── Monthly trend fetch — uses ALL tickets, not just recentTickets ──────────
  // recentTickets is only the last ~10 records, so bucketing it gives a heavily
  // skewed chart (flat W1–W3, spike at W4). This fetch hits /api/tickets with
  // a current-month date filter to get the full picture.
  const fetchMonthlyTrend = useCallback(async () => {
    if (!token) return;
    setTrendRefreshing(true);
    try {
      const now   = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const end   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

      const res = await fetch(
        `${BASE_URL}/api/tickets?startDate=${start}&endDate=${end}&limit=1000`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) return;

      const data    = await res.json();
      // Backend may return array directly or { tickets: [...] }
      const allTickets = Array.isArray(data) ? data : (data.tickets ?? []);

      const buckets = {
        W1: { created: 0, resolved: 0 },
        W2: { created: 0, resolved: 0 },
        W3: { created: 0, resolved: 0 },
        W4: { created: 0, resolved: 0 },
      };

      allTickets.forEach(t => {
        // Count created this month
        if (t.createdAt) {
          const d = new Date(t.createdAt);
          if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
            buckets[getWeekBucket(d)].created++;
          }
        }
        // Count resolved this month
        if (t.status === 'Resolved' && t.resolution?.resolvedAt) {
          const d = new Date(t.resolution.resolvedAt);
          if (d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()) {
            buckets[getWeekBucket(d)].resolved++;
          }
        }
      });

      setWeeklyData(Object.entries(buckets).map(([week, v]) => ({ week, ...v })));
    } catch (err) {
      console.error('Monthly trend fetch error:', err);
    } finally {
      setTrendRefreshing(false);
    }
  }, [token]);
  useEffect(() => {
    fetchAnalytics();
    fetchMonthlyTrend();                                                         // ✅ initial trend load
    pollRef.current      = setInterval(() => fetchAnalytics(true), 5 * 60 * 1000);
    agentPollRef.current = setInterval(fetchAgentMetrics, 60 * 1000);
    trendPollRef.current = setInterval(fetchMonthlyTrend,  5 * 60 * 1000);      // ✅ re-fetch trend every 5 min
    return () => {
      clearInterval(pollRef.current);
      clearInterval(agentPollRef.current);
      clearInterval(trendPollRef.current);
    };
  }, [fetchAnalytics, fetchAgentMetrics, fetchMonthlyTrend]);

  // ── 30s SLA tick ─────────────────────────────────────────────────────────
  useEffect(() => {
    slaRef.current = setInterval(() => setTick(t => t + 1), 30_000);
    return () => clearInterval(slaRef.current);
  }, []);

  return (
    <DashboardLayout>
      {/* ── Header ── */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">System-wide performance insights</p>
        </div>
        <div className="flex items-center gap-3">
          {lastSyncAt && (
            <span className="text-xs text-muted-foreground">
              Synced {formatDistanceToNow(lastSyncAt, { addSuffix: true })}
            </span>
          )}
          <Button
            variant="outline" size="sm"
            onClick={() => { fetchAnalytics(true); fetchAgentMetrics(); fetchMonthlyTrend(); }}
            disabled={refreshing}
            className="gap-1.5 text-xs"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Overview Stat Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        {loading ? (
          [...Array(6)].map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-xl" />)
        ) : (
          <>
            <StatCard label="Total Tickets"  value={overview?.totalTickets}      color="text-slate-700"  bg="bg-slate-50 border-slate-200" />
            <StatCard label="Open"           value={overview?.openTickets}       color="text-blue-700"   bg="bg-blue-50 border-blue-200" />
            <StatCard label="In Progress"    value={overview?.inProgressTickets} color="text-purple-700" bg="bg-purple-50 border-purple-200" />
            <StatCard label="Resolved"       value={overview?.resolvedTickets}   color="text-green-700"  bg="bg-green-50 border-green-200" />
            <div className={`rounded-xl border p-4 transition-colors ${
              liveSLABreached > 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <ShieldAlert size={16} className={liveSLABreached > 0 ? 'text-red-500' : 'text-green-500'} />
              </div>
              <p className={`text-2xl font-bold ${liveSLABreached > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {liveSLABreached}
              </p>
              <p className="text-xs font-medium text-slate-500 mt-1">SLA Breached</p>
              <p className={`text-xs mt-0.5 font-medium ${liveSLABreached > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {liveSLABreached > 0 ? 'Needs attention' : 'All on track'}
              </p>
            </div>
            <StatCard
              label="Avg Resolution"
              value={formatAvgTime(overview?.avgResolutionTime)}
              color="text-amber-700"
              bg="bg-amber-50 border-amber-200"
            />
          </>
        )}
      </div>

      {/* ── Users Row ── */}
      {!loading && users && (
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Agents"  value={users.totalAgents}  color="text-indigo-700" bg="bg-indigo-50 border-indigo-200" />
          <StatCard label="Active Agents" value={users.activeAgents} color="text-green-700"  bg="bg-green-50 border-green-200" />
          <StatCard label="Total Users"   value={users.totalUsers}   color="text-slate-700"  bg="bg-slate-50 border-slate-200" />
        </div>
      )}

      {/* ── Charts Row 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Status Distribution</h3>
          {loading ? <Skeleton className="h-[280px] w-full" /> : statusData.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={statusData} dataKey="count" nameKey="name" cx="50%" cy="50%" outerRadius={100}
                     label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                  {statusData.map((entry, i) => (
                    <Cell key={i} fill={STATUS_COLORS[entry.name] ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Tickets by Category</h3>
          {loading ? <Skeleton className="h-[280px] w-full" /> : categoryData.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={categoryData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Tickets" fill="hsl(217, 91%, 60%)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* ── Weekly Trend ── */}
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground">Monthly Trend: Created vs Resolved</h3>
          {trendRefreshing && (
            <span className="flex items-center gap-1 text-xs font-medium text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
              <Activity size={10} className="animate-pulse" />
              Updating…
            </span>
          )}
        </div>
        {loading ? <Skeleton className="h-[300px] w-full" /> : weeklyData.every(d => d.created === 0 && d.resolved === 0) ? (
          <div className="h-[300px] flex items-center justify-center text-sm text-muted-foreground">No ticket activity this month</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={weeklyData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Area type="monotone" dataKey="created"  name="Created"  stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.1} strokeWidth={2} />
              <Area type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" fill="#10b981" fillOpacity={0.1} strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </motion.div>

      {/* ── Charts Row 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Tickets by Priority</h3>
          {loading ? <Skeleton className="h-[280px] w-full" /> : priorityData.length === 0 ? (
            <div className="h-[280px] flex items-center justify-center text-sm text-muted-foreground">No data</div>
          ) : (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={priorityData} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="count" name="Tickets" radius={[6, 6, 0, 0]}>
                  {priorityData.map((entry, i) => (
                    <Cell key={i} fill={
                      entry.name === 'Critical' ? '#ef4444' :
                      entry.name === 'High'     ? '#f97316' :
                      entry.name === 'Medium'   ? '#f59e0b' : '#10b981'
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5">
          <h3 className="font-semibold text-foreground mb-4">Top Agent Performance</h3>
          {loading ? <Skeleton className="h-[340px] w-full" /> : agentPerf.length === 0 ? (
            <div className="h-[340px] flex items-center justify-center text-sm text-muted-foreground">No agents found</div>
          ) : (
            // ✅ Fix 1: increased height 280→340 so bars aren't compressed by label space
            <ResponsiveContainer width="100%" height={340}>
              {/* ✅ Fix 2: bottom margin increased to 70 to give angled labels room */}
              <BarChart data={agentPerf} margin={{ top: 5, right: 15, left: -10, bottom: 70 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                {/*
                  ✅ Fix 3: angle −45° is the standard readable angle for long labels.
                  ✅ Fix 4: textAnchor="end" is correct for negative angles (right-edge anchors under the tick).
                  ✅ Fix 5: removed interval={0} — Recharts will auto-skip overlapping labels
                            instead of forcing all of them to render and collide.
                  ✅ Fix 6: height={70} on XAxis reserves explicit space matching the bottom margin,
                            preventing labels from being clipped by the SVG viewport.
                */}
                <XAxis
                  dataKey="agentName"
                  tick={{ fontSize: 11 }}
                  angle={-45}
                  textAnchor="end"
                  height={70}
                />
                {/* ✅ Fix negative bars: clamp Y-axis floor to 0 */}
                <YAxis tick={{ fontSize: 11 }} allowDecimals={false} domain={[0, 'auto']} />
                <Tooltip content={<ChartTooltip />} />
                <Legend verticalAlign="top" />
                <Bar dataKey="totalResolved" name="Resolved" fill="#10b981" radius={[6, 6, 0, 0]} />
                <Bar dataKey="totalAssigned" name="Assigned" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </motion.div>
      </div>

      {/* ── Recent Tickets with Live SLA ── */}
      {!loading && recentTickets.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5 mt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="font-semibold text-foreground">Recent Tickets</h3>
              {liveSLABreached > 0 && (
                <span className="flex items-center gap-1 text-xs font-medium text-red-600 bg-red-100 border border-red-200 px-2 py-0.5 rounded-full">
                  <AlertTriangle size={10} />
                  {liveSLABreached} SLA issue{liveSLABreached > 1 ? 's' : ''}
                </span>
              )}
            </div>
            <span className="text-xs text-muted-foreground">Live SLA status — updates every 30s</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Ticket', 'Title', 'Reporter', 'Status', 'Priority', 'Assigned To', 'SLA'].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recentTickets.map((ticket, i) => {
                  const sla = getSLAState(ticket);
                  const rowAlert = sla?.severity >= 2;
                  return (
                    <tr key={ticket._id || i} className={`border-b border-border/50 transition-colors ${
                      rowAlert ? 'bg-red-50/40 hover:bg-red-50/70' : 'hover:bg-secondary/30'
                    }`}>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1">
                          {rowAlert && <AlertTriangle size={10} className="text-red-500 flex-shrink-0" />}
                          <span className="font-mono text-xs text-primary">{ticket.ticketNumber}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 max-w-[160px] truncate text-foreground">{ticket.title}</td>
                      <td className="py-3 px-3 text-xs text-muted-foreground">{ticket.createdBy?.name || '—'}</td>
                      <td className="py-3 px-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                          ticket.status === 'Open'        ? 'text-blue-600 bg-blue-50 border-blue-200' :
                          ticket.status === 'In Progress' ? 'text-purple-600 bg-purple-50 border-purple-200' :
                          ticket.status === 'Resolved'    ? 'text-green-600 bg-green-50 border-green-200' :
                          ticket.status === 'Reopened'    ? 'text-amber-600 bg-amber-50 border-amber-200' :
                                                            'text-gray-500 bg-gray-50 border-gray-200'
                        }`}>{ticket.status}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                          ticket.priority === 'Critical' ? 'text-red-500 bg-red-50 border-red-200' :
                          ticket.priority === 'High'     ? 'text-orange-500 bg-orange-50 border-orange-200' :
                          ticket.priority === 'Medium'   ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
                                                           'text-green-600 bg-green-50 border-green-200'
                        }`}>{ticket.priority}</span>
                      </td>
                      <td className="py-3 px-3 text-xs text-muted-foreground">
                        {ticket.assignedTo?.name || <span className="italic text-slate-300">Unassigned</span>}
                      </td>
                      <td className="py-3 px-3"><SLABadge ticket={ticket} tick={tick} /></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {/* ── Agent Performance Detail Table ── */}
      {!loading && agentPerf.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass-card rounded-xl p-5 mt-6">
          {/* Header with live sync indicator */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Agent Performance Detail</h3>
            <div className="flex items-center gap-2">
              {agentSyncAt && (
                <span className="text-xs text-muted-foreground">
                  Updated {formatDistanceToNow(agentSyncAt, { addSuffix: true })}
                </span>
              )}
              {/* Live status pill — pulses amber while fetching, green when idle */}
              <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${
                agentRefreshing
                  ? 'text-amber-600 bg-amber-50 border-amber-200'
                  : 'text-green-600 bg-green-50 border-green-200'
              }`}>
                <Activity size={10} className={agentRefreshing ? 'animate-pulse' : ''} />
                {agentRefreshing ? 'Updating…' : 'Live · 60s'}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  {['Agent', 'Department', 'Assigned', 'Resolved', 'Avg Time', 'Rating'].map(h => (
                    <th key={h} className="text-left py-3 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {agentPerf.map((a, i) => (
                  <tr key={i} className="border-b border-border/50 hover:bg-secondary/30 transition-colors">
                    <td className="py-3 px-3 font-medium text-foreground">{a.agentName}</td>
                    <td className="py-3 px-3 text-muted-foreground text-xs">{a.department}</td>
                    <td className="py-3 px-3 text-blue-600 font-semibold">{a.totalAssigned}</td>
                    <td className="py-3 px-3 text-green-600 font-semibold">{a.totalResolved}</td>
                    <td className="py-3 px-3 text-amber-600">{a.avgTime}h</td>
                    <td className="py-3 px-3">
                      <span className="text-xs">{a.rating > 0 ? `⭐ ${a.rating}/5` : '—'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </DashboardLayout>
  );
};

export default AdminAnalyticsPage;