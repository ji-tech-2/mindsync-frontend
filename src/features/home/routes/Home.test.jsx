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

  it('should render welcome section when not logged in', () => {
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

    expect(screen.getByText('Welcome')).toBeTruthy();
    expect(screen.getByText('Mental Wellness Advisor')).toBeTruthy();
    expect(
      screen.getByText('Start your mental health journey today.')
    ).toBeTruthy();
  });

  it('should render action cards for anonymous users', () => {
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

    expect(screen.getByText('Take Mental Health Test')).toBeTruthy();
    expect(screen.getByText('Login / Sign Up')).toBeTruthy();
    expect(
      screen.getByText(
        'Start evaluating your mental condition without an account.'
      )
    ).toBeTruthy();
    expect(
      screen.getByText('Sign up to save your results and history.')
    ).toBeTruthy();
  });

  it('should navigate to screening when take test card is clicked', async () => {
    vi.mocked(authModule.useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      isLoggingOut: false,
    });

    const { container } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const actionCards = container.querySelectorAll('.action-card');
    const testCard = actionCards[0];

    testCard.click();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/screening');
    });
  });

  it('should navigate to signin when login card is clicked', async () => {
    vi.mocked(authModule.useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      isLoggingOut: false,
    });

    const { container } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    const actionCards = container.querySelectorAll('.action-card');
    const loginCard = actionCards[1];

    loginCard.click();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/signin');
    });
  });

  it('should have proper CSS classes for styling', () => {
    vi.mocked(authModule.useAuth).mockReturnValue({
      user: null,
      isLoading: false,
      isLoggingOut: false,
    });

    const { container } = render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );

    expect(container.querySelector('.dashboard-container')).toBeTruthy();
    expect(container.querySelector('.dashboard-header')).toBeTruthy();
    expect(container.querySelector('.logged-out-header')).toBeTruthy();
    expect(container.querySelector('.quick-actions')).toBeTruthy();
    expect(container.querySelector('.actions-grid.two-columns')).toBeTruthy();
  });
});
