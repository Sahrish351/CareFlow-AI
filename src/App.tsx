import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppLayout } from './layouts/AppLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/public/LandingPage';
import { HospitalsDiscoveryPage } from './pages/public/HospitalsDiscoveryPage';
import { HospitalProfilePage } from './pages/public/HospitalProfilePage';
import { DoctorsDiscoveryPage } from './pages/public/DoctorsDiscoveryPage';
import { DoctorProfilePage } from './pages/public/DoctorProfilePage';
import { AboutPage } from './pages/public/AboutPage';
import { ServicesPage } from './pages/public/ServicesPage';
import { UnauthorizedPage } from './pages/public/UnauthorizedPage';

// Auth Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/auth/ResetPasswordPage';

// Patient Pages
import { PatientDashboard } from './pages/patient/PatientDashboard';
import { AiNavigationPage } from './pages/patient/AiNavigationPage';
import { DoctorDiscoveryPage } from './pages/patient/DoctorDiscoveryPage';
import { SavedDoctorsPage } from './pages/patient/SavedDoctorsPage';
import { AppointmentsPage } from './pages/patient/AppointmentsPage';
import { QueueTrackerPage } from './pages/patient/QueueTrackerPage';
import { ReportsPage } from './pages/patient/ReportsPage';
import { FamilyProfilesPage } from './pages/patient/FamilyProfilesPage';
import { HealthTimelinePage } from './pages/patient/HealthTimelinePage';
import { PrescriptionsPage } from './pages/patient/PrescriptionsPage';
import { CarePassportPage } from './pages/patient/CarePassportPage';

// Doctor Pages
import { DoctorDashboard } from './pages/doctor/DoctorDashboard';
import { DoctorSchedulePage } from './pages/doctor/DoctorSchedulePage';

// Receptionist Pages
import { ReceptionistDashboard } from './pages/receptionist/ReceptionistDashboard';

// Admin Pages
import { HospitalAdminDashboard } from './pages/admin/HospitalAdminDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminAnalyticsPage } from './pages/admin/AdminAnalyticsPage';
import { AdminDepartmentsPage } from './pages/admin/AdminDepartmentsPage';
import { AdminDoctorsPage } from './pages/admin/AdminDoctorsPage';
import { AdminDoctorApprovalsPage } from './pages/admin/AdminDoctorApprovalsPage';
import { AdminAppointmentsPage } from './pages/admin/AdminAppointmentsPage';

