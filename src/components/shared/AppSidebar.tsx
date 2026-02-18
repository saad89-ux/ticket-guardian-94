import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard, Ticket, Plus, Users, BarChart3, FileText,
  LogOut, Shield, Headphones, User, ChevronLeft, ChevronRight
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
}

export const AppSidebar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const navItems: NavItem[] = (() => {
    switch (user.role) {
      case 'user':
        return [
          { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
          { label: 'My Tickets', path: '/tickets', icon: <Ticket size={20} /> },
          { label: 'Create Ticket', path: '/tickets/create', icon: <Plus size={20} /> },
          { label: 'Profile', path: '/profile', icon: <User size={20} /> },
        ];
      case 'agent':
        return [
          { label: 'Dashboard', path: '/agent/dashboard', icon: <LayoutDashboard size={20} /> },
          { label: 'Ticket Queue', path: '/agent/tickets', icon: <Ticket size={20} /> },
          { label: 'Profile', path: '/agent/profile', icon: <User size={20} /> },
        ];
      case 'superadmin':
        return [
          { label: 'Dashboard', path: '/superadmin/dashboard', icon: <LayoutDashboard size={20} /> },
          { label: 'All Tickets', path: '/superadmin/tickets', icon: <Ticket size={20} /> },
          { label: 'Agents', path: '/superadmin/agents', icon: <Users size={20} /> },
          { label: 'Analytics', path: '/superadmin/analytics', icon: <BarChart3 size={20} /> },
          { label: 'Audit Logs', path: '/superadmin/audit-logs', icon: <FileText size={20} /> },
        ];
      default:
        return [];
    }
  })();

  const roleIcon = user.role === 'superadmin' ? <Shield size={18} /> : user.role === 'agent' ? <Headphones size={18} /> : <User size={18} />;
  const roleLabel = user.role === 'superadmin' ? 'Super Admin' : user.role === 'agent' ? 'Support Agent' : 'Support User';

  return (
    <aside className={cn(
      "h-screen bg-sidebar text-sidebar-foreground flex flex-col transition-all duration-300 sticky top-0",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Ticket size={16} className="text-primary-foreground" />
            </div>
            <span className="font-bold text-sm text-sidebar-primary-foreground">SupportDesk</span>
          </div>
        )}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded hover:bg-sidebar-accent">
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="mx-3 mt-3 p-2 rounded-lg bg-sidebar-accent flex items-center gap-2">
          {roleIcon}
          <span className="text-xs font-medium text-sidebar-accent-foreground">{roleLabel}</span>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 mt-2">
        {navItems.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              title={collapsed ? item.label : undefined}
            >
              {item.icon}
              {!collapsed && item.label}
            </Link>
          );
        })}
      </nav>

      {/* User info & logout */}
      <div className="p-3 border-t border-sidebar-border">
        {!collapsed && (
          <div className="mb-2 px-3">
            <p className="text-xs font-medium text-sidebar-accent-foreground truncate">{user.name}</p>
            <p className="text-xs text-sidebar-foreground truncate">{user.email}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent hover:text-destructive transition-colors"
          title="Logout"
        >
          <LogOut size={20} />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </aside>
  );
};
