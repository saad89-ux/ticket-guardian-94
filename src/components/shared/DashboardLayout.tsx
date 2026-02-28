import { ReactNode } from 'react';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';

export const DashboardLayout = ({ children }: { children: ReactNode }) => (
  <SidebarProvider>
    <div className="flex min-h-screen w-full bg-background">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-12 flex items-center border-b border-border px-2">
          <SidebarTrigger />
        </header>
        <main className="flex-1 overflow-auto">
          <div className="p-6 max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  </SidebarProvider>
);
