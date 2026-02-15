import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import * as authModule from '@/features/auth';

// Mock auth module (some child routes might use it)
vi.mock('@/features/auth', () => ({
  useAuth: vi.fn(),
}));

describe('AuthLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock: not logged in
    vi.mocked(authModule.useAuth).mockReturnValue({
      user: null,
      isLoading: false,
    });
  });
  it('should render the layout with footer', () => {
    const TestChild = () => <div>Test Child Component</div>;

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/" element={<TestChild />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Test Child Component')).toBeTruthy();
  });

  it('should render outlet content', () => {
    const TestContent = () => <div data-testid="outlet-content">Content</div>;

    render(
      <MemoryRouter initialEntries={['/test']}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/test" element={<TestContent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('outlet-content')).toBeTruthy();
  });

  it('should have correct layout structure', () => {
    const TestChild = () => <div>Test</div>;

    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/" element={<TestChild />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const layoutDiv = container.querySelector(
      'div[style*="display: flex"][style*="flex-direction: column"]'
    );
    expect(layoutDiv).toBeTruthy();
  });

  it('should render different child routes', () => {
    const Route2 = () => <div data-testid="route-2">Route 2</div>;

    render(
      <MemoryRouter initialEntries={['/route2']}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/route2" element={<Route2 />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('route-2')).toBeTruthy();
    expect(screen.getByText('Route 2')).toBeTruthy();
  });

  it('should apply minimum height styling', () => {
    const TestChild = () => <div>Test</div>;

    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<AuthLayout />}>
            <Route path="/" element={<TestChild />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const layoutDiv = container.querySelector(
      'div[style*="min-height: 100vh"]'
    );
    expect(layoutDiv).toBeTruthy();
  });
});
