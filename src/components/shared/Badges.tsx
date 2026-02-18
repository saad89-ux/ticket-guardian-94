import { TicketStatus, TicketPriority, TicketCategory } from '@/lib/types';
import { AlertCircle, Clock, CheckCircle, XCircle, RotateCcw, LucideIcon } from 'lucide-react';

interface StatusConfig {
  label: string;
  icon: LucideIcon;
  className: string;
}

const statusMap: Record<TicketStatus, StatusConfig> = {
  Open: { label: 'Open', icon: AlertCircle, className: 'bg-status-open-bg text-status-open' },
  'In Progress': { label: 'In Progress', icon: Clock, className: 'bg-status-progress-bg text-status-progress' },
  Resolved: { label: 'Resolved', icon: CheckCircle, className: 'bg-status-resolved-bg text-status-resolved' },
  Closed: { label: 'Closed', icon: XCircle, className: 'bg-status-closed-bg text-status-closed' },
  Reopened: { label: 'Reopened', icon: RotateCcw, className: 'bg-status-reopened-bg text-status-reopened' },
};

export const StatusBadge = ({ status }: { status: TicketStatus }) => {
  const config = statusMap[status];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${config.className}`}>
      <Icon size={14} />
      {config.label}
    </span>
  );
};

const priorityMap: Record<TicketPriority, string> = {
  Low: 'bg-priority-low-bg text-priority-low',
  Medium: 'bg-priority-medium-bg text-priority-medium',
  High: 'bg-priority-high-bg text-priority-high',
  Critical: 'bg-priority-critical-bg text-priority-critical',
};

export const PriorityBadge = ({ priority }: { priority: TicketPriority }) => (
  <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${priorityMap[priority]}`}>
    {priority}
  </span>
);

const categoryIcons: Record<TicketCategory, string> = {
  Technical: '🔧',
  Billing: '💳',
  General: '📋',
  Sales: '📈',
  Product: '📦',
};

export const CategoryBadge = ({ category }: { category: TicketCategory }) => (
  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-secondary text-secondary-foreground">
    {categoryIcons[category]} {category}
  </span>
);
