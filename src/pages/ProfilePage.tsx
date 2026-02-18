import { DashboardLayout } from '@/components/shared/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { motion } from 'framer-motion';
import { User, Mail, Calendar, Shield } from 'lucide-react';
import { format } from 'date-fns';

const ProfilePage = () => {
  const { user } = useAuth();
  if (!user) return null;

  const roleLabel = user.role === 'superadmin' ? 'Super Admin' : user.role === 'agent' ? 'Support Agent' : 'Support User';

  return (
    <DashboardLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-lg">
        <h1 className="text-2xl font-bold text-foreground mb-6">Profile</h1>
        <div className="glass-card rounded-xl p-6 space-y-5">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <User size={32} />
          </div>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <User size={16} className="text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Name</p>
                <p className="font-medium text-foreground">{user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Email</p>
                <p className="font-medium text-foreground">{user.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Shield size={16} className="text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Role</p>
                <p className="font-medium text-foreground">{roleLabel}</p>
              </div>
            </div>
            {user.department && (
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-muted-foreground" />
                <div>
                  <p className="text-xs text-muted-foreground">Department</p>
                  <p className="font-medium text-foreground">{user.department}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </DashboardLayout>
  );
};

export default ProfilePage;
