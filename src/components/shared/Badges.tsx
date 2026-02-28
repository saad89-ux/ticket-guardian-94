import { AppointmentStatus, RiskLevel } from '@/lib/types';
import { Clock, CheckCircle, XCircle, AlertCircle, AlertTriangle } from 'lucide-react';

const statusConfig: Record<AppointmentStatus, { color: string; bg: string; Icon: React.ElementType }> = {
  Pending: { color: 'text-amber-700', bg: 'bg-amber-100', Icon: Clock },
  Confirmed: { color: 'text-blue-700', bg: 'bg-blue-100', Icon: AlertCircle },
  Completed: { color: 'text-emerald-700', bg: 'bg-emerald-100', Icon: CheckCircle },
  Cancelled: { color: 'text-red-700', bg: 'bg-red-100', Icon: XCircle },
};

export const StatusBadge = ({ status }: { status: AppointmentStatus }) => {
  const c = statusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.color}`}>
      <c.Icon size={14} />
      {status}
    </span>
  );
};

const riskConfig: Record<RiskLevel, { color: string; bg: string }> = {
  Low: { color: 'text-emerald-700', bg: 'bg-emerald-100' },
  Medium: { color: 'text-amber-700', bg: 'bg-amber-100' },
  High: { color: 'text-orange-700', bg: 'bg-orange-100' },
  Critical: { color: 'text-red-700', bg: 'bg-red-100' },
};

export const RiskBadge = ({ level }: { level: RiskLevel }) => {
  const c = riskConfig[level];
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${c.bg} ${c.color}`}>
      <AlertTriangle size={14} />
      {level}
    </span>
  );
};

export const RoleBadge = ({ role }: { role: string }) => {
  const map: Record<string, string> = {
    admin: 'bg-purple-100 text-purple-700',
    doctor: 'bg-blue-100 text-blue-700',
    receptionist: 'bg-teal-100 text-teal-700',
    patient: 'bg-green-100 text-green-700',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${map[role] || 'bg-gray-100 text-gray-700'}`}>
      {role}
    </span>
  );
};
