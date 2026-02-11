import { Outlet } from 'react-router-dom';
import { Navbar, Footer } from '@/components';

/**
 * MainLayout Component
 *
 * Full application layout with:
 * - Fixed navbar at the top
 * - Main content area for route components (via Outlet)
 * - Footer at the bottom
 *
 * Used for: Home, Dashboard, Profile, History, Result pages
 */
export function MainLayout() {
  return (
    <>
      <Navbar />

      <main
        style={{
          minHeight: '100vh',
          paddingTop: '4.5rem',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ flex: 1 }}>
          <Outlet />
        </div>
        <Footer />
      </main>
    </>
  );
}
