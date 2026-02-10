import { Routes, Route, useLocation } from 'react-router-dom';
import {
  AuthProvider,
  ProtectedRoute,
  Login,
  Register,
  ForgotPassword,
} from './features/auth';
import { Navbar, Footer } from './layouts';
import { Home } from './features/home';
import { Dashboard } from './features/dashboard';
import { Screening, Result } from './features/screening';
import { History } from './features/history';
import { Profile } from './features/profile';
import './App.css';

// Inner App component that can use AuthContext
function AppContent() {
  const location = useLocation();

  // Pages that should only show footer (no navbar)
  const footerOnlyPages = [
    '/signIn',
    '/register',
    '/screening',
    '/forgot-password',
  ];
  const isFooterOnlyPage = footerOnlyPages.includes(location.pathname);

  return (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: '100%',
        }}
      >
        {!isFooterOnlyPage && <Navbar />}

        <main style={{ flex: 1 }}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/signIn" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected routes - require authentication */}
            <Route element={<ProtectedRoute />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/history" element={<History />} />
            </Route>

            {/* Semi-public routes - accessible to all, but full features require auth */}
            <Route path="/screening" element={<Screening />} />
            <Route path="/result/:predictionId" element={<Result />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
