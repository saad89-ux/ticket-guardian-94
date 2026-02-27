import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  FileText, 
  Ticket, 
  User, 
  RefreshCw, 
  Loader2, 
  AlertCircle,
  Filter,
  X,
  LogOut,
  LogIn,
  AlertTriangle,
  Download,
  Search
} from 'lucide-react';

// ============================================
// TYPES
// ============================================
interface AuditLog {
  _id: string;
  action: string;
  performedBy: {
    _id: string;
    name: string;
    email: string;
    role: string;
  } | null;
  targetTicket?: {
    _id: string;
    ticketNumber: string;
    title: string;
  } | null;
  targetUser?: {
    _id: string;
    name: string;
    email: string;
  } | null;
  details?: any;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// CONSTANTS
// ============================================
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001';

const actionIcons: Record<string, React.ReactNode> = {
  TICKET_CREATED: <Ticket size={14} className="text-status-open" />,
  TICKET_UPDATED: <Ticket size={14} className="text-blue-500" />,
  TICKET_ASSIGNED: <User size={14} className="text-status-progress" />,
  TICKET_STATUS_CHANGED: <RefreshCw size={14} className="text-warning" />,
  TICKET_RESOLVED: <Ticket size={14} className="text-status-resolved" />,
  TICKET_DELETED: <Ticket size={14} className="text-destructive" />,
  AGENT_CREATED: <User size={14} className="text-green-500" />,
  AGENT_DEACTIVATED: <User size={14} className="text-destructive" />,
  USER_LOGIN: <LogIn size={14} className="text-primary" />,
  USER_LOGOUT: <LogOut size={14} className="text-muted-foreground" />,
  SYSTEM_ACTION: <FileText size={14} className="text-primary" />,
  SLA_BREACH: <AlertTriangle size={14} className="text-destructive" />,
};

const ACTION_LABELS: Record<string, string> = {
  TICKET_CREATED: 'Ticket Created',
  TICKET_UPDATED: 'Ticket Updated',
  TICKET_ASSIGNED: 'Ticket Assigned',
  TICKET_STATUS_CHANGED: 'Status Changed',
  TICKET_RESOLVED: 'Ticket Resolved',
  TICKET_DELETED: 'Ticket Deleted',
  AGENT_CREATED: 'Agent Created',
  AGENT_DEACTIVATED: 'Agent Deactivated',
  USER_LOGIN: 'User Login',
  USER_LOGOUT: 'User Logout',
  SYSTEM_ACTION: 'System Action',
  SLA_BREACH: 'SLA Breached',
};

const ACTION_COLORS: Record<string, string> = {
  TICKET_CREATED: 'bg-blue-500/10 text-blue-500',
  TICKET_UPDATED: 'bg-cyan-500/10 text-cyan-500',
  TICKET_ASSIGNED: 'bg-purple-500/10 text-purple-500',
  TICKET_STATUS_CHANGED: 'bg-yellow-500/10 text-yellow-500',
  TICKET_RESOLVED: 'bg-green-500/10 text-green-500',
  TICKET_DELETED: 'bg-red-500/10 text-red-500',
  AGENT_CREATED: 'bg-emerald-500/10 text-emerald-500',
  AGENT_DEACTIVATED: 'bg-orange-500/10 text-orange-500',
  USER_LOGIN: 'bg-indigo-500/10 text-indigo-500',
  USER_LOGOUT: 'bg-gray-500/10 text-gray-500',
  SYSTEM_ACTION: 'bg-violet-500/10 text-violet-500',
  SLA_BREACH: 'bg-red-600/10 text-red-600',
};

// ============================================
// MAIN COMPONENT
// ============================================
const AuditLogsPage = () => {
  const { token } = useAuth();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    action: '',
    userId: '',
    ticketId: '',
    limit: 50,
    search: ''
  });
  const [showFilters, setShowFilters] = useState(false);
  const [stats, setStats] = useState({
    totalLogs: 0,
    todayLogs: 0,
    criticalActions: 0,
    slaBreaches: 0
  });

  // ============================================
  // FETCH AUDIT LOGS
  // ============================================
  const fetchAuditLogs = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      // Build query string
      const params = new URLSearchParams();
      if (filters.action) params.append('action', filters.action);
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.ticketId) params.append('ticketId', filters.ticketId);
      params.append('limit', filters.limit.toString());

      const response = await fetch(
        `${BASE_URL}/api/dashboard/audit-logs?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch audit logs: ${response.statusText}`);
      }

      const data = await response.json();
      const logsArray = Array.isArray(data) ? data : [];
      setLogs(logsArray);

      // Calculate stats
      calculateStats(logsArray);
    } catch (err: any) {
      console.error('Error fetching audit logs:', err);
      setError(err.message || 'Failed to load audit logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================
  // CALCULATE STATS
  // ============================================
  const calculateStats = (logsData: AuditLog[]) => {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const todayLogs = logsData.filter(
      log => new Date(log.createdAt) >= todayStart
    ).length;

    const criticalActions = logsData.filter(
      log => ['TICKET_DELETED', 'AGENT_DEACTIVATED', 'SLA_BREACH'].includes(log.action)
    ).length;

    const slaBreaches = logsData.filter(
      log => log.action === 'SLA_BREACH' || 
             (log.details && log.details.slaBreached)
    ).length;

    setStats({
      totalLogs: logsData.length,
      todayLogs,
      criticalActions,
      slaBreaches
    });
  };

  // ============================================
  // EFFECTS
  // ============================================
  useEffect(() => {
    fetchAuditLogs();
  }, [token, filters.action, filters.userId, filters.ticketId, filters.limit]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchAuditLogs();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loading, filters]);

  // ============================================
  // HANDLERS
  // ============================================
  const handleClearFilters = () => {
    setFilters({
      action: '',
      userId: '',
      ticketId: '',
      limit: 50,
      search: ''
    });
  };

  const handleExportLogs = () => {
    if (logs.length === 0) return;

    const csvContent = [
      ['Timestamp', 'Action', 'Performed By', 'Role', 'Target', 'Details', 'IP Address'].join(','),
      ...logs.map(log => [
        format(new Date(log.createdAt), 'yyyy-MM-dd HH:mm:ss'),
        log.action,
        log.performedBy?.name || 'Unknown',
        log.performedBy?.role || 'N/A',
        log.targetTicket?.ticketNumber || log.targetUser?.email || 'N/A',
        renderLogDetails(log).replace(/,/g, ';'),
        log.ipAddress || 'N/A'
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const hasActiveFilters = filters.action || filters.userId || filters.ticketId || filters.search;

  // ============================================
  // FILTER LOGS BY SEARCH
  // ============================================
  const filteredLogs = logs.filter(log => {
    if (!filters.search) return true;
    
    const searchLower = filters.search.toLowerCase();
    return (
      log.performedBy?.name.toLowerCase().includes(searchLower) ||
      log.performedBy?.email.toLowerCase().includes(searchLower) ||
      log.targetTicket?.ticketNumber.toLowerCase().includes(searchLower) ||
      log.targetTicket?.title?.toLowerCase().includes(searchLower) ||
      log.action.toLowerCase().includes(searchLower)
    );
  });

  // ============================================
  // RENDER HELPERS
  // ============================================
  const renderLogDetails = (log: AuditLog) => {
    let detailText = '';

    switch (log.action) {
      case 'TICKET_CREATED':
        detailText = `created ticket ${log.targetTicket?.ticketNumber || 'N/A'}`;
        if (log.targetTicket?.title) {
          detailText += `: "${log.targetTicket.title}"`;
        }
        if (log.details?.category) {
          detailText += ` in ${log.details.category}`;
        }
        if (log.details?.priority) {
          detailText += ` with ${log.details.priority} priority`;
        }
        break;

      case 'TICKET_ASSIGNED':
        detailText = `assigned ticket ${log.targetTicket?.ticketNumber || 'N/A'}`;
        if (log.targetUser) {
          detailText += ` to ${log.targetUser.name}`;
        } else if (log.details?.assignedTo) {
          detailText += ` to agent`;
        }
        break;

      case 'TICKET_RESOLVED':
        detailText = `resolved ticket ${log.targetTicket?.ticketNumber || 'N/A'}`;
        if (log.details?.resolutionTime) {
          detailText += ` in ${log.details.resolutionTime}`;
        }
        break;

      case 'TICKET_STATUS_CHANGED':
        detailText = `changed status of ticket ${log.targetTicket?.ticketNumber || 'N/A'}`;
        if (log.details?.from && log.details?.to) {
          detailText += ` from "${log.details.from}" to "${log.details.to}"`;
        }
        if (log.details?.reason) {
          detailText += ` - ${log.details.reason}`;
        }
        break;

      case 'TICKET_UPDATED':
        detailText = `updated ticket ${log.targetTicket?.ticketNumber || 'N/A'}`;
        if (log.details?.fields && Array.isArray(log.details.fields)) {
          detailText += ` (${log.details.fields.join(', ')})`;
        }
        break;

      case 'TICKET_DELETED':
        detailText = `deleted ticket ${log.targetTicket?.ticketNumber || 'N/A'}`;
        if (log.details?.reason) {
          detailText += ` - Reason: ${log.details.reason}`;
        }
        break;

      case 'AGENT_CREATED':
        detailText = `created agent ${log.targetUser?.name || 'N/A'}`;
        if (log.targetUser?.email) {
          detailText += ` (${log.targetUser.email})`;
        }
        if (log.details?.department) {
          detailText += ` in ${log.details.department} department`;
        }
        break;

      case 'AGENT_DEACTIVATED':
        detailText = `deactivated agent ${log.targetUser?.name || 'N/A'}`;
        if (log.details?.reason) {
          detailText += ` - ${log.details.reason}`;
        }
        break;

      case 'USER_LOGIN':
        detailText = 'logged into the system';
        if (log.ipAddress) {
          detailText += ` from ${log.ipAddress}`;
        }
        break;

      case 'USER_LOGOUT':
        detailText = 'logged out of the system';
        break;

      case 'SLA_BREACH':
        detailText = `SLA breached for ticket ${log.targetTicket?.ticketNumber || 'N/A'}`;
        if (log.details?.breachTime) {
          detailText += ` at ${log.details.breachTime}`;
        }
        break;

      case 'SYSTEM_ACTION':
        detailText = log.details?.message || 'performed a system action';
        break;

      default:
        detailText = log.details?.message || 'performed an action';
    }

    return detailText;
  };

  const getActionColor = (action: string) => {
    return ACTION_COLORS[action] || 'bg-secondary text-muted-foreground';
  };

  // ============================================
  // RENDER
  // ============================================
  return (
    <DashboardLayout>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
            <p className="text-muted-foreground">Complete system activity trail and security monitoring</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-4 py-2 rounded-lg flex items-center gap-2 transition-colors ${
                showFilters
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-foreground hover:bg-secondary/80'
              }`}
            >
              <Filter size={16} />
              Filters
            </button>
            <button
              onClick={handleExportLogs}
              disabled={logs.length === 0}
              className="px-4 py-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <Download size={16} />
              Export
            </button>
            <button
              onClick={fetchAuditLogs}
              disabled={loading}
              className="px-4 py-2 rounded-lg bg-secondary text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Logs</p>
                <p className="text-2xl font-bold text-foreground">{stats.totalLogs}</p>
              </div>
              <FileText className="text-primary" size={24} />
            </div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Today's Activity</p>
                <p className="text-2xl font-bold text-foreground">{stats.todayLogs}</p>
              </div>
              <Ticket className="text-blue-500" size={24} />
            </div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Critical Actions</p>
                <p className="text-2xl font-bold text-foreground">{stats.criticalActions}</p>
              </div>
              <AlertCircle className="text-orange-500" size={24} />
            </div>
          </div>
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">SLA Breaches</p>
                <p className="text-2xl font-bold text-destructive">{stats.slaBreaches}</p>
              </div>
              <AlertTriangle className="text-destructive" size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search by user name, email, ticket number, or action..."
            className="w-full pl-10 pr-4 py-3 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card rounded-xl p-4 mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-foreground">Advanced Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={handleClearFilters}
                className="text-sm text-primary hover:underline flex items-center gap-1"
              >
                <X size={14} />
                Clear all
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Action Type</label>
              <select
                value={filters.action}
                onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">All Actions</option>
                {Object.entries(ACTION_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">User ID</label>
              <input
                type="text"
                value={filters.userId}
                onChange={(e) => setFilters({ ...filters, userId: e.target.value })}
                placeholder="Enter user ID"
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Ticket ID</label>
              <input
                type="text"
                value={filters.ticketId}
                onChange={(e) => setFilters({ ...filters, ticketId: e.target.value })}
                placeholder="Enter ticket ID"
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-foreground">Results Limit</label>
              <select
                value={filters.limit}
                onChange={(e) => setFilters({ ...filters, limit: parseInt(e.target.value) })}
                className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
                <option value="200">200</option>
                <option value="500">500</option>
              </select>
            </div>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {loading && logs.length === 0 && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="animate-spin text-primary mx-auto mb-4" size={32} />
            <p className="text-muted-foreground">Loading audit logs...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card rounded-xl p-6 flex items-center gap-3 text-destructive mb-6"
        >
          <AlertCircle size={24} />
          <div>
            <p className="font-semibold">Error Loading Audit Logs</p>
            <p className="text-sm">{error}</p>
          </div>
        </motion.div>
      )}

      {/* Empty State */}
      {!loading && !error && filteredLogs.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card rounded-xl p-12 text-center"
        >
          <FileText size={48} className="mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-lg font-semibold mb-2 text-foreground">No Audit Logs Found</h3>
          <p className="text-muted-foreground mb-4">
            {hasActiveFilters
              ? 'Try adjusting your filters or search terms to see more results.'
              : 'Audit logs will appear here as actions are performed in the system.'}
          </p>
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              Clear Filters
            </button>
          )}
        </motion.div>
      )}

      {/* Audit Logs List */}
      {!loading && !error && filteredLogs.length > 0 && (
        <>
          <div className="space-y-3">
            {filteredLogs.map((log, i) => (
              <motion.div
                key={log._id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.02, 0.3) }}
                className="glass-card rounded-xl p-4 flex items-start gap-4 hover:shadow-lg transition-all hover:scale-[1.01]"
              >
                {/* Icon */}
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  {actionIcons[log.action] || <FileText size={16} />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-sm font-semibold text-foreground">
                      {log.performedBy?.name || 'Unknown User'}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-md font-medium ${getActionColor(log.action)}`}>
                      {ACTION_LABELS[log.action] || log.action.replace(/_/g, ' ')}
                    </span>
                    {log.performedBy?.role && (
                      <span className="text-xs px-2 py-1 rounded-md bg-primary/10 text-primary font-medium">
                        {log.performedBy.role.toUpperCase()}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 leading-relaxed">
                    {renderLogDetails(log)}
                  </p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <span className="font-medium">
                        {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                      </span>
                      <span className="text-muted-foreground/60">•</span>
                      <span>{format(new Date(log.createdAt), 'MMM d, yyyy h:mm a')}</span>
                    </span>
                    {log.ipAddress && (
                      <>
                        <span className="text-muted-foreground/60">•</span>
                        <span className="font-mono">IP: {log.ipAddress}</span>
                      </>
                    )}
                    {log.performedBy?.email && (
                      <>
                        <span className="text-muted-foreground/60">•</span>
                        <span>{log.performedBy.email}</span>
                      </>
                    )}
                  </div>
                </div>

                {/* Target ID */}
                {(log.targetTicket || log.targetUser) && (
                  <div className="text-right shrink-0">
                    {log.targetTicket && (
                      <div className="text-xs font-mono bg-primary/10 text-primary px-2 py-1 rounded">
                        {log.targetTicket.ticketNumber}
                      </div>
                    )}
                    {log.targetUser && !log.targetTicket && (
                      <div className="text-xs text-muted-foreground">
                        {log.targetUser.email}
                      </div>
                    )}
                  </div>
                )}
              </motion.div>
            ))}
          </div>

          {/* Results Count & Pagination Info */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredLogs.length}</span> of{' '}
              <span className="font-semibold text-foreground">{logs.length}</span>{' '}
              {logs.length === 1 ? 'log' : 'logs'}
              {logs.length === filters.limit && ' (limit reached)'}
            </p>
            {filters.search && filteredLogs.length < logs.length && (
              <p className="text-xs text-muted-foreground mt-1">
                Filtered by search term
              </p>
            )}
          </div>
        </>
      )}
    </DashboardLayout>
  );
};

export default AuditLogsPage;