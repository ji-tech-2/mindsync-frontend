import { StrictMode } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/features/auth';

/**
 * Application Provider
 *
 * This "mega-provider" consolidates all app-level context providers
 * to prevent app.jsx from becoming a deeply nested mess of tags.
 *
 * Add any new global providers here (e.g., theme, i18n, state management)
 */
export function AppProvider({ children }) {
  return (
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>{children}</AuthProvider>
      </BrowserRouter>
    </StrictMode>
  );
}