// Portal & Dashboard Redirect for authenticated role routing
const PortalRedirect: React.FC = () => {
  const { user, role, loading } = useAuth();
  if (loading) return null;
  if (!user) {
    return <Navigate to="/login" state={{ message: 'Please log in to continue to your dashboard.' }} replace />;
  }
  if (role === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
  if (role === 'receptionist') return <Navigate to="/receptionist/dashboard" replace />;
  if (role === 'hospital_admin') return <Navigate to="/hospital-admin/dashboard" replace />;
  if (role === 'super_admin' || role === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/patient/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Discovery & Informational Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/hospitals" element={<HospitalsDiscoveryPage />} />
          <Route path="/hospital/:id" element={<HospitalProfilePage />} />
          <Route path="/doctors" element={<DoctorsDiscoveryPage />} />
          <Route path="/doctors/:id" element={<DoctorProfilePage />} />
          <Route path="/services" element={<ServicesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/unauthorized" element={<UnauthorizedPage />} />

          {/* Public Auth Routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Authenticated Portal & Account Shortcuts */}
          <Route path="/portal" element={<PortalRedirect />} />
          <Route path="/dashboard" element={<PortalRedirect />} />
          <Route path="/account" element={<PortalRedirect />} />

          {/* Route Aliases */}
          <Route path="/patient-dashboard" element={<Navigate to="/patient/dashboard" replace />} />
          <Route path="/doctor-dashboard" element={<Navigate to="/doctor/dashboard" replace />} />
          <Route path="/receptionist-dashboard" element={<Navigate to="/receptionist/dashboard" replace />} />
          <Route path="/hospital-admin-dashboard" element={<Navigate to="/hospital-admin/dashboard" replace />} />
          <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
          <Route path="/find-care" element={<Navigate to="/patient/ai-navigation" replace />} />
          <Route path="/how-it-works" element={<Navigate to="/services" replace />} />
          <Route path="/appointments" element={<Navigate to="/patient/appointments" replace />} />
          <Route path="/queue" element={<Navigate to="/patient/queue" replace />} />
          <Route path="/reports" element={<Navigate to="/patient/reports" replace />} />
          <Route path="/care-passport" element={<Navigate to="/patient/passport" replace />} />
          <Route path="/health-timeline" element={<Navigate to="/patient/timeline" replace />} />

          {/* Protected Application Routes */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Patient Workflow */}
            <Route
              path="/patient/dashboard"
              element={
                <ProtectedRoute allowedRoles={['patient', 'super_admin', 'admin']}>
                  <PatientDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/ai-navigation"
              element={
                <ProtectedRoute allowedRoles={['patient', 'super_admin', 'admin']}>
                  <AiNavigationPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/doctors"
              element={
                <ProtectedRoute allowedRoles={['patient', 'doctor', 'receptionist', 'hospital_admin', 'super_admin', 'admin']}>
                  <DoctorDiscoveryPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/saved-doctors"
              element={
                <ProtectedRoute allowedRoles={['patient', 'super_admin', 'admin']}>
                  <SavedDoctorsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/appointments"
              element={
                <ProtectedRoute allowedRoles={['patient', 'super_admin', 'admin']}>
                  <AppointmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/queue"
              element={
                <ProtectedRoute allowedRoles={['patient', 'super_admin', 'admin']}>
                  <QueueTrackerPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/reports"
              element={
                <ProtectedRoute allowedRoles={['patient', 'super_admin', 'admin']}>
                  <ReportsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/family"
              element={
                <ProtectedRoute allowedRoles={['patient', 'super_admin', 'admin']}>
                  <FamilyProfilesPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/timeline"
              element={
                <ProtectedRoute allowedRoles={['patient', 'super_admin', 'admin']}>
                  <HealthTimelinePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/prescriptions"
              element={
                <ProtectedRoute allowedRoles={['patient', 'super_admin', 'admin']}>
                  <PrescriptionsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/patient/passport"
              element={
                <ProtectedRoute allowedRoles={['patient', 'super_admin', 'admin']}>
                  <CarePassportPage />
                </ProtectedRoute>
              }
            />

            {/* Doctor Workflow */}
            <Route
              path="/doctor/dashboard"
              element={
                <ProtectedRoute allowedRoles={['doctor', 'super_admin', 'admin']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/queue"
              element={
                <ProtectedRoute allowedRoles={['doctor', 'super_admin', 'admin']}>
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/doctor/schedule"
              element={
                <ProtectedRoute allowedRoles={['doctor', 'super_admin', 'admin']}>
                  <DoctorSchedulePage />
                </ProtectedRoute>
              }
            />

            {/* Receptionist Workflow */}
            <Route
              path="/receptionist/dashboard"
              element={
                <ProtectedRoute allowedRoles={['receptionist', 'super_admin', 'admin']}>
                  <ReceptionistDashboard />
                </ProtectedRoute>
              }
            />

            {/* Hospital Admin Workflow */}
            <Route
              path="/hospital-admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['hospital_admin', 'super_admin', 'admin']}>
                  <HospitalAdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Super Admin Workflow */}
            <Route
              path="/admin/dashboard"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                  <AdminAnalyticsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/departments"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                  <AdminDepartmentsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/doctors"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                  <AdminDoctorsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/approvals"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                  <AdminDoctorApprovalsPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/appointments"
              element={
                <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                  <AdminAppointmentsPage />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Catch-all to Public Home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
