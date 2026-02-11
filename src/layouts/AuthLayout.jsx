import { Outlet } from 'react-router-dom';
import { Footer } from '@/components';

/**
 * AuthLayout Component
 *
 * Minimal layout with only footer:
 * - No Navbar
 * - Main content area for route components (via Outlet)
 * - Footer at the bottom
 *
 * Used for: Authentication pages (Login, Register, ForgotPassword, Screening)
 */
export function AuthLayout() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
