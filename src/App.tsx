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

// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminDoctorsPage from "./pages/admin/AdminDoctorsPage";
import AdminReceptionistsPage from "./pages/admin/AdminReceptionistsPage";
import AdminAnalyticsPage from "./pages/admin/AdminAnalyticsPage";
import AdminSubscriptionsPage from "./pages/admin/AdminSubscriptionsPage";

// Doctor
import DoctorDashboard from "./pages/doctor/DoctorDashboard";
import DoctorAppointmentsPage from "./pages/doctor/DoctorAppointmentsPage";
import DoctorPatientsPage from "./pages/doctor/DoctorPatientsPage";
import DoctorPrescriptionsPage from "./pages/doctor/DoctorPrescriptionsPage";
import DoctorAIDiagnosisPage from "./pages/doctor/DoctorAIDiagnosisPage";

// Receptionist
import ReceptionistDashboard from "./pages/receptionist/ReceptionistDashboard";
import ReceptionistPatientsPage from "./pages/receptionist/ReceptionistPatientsPage";
import ReceptionistAppointmentsPage from "./pages/receptionist/ReceptionistAppointmentsPage";
import ReceptionistRegisterPatientPage from "./pages/receptionist/ReceptionistRegisterPatientPage";

// Patient
import PatientDashboard from "./pages/patient/PatientDashboard";
import PatientAppointmentsPage from "./pages/patient/PatientAppointmentsPage";
import PatientPrescriptionsPage from "./pages/patient/PatientPrescriptionsPage";
import PatientHistoryPage from "./pages/patient/PatientHistoryPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Admin */}
            <Route path="/admin/dashboard" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
            <Route path="/admin/doctors" element={<ProtectedRoute allowedRoles={['admin']}><AdminDoctorsPage /></ProtectedRoute>} />
            <Route path="/admin/receptionists" element={<ProtectedRoute allowedRoles={['admin']}><AdminReceptionistsPage /></ProtectedRoute>} />
            <Route path="/admin/analytics" element={<ProtectedRoute allowedRoles={['admin']}><AdminAnalyticsPage /></ProtectedRoute>} />
            <Route path="/admin/subscriptions" element={<ProtectedRoute allowedRoles={['admin']}><AdminSubscriptionsPage /></ProtectedRoute>} />

            {/* Doctor */}
            <Route path="/doctor/dashboard" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
            <Route path="/doctor/appointments" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorAppointmentsPage /></ProtectedRoute>} />
            <Route path="/doctor/patients" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorPatientsPage /></ProtectedRoute>} />
            <Route path="/doctor/prescriptions" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorPrescriptionsPage /></ProtectedRoute>} />
            <Route path="/doctor/ai-diagnosis" element={<ProtectedRoute allowedRoles={['doctor']}><DoctorAIDiagnosisPage /></ProtectedRoute>} />

            {/* Receptionist */}
            <Route path="/receptionist/dashboard" element={<ProtectedRoute allowedRoles={['receptionist']}><ReceptionistDashboard /></ProtectedRoute>} />
            <Route path="/receptionist/patients" element={<ProtectedRoute allowedRoles={['receptionist']}><ReceptionistPatientsPage /></ProtectedRoute>} />
            <Route path="/receptionist/appointments" element={<ProtectedRoute allowedRoles={['receptionist']}><ReceptionistAppointmentsPage /></ProtectedRoute>} />
            <Route path="/receptionist/register-patient" element={<ProtectedRoute allowedRoles={['receptionist']}><ReceptionistRegisterPatientPage /></ProtectedRoute>} />

            {/* Patient */}
            <Route path="/patient/dashboard" element={<ProtectedRoute allowedRoles={['patient']}><PatientDashboard /></ProtectedRoute>} />
            <Route path="/patient/appointments" element={<ProtectedRoute allowedRoles={['patient']}><PatientAppointmentsPage /></ProtectedRoute>} />
            <Route path="/patient/prescriptions" element={<ProtectedRoute allowedRoles={['patient']}><PatientPrescriptionsPage /></ProtectedRoute>} />
            <Route path="/patient/history" element={<ProtectedRoute allowedRoles={['patient']}><PatientHistoryPage /></ProtectedRoute>} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
