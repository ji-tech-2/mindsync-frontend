import { AppProvider } from './provider';
import { AppRouter } from './router';

/**
 * Root App Component
 *
 * Combines:
 * - Application providers (auth, routing, etc.)
 * - Main router with lazy loading
 * - Layouts are defined per-route in router.jsx
 */
export function App() {
  return (
    <AppProvider>
      <AppRouter />
    </AppProvider>
  );
}
