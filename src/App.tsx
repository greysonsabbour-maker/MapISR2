import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { DashboardPage } from '@/pages/DashboardPage';
import { MapPage } from '@/pages/MapPage';
import { TrainsPage } from '@/pages/TrainsPage';
import { SchedulesPage } from '@/pages/SchedulesPage';
import { LocomotivesPage } from '@/pages/LocomotivesPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { AdminPage } from '@/pages/AdminPage';
import { useAuthStore } from '@/stores/authStore';
import { useTrainScheduler, useKmzLoader } from '@/hooks/useTrainScheduler';
import { seedInitialData } from '@/services/seed/seedData';

function AppInitializer() {
  useKmzLoader();
  useTrainScheduler();

  useEffect(() => {
    seedInitialData();
  }, []);

  return null;
}

function AuthenticatedLayout() {
  return (
    <AppLayout />
  );
}

function AppRoutes() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage />}
      />

      <Route element={<ProtectedRoute />}>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/map" element={<MapPage />} />
          <Route path="/trains" element={<TrainsPage />} />
        </Route>
      </Route>

      <Route element={<ProtectedRoute adminOnly />}>
        <Route element={<AuthenticatedLayout />}>
          <Route path="/schedules" element={<SchedulesPage />} />
          <Route path="/locomotives" element={<LocomotivesPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInitializer />
      <AppRoutes />
    </BrowserRouter>
  );
}
