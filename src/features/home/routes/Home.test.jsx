import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';
import * as authModule from '@/features/auth';

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock auth module
vi.mock('@/features/auth', () => ({
  useAuth: vi.fn(),
}));

describe('Home Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should show loading state while checking auth', () => {
    vi.mocked(authModule.useAuth).mockReturnValue({
      user: null,
      isLoading: true,
      isLoggingOut: false,
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText('Loading...')).toBeTruthy();
  });

  it('should redirect to dashboard if user is logged in', async () => {
    vi.mocked(authModule.useAuth).mockReturnValue({
      user: { id: 1, name: 'Test User' },
      isLoading: false,
      isLoggingOut: false,
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/dashboard', {
        replace: true,
      });
    });
  });

  it('should not redirect if user is logging out', () => {
    vi.mocked(authModule.useAuth).mockReturnValue({
      user: { id: 1, name: 'Test User' },
      isLoading: false,
      isLoggingOut: true,
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('should render hero section when not logged in', () => {
    vi.mocked(authModule.useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      isLoggingOut: false,
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText('Your Mental Health Companion')).toBeTruthy();
    expect(screen.getByAltText('MindSync Logo')).toBeTruthy();
  });

  it('should render feature cards for anonymous users', () => {
    vi.mocked(authModule.useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      isLoggingOut: false,
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText('Professional Screening')).toBeTruthy();
    expect(screen.getByText('Track Progress')).toBeTruthy();
    expect(screen.getByText('Personalized Advice')).toBeTruthy();
    expect(screen.getByText('How MindSync Helps You')).toBeTruthy();
  });

  it('should render CTA buttons with correct links', () => {
    vi.mocked(authModule.useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      isLoggingOut: false,
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const getStartedLink = screen.getByText('Get Started').closest('a');
    expect(getStartedLink).toHaveAttribute('href', '/signup');

    const tryScreeningLink = screen.getByText('Try Screening').closest('a');
    expect(tryScreeningLink).toHaveAttribute('href', '/screening');
  });

  it('should render Why Mental Health Matters section', () => {
    vi.mocked(authModule.useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      isLoggingOut: false,
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(screen.getByText('Why Mental Health Matters')).toBeTruthy();
  });

  it('should render hero subtitle text', () => {
    vi.mocked(authModule.useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      isLoggingOut: false,
    });

    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(
      screen.getByText(/Take control of your mental well-being/)
    ).toBeTruthy();
  });
});
