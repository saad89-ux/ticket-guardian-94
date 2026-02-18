import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import ProfilePage from "./pages/ProfilePage";

import UserDashboard from "./pages/user/UserDashboard";
import MyTicketsPage from "./pages/user/MyTicketsPage";
import CreateTicketPage from "./pages/user/CreateTicketPage";

import AgentDashboard from "./pages/agent/AgentDashboard";
import AgentTicketsPage from "./pages/agent/AgentTicketsPage";

import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminTicketsPage from "./pages/admin/AdminTicketsPage";
import AdminAgentsPage from "./pages/admin/AdminAgentsPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AuditLogsPage from "./pages/admin/AuditLogsPage";

import TicketDetailPage from "./pages/TicketDetailPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public */}
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* User routes */}
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['user']}><UserDashboard /></ProtectedRoute>} />
            <Route path="/tickets" element={<ProtectedRoute allowedRoles={['user']}><MyTicketsPage /></ProtectedRoute>} />
            <Route path="/tickets/create" element={<ProtectedRoute allowedRoles={['user']}><CreateTicketPage /></ProtectedRoute>} />
            <Route path="/tickets/:id" element={<ProtectedRoute allowedRoles={['user']}><TicketDetailPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute allowedRoles={['user', 'agent', 'superadmin']}><ProfilePage /></ProtectedRoute>} />

            {/* Agent routes */}
            <Route path="/agent/dashboard" element={<ProtectedRoute allowedRoles={['agent']}><AgentDashboard /></ProtectedRoute>} />
            <Route path="/agent/tickets" element={<ProtectedRoute allowedRoles={['agent']}><AgentTicketsPage /></ProtectedRoute>} />
            <Route path="/agent/tickets/:id" element={<ProtectedRoute allowedRoles={['agent']}><TicketDetailPage /></ProtectedRoute>} />
            <Route path="/agent/profile" element={<ProtectedRoute allowedRoles={['agent']}><ProfilePage /></ProtectedRoute>} />

            {/* Super Admin routes */}
            <Route path="/superadmin/dashboard" element={<ProtectedRoute allowedRoles={['superadmin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/superadmin/tickets" element={<ProtectedRoute allowedRoles={['superadmin']}><AdminTicketsPage /></ProtectedRoute>} />
            <Route path="/superadmin/tickets/:id" element={<ProtectedRoute allowedRoles={['superadmin']}><TicketDetailPage /></ProtectedRoute>} />
            <Route path="/superadmin/agents" element={<ProtectedRoute allowedRoles={['superadmin']}><AdminAgentsPage /></ProtectedRoute>} />
            <Route path="/superadmin/analytics" element={<ProtectedRoute allowedRoles={['superadmin']}><AdminAnalyticsPage /></ProtectedRoute>} />
            <Route path="/superadmin/audit-logs" element={<ProtectedRoute allowedRoles={['superadmin']}><AuditLogsPage /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
