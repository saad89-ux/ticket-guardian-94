import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { mockAuditLogs } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { FileText, Ticket, User, RefreshCw } from 'lucide-react';

const actionIcons: Record<string, React.ReactNode> = {
  TICKET_CREATED: <Ticket size={14} className="text-status-open" />,
  TICKET_ASSIGNED: <User size={14} className="text-status-progress" />,
  TICKET_RESOLVED: <Ticket size={14} className="text-status-resolved" />,
  TICKET_NOTE_ADDED: <FileText size={14} className="text-primary" />,
  AGENT_CREATED: <User size={14} className="text-status-resolved" />,
  AGENT_DEACTIVATED: <User size={14} className="text-destructive" />,
  TICKET_REASSIGNED: <RefreshCw size={14} className="text-warning" />,
};

const AuditLogsPage = () => {
  return (
    <DashboardLayout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-foreground">Audit Logs</h1>
        <p className="text-muted-foreground">Complete system activity trail</p>
      </div>

      <div className="space-y-3">
        {mockAuditLogs.map((log, i) => (
          <motion.div
            key={log.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-card rounded-xl p-4 flex items-start gap-4"
          >
            <div className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center shrink-0 mt-0.5">
              {actionIcons[log.action] || <FileText size={14} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-medium text-foreground">{log.performedByName}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-secondary text-muted-foreground font-mono">{log.action.replace(/_/g, ' ')}</span>
              </div>
              <p className="text-sm text-muted-foreground">{log.details}</p>
              <p className="text-xs text-muted-foreground mt-1">{format(new Date(log.createdAt), 'MMM d, yyyy h:mm a')}</p>
            </div>
            <span className="text-xs font-mono text-primary shrink-0">{log.targetId}</span>
          </motion.div>
        ))}
      </div>
    </DashboardLayout>
  );
};

export default AuditLogsPage;
