import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/lib/types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user.role)) {
    // Redirect to appropriate dashboard
    if (user.role === 'superadmin') return <Navigate to="/superadmin/dashboard" replace />;
    if (user.role === 'agent') return <Navigate to="/agent/dashboard" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};
