import { Ticket, User, AgentPerformance, AuditLog, TicketStatus, TicketPriority, TicketCategory } from './types';

export const mockUsers: User[] = [
  { id: 'u1', name: 'John Carter', email: 'john@example.com', role: 'user', createdAt: '2024-01-15' },
  { id: 'u2', name: 'Sarah Miller', email: 'sarah@example.com', role: 'user', createdAt: '2024-02-10' },
  { id: 'a1', name: 'Ahmed Khan', email: 'ahmed@support.com', role: 'agent', department: 'Technical', isActive: true, createdAt: '2024-01-01' },
  { id: 'a2', name: 'Sara Ali', email: 'sara@support.com', role: 'agent', department: 'Billing', isActive: true, createdAt: '2024-01-05' },
  { id: 'a3', name: 'James Wilson', email: 'james@support.com', role: 'agent', department: 'General', isActive: true, createdAt: '2024-01-10' },
  { id: 'a4', name: 'Maria Lopez', email: 'maria@support.com', role: 'agent', department: 'Technical', isActive: false, createdAt: '2024-02-01' },
  { id: 'sa1', name: 'Admin User', email: 'admin@support.com', role: 'superadmin', createdAt: '2023-12-01' },
];

const statuses: TicketStatus[] = ['Open', 'In Progress', 'Resolved', 'Closed', 'Reopened'];
const priorities: TicketPriority[] = ['Low', 'Medium', 'High', 'Critical'];
const categories: TicketCategory[] = ['Technical', 'Billing', 'General', 'Sales', 'Product'];

const titles = [
  'Cannot login to dashboard', 'Payment processing failed', 'Password reset not working',
  'Feature request: Dark mode', 'Invoice discrepancy', 'API rate limit exceeded',
  'Mobile app crashes on startup', 'Billing address update', 'Account deactivation request',
  'Integration webhook failing', 'SSL certificate expiring', 'Data export not working',
  'User permissions issue', 'Email notifications delayed', 'Search functionality broken',
  'Report generation timeout', 'Two-factor auth setup help', 'Subscription upgrade issue',
  'Custom domain configuration', 'Database connection timeout',
];

export const mockTickets: Ticket[] = Array.from({ length: 25 }, (_, i) => ({
  id: `t${i + 1}`,
  ticketNumber: `TKT-${String(i + 1).padStart(3, '0')}`,
  title: titles[i % titles.length],
  description: `Detailed description for ticket ${i + 1}. The user is experiencing issues that need to be investigated and resolved promptly.`,
  category: categories[i % categories.length],
  priority: priorities[i % priorities.length],
  status: statuses[i % statuses.length],
  createdBy: i % 2 === 0 ? 'u1' : 'u2',
  createdByName: i % 2 === 0 ? 'John Carter' : 'Sarah Miller',
  assignedTo: i % 5 < 3 ? `a${(i % 3) + 1}` : undefined,
  assignedToName: i % 5 < 3 ? ['Ahmed Khan', 'Sara Ali', 'James Wilson'][i % 3] : undefined,
  notes: i % 3 === 0 ? [
    { id: `n${i}`, content: 'Initial investigation started. Looking into the root cause.', authorId: 'a1', authorName: 'Ahmed Khan', createdAt: '2024-03-10T14:30:00Z' },
    { id: `n${i}b`, content: 'Found the issue. Working on a fix.', authorId: 'a1', authorName: 'Ahmed Khan', createdAt: '2024-03-11T09:15:00Z' },
  ] : [],
  resolutionSummary: statuses[i % statuses.length] === 'Resolved' ? 'Issue was resolved by applying the latest patch and clearing the cache.' : undefined,
  attachments: [],
  createdAt: new Date(2024, 2, i + 1).toISOString(),
  updatedAt: new Date(2024, 2, i + 2).toISOString(),
}));

export const mockAgentPerformance: AgentPerformance[] = [
  { agentId: 'a1', agentName: 'Ahmed Khan', department: 'Technical', totalAssigned: 45, totalResolved: 40, avgResolutionTime: 15.2, rating: 4.9 },
  { agentId: 'a2', agentName: 'Sara Ali', department: 'Billing', totalAssigned: 38, totalResolved: 35, avgResolutionTime: 18.7, rating: 4.7 },
  { agentId: 'a3', agentName: 'James Wilson', department: 'General', totalAssigned: 32, totalResolved: 28, avgResolutionTime: 20.1, rating: 4.5 },
  { agentId: 'a4', agentName: 'Maria Lopez', department: 'Technical', totalAssigned: 15, totalResolved: 12, avgResolutionTime: 25.0, rating: 4.2 },
];

export const mockAuditLogs: AuditLog[] = [
  { id: 'al1', action: 'TICKET_CREATED', performedBy: 'u1', performedByName: 'John Carter', targetType: 'ticket', targetId: 'TKT-025', details: 'Created ticket: Database connection timeout', createdAt: '2024-03-25T10:00:00Z' },
  { id: 'al2', action: 'TICKET_ASSIGNED', performedBy: 'a1', performedByName: 'Ahmed Khan', targetType: 'ticket', targetId: 'TKT-024', details: 'Assigned ticket to self', createdAt: '2024-03-24T15:30:00Z' },
  { id: 'al3', action: 'TICKET_RESOLVED', performedBy: 'a2', performedByName: 'Sara Ali', targetType: 'ticket', targetId: 'TKT-020', details: 'Resolved ticket with summary', createdAt: '2024-03-23T11:00:00Z' },
  { id: 'al4', action: 'AGENT_CREATED', performedBy: 'sa1', performedByName: 'Admin User', targetType: 'user', targetId: 'a4', details: 'Created agent: Maria Lopez (Technical)', createdAt: '2024-03-22T09:00:00Z' },
  { id: 'al5', action: 'TICKET_NOTE_ADDED', performedBy: 'a1', performedByName: 'Ahmed Khan', targetType: 'ticket', targetId: 'TKT-018', details: 'Added investigation note', createdAt: '2024-03-21T16:45:00Z' },
  { id: 'al6', action: 'AGENT_DEACTIVATED', performedBy: 'sa1', performedByName: 'Admin User', targetType: 'user', targetId: 'a4', details: 'Deactivated agent: Maria Lopez', createdAt: '2024-03-20T14:00:00Z' },
  { id: 'al7', action: 'TICKET_REASSIGNED', performedBy: 'sa1', performedByName: 'Admin User', targetType: 'ticket', targetId: 'TKT-015', details: 'Reassigned from Ahmed Khan to James Wilson', createdAt: '2024-03-19T10:30:00Z' },
];
