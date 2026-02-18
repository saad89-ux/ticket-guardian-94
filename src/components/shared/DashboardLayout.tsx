import { ReactNode } from 'react';
import { AppSidebar } from './AppSidebar';

export const DashboardLayout = ({ children }: { children: ReactNode }) => (
  <div className="flex min-h-screen bg-background">
    <AppSidebar />
    <main className="flex-1 overflow-auto">
      <div className="p-6 max-w-7xl mx-auto">
        {children}
      </div>
    </main>
  </div>
);
