import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Layout
import { Layout } from './components/layout/Layout';

// Pages
import { Login } from './pages/Login';
import { HODDashboard } from './pages/HODDashboard';
import { FacultyDashboard } from './pages/FacultyDashboard';
import { FacultyList } from './pages/FacultyList';
import { AddFaculty } from './pages/AddFaculty';
import { FacultyDetail } from './pages/FacultyDetail';
import { RoomsList } from './pages/RoomsList';
import { TimetableManagement } from './pages/TimetableManagement';
import { LoginLogs } from './pages/LoginLogs';
import { ActivityLogs } from './pages/ActivityLogs';
import { NotificationsPage } from './pages/NotificationsPage';
import { AttendanceBiometricPage } from './pages/AttendanceBiometricPage';
import { UserProfilePage } from './pages/UserProfilePage';
import { SettingsPage } from './pages/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode; hodOnly?: boolean }> = ({ children, hodOnly }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400">
        <span className="w-10 h-10 border-3 border-orange-500 border-t-transparent rounded-full animate-spin"></span>
        <p className="mt-3 text-xs font-semibold">Authenticating Session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (hodOnly && user.role !== 'HOD') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

// Dynamic Dashboard Router based on Role
const DashboardRouter: React.FC = () => {
  const { user } = useAuth();
  if (user?.role === 'HOD') {
    return <HODDashboard />;
  }
  return <FacultyDashboard />;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              
              {/* Public Login Route */}
              <Route path="/login" element={<Login />} />

              {/* Protected App Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<DashboardRouter />} />
                <Route path="faculty" element={<FacultyList />} />
                <Route
                  path="faculty/add"
                  element={
                    <ProtectedRoute hodOnly>
                      <AddFaculty />
                    </ProtectedRoute>
                  }
                />
                <Route path="faculty/:id" element={<FacultyDetail />} />
                <Route path="rooms" element={<RoomsList />} />
                <Route path="timetable" element={<TimetableManagement />} />
                <Route
                  path="logs/login"
                  element={
                    <ProtectedRoute hodOnly>
                      <LoginLogs />
                    </ProtectedRoute>
                  }
                />
                <Route path="logs/activity" element={<ActivityLogs />} />
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="attendance" element={<AttendanceBiometricPage />} />
                <Route path="profile" element={<UserProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              {/* Fallback Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
