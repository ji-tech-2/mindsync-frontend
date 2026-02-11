import { Outlet } from 'react-router-dom';
import { Navbar, Footer } from '@/components';

/**
 * MainLayout Component
 *
 * Full application layout with:
 * - Navbar at the top (sticky)
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
        overflow: 'hidden',
      }}
    >
      <Navbar />

      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
