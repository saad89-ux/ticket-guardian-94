export type UserRole = 'user' | 'agent' | 'superadmin';

export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed' | 'Reopened';
export type TicketPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type TicketCategory = 'Technical' | 'Billing' | 'General' | 'Sales' | 'Product';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department?: string;
  isActive?: boolean;
  createdAt: string;
}

export interface TicketNote {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string;
}

export interface Ticket {
  id: string;
  ticketNumber: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  createdBy: string;
  createdByName: string;
  assignedTo?: string;
  assignedToName?: string;
  notes: TicketNote[];
  resolutionSummary?: string;
  attachments: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed?: number;
  reopened?: number;
  overdue?: number;
}

export interface AgentPerformance {
  agentId: string;
  agentName: string;
  department: string;
  totalAssigned: number;
  totalResolved: number;
  avgResolutionTime: number;
  rating: number;
}

export interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  performedByName: string;
  targetType: string;
  targetId: string;
  details: string;
  createdAt: string;
}
