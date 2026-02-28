import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { NavLink } from '@/components/NavLink';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupLabel, SidebarGroupContent,
  SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarHeader, useSidebar,
} from '@/components/ui/sidebar';
import {
  LayoutDashboard, Users, Calendar, FileText, Stethoscope, BarChart3,
  LogOut, Heart, UserPlus, Brain, CreditCard, UserCog,
} from 'lucide-react';
import type { UserRole } from '@/lib/types';

const menuConfig: Record<UserRole, { title: string; url: string; icon: React.ElementType }[]> = {
  admin: [
    { title: 'Dashboard', url: '/admin/dashboard', icon: LayoutDashboard },
    { title: 'Doctors', url: '/admin/doctors', icon: Stethoscope },
    { title: 'Receptionists', url: '/admin/receptionists', icon: UserCog },
    { title: 'Analytics', url: '/admin/analytics', icon: BarChart3 },
    { title: 'Subscriptions', url: '/admin/subscriptions', icon: CreditCard },
  ],
  doctor: [
    { title: 'Dashboard', url: '/doctor/dashboard', icon: LayoutDashboard },
    { title: 'Appointments', url: '/doctor/appointments', icon: Calendar },
    { title: 'Patients', url: '/doctor/patients', icon: Users },
    { title: 'Prescriptions', url: '/doctor/prescriptions', icon: FileText },
    { title: 'AI Diagnosis', url: '/doctor/ai-diagnosis', icon: Brain },
  ],
  receptionist: [
    { title: 'Dashboard', url: '/receptionist/dashboard', icon: LayoutDashboard },
    { title: 'Patients', url: '/receptionist/patients', icon: Users },
    { title: 'Appointments', url: '/receptionist/appointments', icon: Calendar },
    { title: 'Register Patient', url: '/receptionist/register-patient', icon: UserPlus },
  ],
  patient: [
    { title: 'Dashboard', url: '/patient/dashboard', icon: LayoutDashboard },
    { title: 'Appointments', url: '/patient/appointments', icon: Calendar },
    { title: 'Prescriptions', url: '/patient/prescriptions', icon: FileText },
    { title: 'Medical History', url: '/patient/history', icon: Heart },
  ],
};

export const AppSidebar = () => {
  const { user, logout } = useAuth();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const navigate = useNavigate();

  if (!user) return null;

  const items = menuConfig[user.role] || [];

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-sidebar-primary flex items-center justify-center">
            <Heart className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div>
              <h2 className="font-bold text-sm text-sidebar-foreground">MediClinic AI</h2>
              <p className="text-xs text-sidebar-foreground/60 capitalize">{user.role} Portal</p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className="hover:bg-sidebar-accent/50" activeClassName="bg-sidebar-accent text-sidebar-primary font-medium">
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-3">
        {!collapsed && (
          <div className="mb-2 px-2">
            <p className="text-sm font-medium text-sidebar-foreground truncate">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">{user.email}</p>
          </div>
        )}
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="text-red-400 hover:text-red-300 hover:bg-red-500/10">
              <LogOut className="mr-2 h-4 w-4" />
              {!collapsed && <span>Logout</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};
