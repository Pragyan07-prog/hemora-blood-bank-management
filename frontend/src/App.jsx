import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import RoleRoute from './routes/RoleRoute';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import AdminLayout from './layouts/AdminLayout';
import DonorLayout from './layouts/DonorLayout';

// Public Pages
import LandingPage from './pages/public/LandingPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import DonorManagement from './pages/admin/DonorManagement';
import DonorDetail from './pages/admin/DonorDetail';
import BloodInventory from './pages/admin/BloodInventory';
import BloodRequests from './pages/admin/BloodRequests';
import DonationManagement from './pages/admin/DonationManagement';
import AppointmentManagement from './pages/admin/AppointmentManagement';
import BloodCampManagement from './pages/admin/BloodCampManagement';
import NotificationManagement from './pages/admin/NotificationManagement';
import CertificateManagement from './pages/admin/CertificateManagement';
import ReportsAnalytics from './pages/admin/ReportsAnalytics';
import UserManagement from './pages/admin/UserManagement';
import AdminSettings from './pages/admin/AdminSettings';

// Donor Pages
import DonorDashboard from './pages/donor/DonorDashboard';
import DonorProfile from './pages/donor/DonorProfile';
import FindBlood from './pages/donor/FindBlood';
import RequestBlood from './pages/donor/RequestBlood';
import BookAppointment from './pages/donor/BookAppointment';
import MyAppointments from './pages/donor/MyAppointments';
import DonationHistory from './pages/donor/DonationHistory';
import DonorEligibility from './pages/donor/DonorEligibility';
import BloodCamps from './pages/donor/BloodCamps';
import DonorNotifications from './pages/donor/DonorNotifications';
import MyCertificates from './pages/donor/MyCertificates';
import DonorSettings from './pages/donor/DonorSettings';

export function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#1e293b',
              color: '#ffffff',
              fontSize: '13px',
              fontWeight: 500,
              borderRadius: '12px',
            },
            success: {
              iconTheme: {
                primary: '#16a34a',
                secondary: '#ffffff',
              },
            },
            error: {
              iconTheme: {
                primary: '#dc2626',
                secondary: '#ffffff',
              },
            },
          }}
        />

        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <LandingPage />
              </PublicLayout>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Admin Routes */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <RoleRoute role="ADMIN">
                  <AdminLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="donors" element={<DonorManagement />} />
            <Route path="donors/:id" element={<DonorDetail />} />
            <Route path="inventory" element={<BloodInventory />} />
            <Route path="requests" element={<BloodRequests />} />
            <Route path="donations" element={<DonationManagement />} />
            <Route path="appointments" element={<AppointmentManagement />} />
            <Route path="camps" element={<BloodCampManagement />} />
            <Route path="notifications" element={<NotificationManagement />} />
            <Route path="certificates" element={<CertificateManagement />} />
            <Route path="reports" element={<ReportsAnalytics />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="settings" element={<AdminSettings />} />
          </Route>

          {/* Donor Routes */}
          <Route
            path="/donor"
            element={
              <ProtectedRoute>
                <RoleRoute role="DONOR">
                  <DonorLayout />
                </RoleRoute>
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/donor/dashboard" replace />} />
            <Route path="dashboard" element={<DonorDashboard />} />
            <Route path="profile" element={<DonorProfile />} />
            <Route path="find-blood" element={<FindBlood />} />
            <Route path="request-blood" element={<RequestBlood />} />
            <Route path="book-appointment" element={<BookAppointment />} />
            <Route path="appointments" element={<MyAppointments />} />
            <Route path="donations" element={<DonationHistory />} />
            <Route path="eligibility" element={<DonorEligibility />} />
            <Route path="camps" element={<BloodCamps />} />
            <Route path="notifications" element={<DonorNotifications />} />
            <Route path="certificates" element={<MyCertificates />} />
            <Route path="settings" element={<DonorSettings />} />
          </Route>

          {/* Catch all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
