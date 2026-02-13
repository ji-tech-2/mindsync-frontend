import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from '@/features/auth';
import { MainLayout, AuthLayout } from '@/layouts';

// Lazy load feature routes for better code splitting
const Home = lazy(() =>
  import('@/features/home').then((m) => ({ default: m.Home }))
);
const Login = lazy(() =>
  import('@/features/auth').then((m) => ({ default: m.Login }))
);
const SignUp = lazy(() =>
  import('@/features/auth').then((m) => ({ default: m.SignUp }))
);
const ForgotPassword = lazy(() =>
  import('@/features/auth').then((m) => ({ default: m.ForgotPassword }))
);
const Dashboard = lazy(() =>
  import('@/features/dashboard').then((m) => ({ default: m.Dashboard }))
);
const Profile = lazy(() =>
  import('@/features/profile').then((m) => ({ default: m.Profile }))
);
const History = lazy(() =>
  import('@/features/history').then((m) => ({ default: m.History }))
);
const Screening = lazy(() =>
  import('@/features/screening').then((m) => ({ default: m.Screening }))
);
const Result = lazy(() =>
  import('@/features/screening').then((m) => ({ default: m.Result }))
);

/**
 * Loading fallback component
 */
function LoadingFallback() {
  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
      }}
    >
      <div>Loading...</div>
    </div>
  );
}

/**
 * Main Application Router
 *
 * Handles:
 * - Route definitions for all features
 * - Protected routes (authentication required)
 * - Lazy loading with suspense boundaries
 * - Different layouts for different route groups
 * - Not found redirects
 */
export function AppRouter() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Auth routes with footer only */}
        <Route element={<AuthLayout />}>
          <Route path="/signin" element={<Login />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/screening" element={<Screening />} />
        </Route>

        {/* Main routes with navbar and footer */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<Home />} />

          {/* Protected routes - require authentication */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/history" element={<History />} />
          </Route>

          {/* Semi-public routes - accessible to all, but full features require auth */}
          <Route path="/result/:predictionId" element={<Result />} />

          {/* Catch-all redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
