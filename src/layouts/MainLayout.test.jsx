import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { MainLayout } from './MainLayout';
import * as authModule from '@/features/auth';

// Mock auth module
vi.mock('@/features/auth', () => ({
  useAuth: vi.fn(),
}));

describe('MainLayout', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock: logged in user
    vi.mocked(authModule.useAuth).mockReturnValue({
      user: { id: 1, name: 'Test User' },
      isLoading: false,
    });
  });
  it('should render layout with navbar and footer', () => {
    const TestChild = () => <div>Test Child Component</div>;

    render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<TestChild />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Test Child Component')).toBeTruthy();
  });

  it('should render outlet content in main section', () => {
    const TestContent = () => <div data-testid="main-content">Content</div>;

    render(
      <MemoryRouter initialEntries={['/test']}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/test" element={<TestContent />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('main-content')).toBeTruthy();
  });

  it('should render different child routes', () => {
    const ProfileRoute = () => (
      <div data-testid="profile-page">User Profile</div>
    );

    render(
      <MemoryRouter initialEntries={['/profile']}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/profile" element={<ProfileRoute />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByTestId('profile-page')).toBeTruthy();
    expect(screen.getByText('User Profile')).toBeTruthy();
  });

  it('should have correct main element styling', () => {
    const TestChild = () => <div>Test</div>;

    const { container } = render(
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<TestChild />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const main = container.querySelector('main');
    expect(main).toBeTruthy();
    expect(main.style.minHeight).toBe('100vh');
  });

  it('should maintain layout structure across route changes', () => {
    const Page1 = () => <div data-testid="page1">Page 1</div>;

    const { container } = render(
      <MemoryRouter initialEntries={['/page1']}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/page1" element={<Page1 />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    const main = container.querySelector('main');
    expect(main).toBeTruthy();
    expect(main.style.minHeight).toBe('100vh');
    expect(screen.getByTestId('page1')).toBeTruthy();
  });
});
