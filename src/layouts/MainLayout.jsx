import { Outlet } from 'react-router-dom';
import { Navbar, Footer } from '@/components';

/**
 * MainLayout Component
 *
 * Full application layout with:
 * - Navbar at the top
 * - Main content area for route components (via Outlet)
 * - Footer at the bottom
 *
 * Used for: Home, Dashboard, Profile, History, Result pages
 */
export function MainLayout() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        width: '100%',
      }}
    >
      <Navbar />

      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
