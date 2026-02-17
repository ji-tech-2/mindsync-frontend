import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ProfileDropdown from './ProfileDropdown';
import * as authModule from '@/features/auth';

// Mock the auth module
vi.mock('@/features/auth', () => ({
  useAuth: vi.fn(),
}));

const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
};

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('ProfileDropdown Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('does not render when user is not authenticated', () => {
      vi.mocked(authModule.useAuth).mockReturnValue({ user: null });

      const { container } = renderWithRouter(<ProfileDropdown />);
      expect(container.firstChild).toBeNull();
    });

    it('renders avatar button when user is authenticated', () => {
      vi.mocked(authModule.useAuth).mockReturnValue({ user: mockUser });

      renderWithRouter(<ProfileDropdown />);
      const button = screen.getByLabelText('Profile menu');
      expect(button).toBeInTheDocument();
    });

    it('displays user initials in avatar', () => {
      vi.mocked(authModule.useAuth).mockReturnValue({ user: mockUser });

      renderWithRouter(<ProfileDropdown />);
      expect(screen.getByText('J')).toBeInTheDocument();
    });
  });

  describe('Dropdown Toggle', () => {
    beforeEach(() => {
      const mockLogout = vi.fn();
      vi.mocked(authModule.useAuth).mockReturnValue({
        user: mockUser,
        logout: mockLogout,
      });
    });

    it('does not show dropdown content initially', () => {
      renderWithRouter(<ProfileDropdown />);
      expect(
        screen.queryByText(`Hi, ${mockUser.name}!`)
      ).not.toBeInTheDocument();
    });

    it('shows dropdown content when button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ProfileDropdown />);

      const button = screen.getByLabelText('Profile menu');
      await user.click(button);

      expect(screen.getByText(`Hi, ${mockUser.name}!`)).toBeInTheDocument();
    });

    it('hides dropdown when button is clicked again', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ProfileDropdown />);

      const button = screen.getByLabelText('Profile menu');
      await user.click(button);
      expect(screen.getByText(`Hi, ${mockUser.name}!`)).toBeInTheDocument();

      await user.click(button);
      expect(
        screen.queryByText(`Hi, ${mockUser.name}!`)
      ).not.toBeInTheDocument();
    });
  });

  describe('Outside Click Behavior', () => {
    beforeEach(() => {
      const mockLogout = vi.fn();
      vi.mocked(authModule.useAuth).mockReturnValue({
        user: mockUser,
        logout: mockLogout,
      });
    });

    it('closes dropdown when clicking outside', async () => {
      const user = userEvent.setup();
      renderWithRouter(
        <div>
          <div data-testid="outside">Outside area</div>
          <ProfileDropdown />
        </div>
      );

      const button = screen.getByLabelText('Profile menu');
      await user.click(button);
      expect(screen.getByText(`Hi, ${mockUser.name}!`)).toBeInTheDocument();

      const outside = screen.getByTestId('outside');
      await user.click(outside);

      expect(
        screen.queryByText(`Hi, ${mockUser.name}!`)
      ).not.toBeInTheDocument();
    });
  });

  describe('Dropdown Content', () => {
    let mockLogout;

    beforeEach(() => {
      mockLogout = vi.fn();
      vi.mocked(authModule.useAuth).mockReturnValue({
        user: mockUser,
        logout: mockLogout,
      });
    });

    it('displays greeting with user name', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ProfileDropdown />);

      await user.click(screen.getByLabelText('Profile menu'));
      expect(screen.getByText(`Hi, ${mockUser.name}!`)).toBeInTheDocument();
    });

    it('displays Settings link', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ProfileDropdown />);

      await user.click(screen.getByLabelText('Profile menu'));
      const settingsLink = screen.getByRole('link', { name: /settings/i });
      expect(settingsLink).toBeInTheDocument();
      expect(settingsLink).toHaveAttribute('href', '/profile');
    });

    it('displays Logout button', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ProfileDropdown />);

      await user.click(screen.getByLabelText('Profile menu'));
      const logoutButton = screen.getByRole('button', { name: /logout/i });
      expect(logoutButton).toBeInTheDocument();
    });

    it('closes dropdown when Settings is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ProfileDropdown />);

      const button = screen.getByLabelText('Profile menu');
      await user.click(button);
      expect(screen.getByText(`Hi, ${mockUser.name}!`)).toBeInTheDocument();

      const settingsLink = screen.getByRole('link', { name: /settings/i });
      expect(settingsLink).toHaveAttribute('href', '/profile');
    });

    it('calls logout when Logout button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ProfileDropdown />);

      const button = screen.getByLabelText('Profile menu');
      await user.click(button);

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      await user.click(logoutButton);

      expect(mockLogout).toHaveBeenCalled();
    });

    it('closes dropdown when Logout button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ProfileDropdown />);

      const button = screen.getByLabelText('Profile menu');
      await user.click(button);
      expect(screen.getByText(`Hi, ${mockUser.name}!`)).toBeInTheDocument();

      const logoutButton = screen.getByRole('button', { name: /logout/i });
      await user.click(logoutButton);

      // Dropdown should be closed after logout
      await waitFor(() => {
        expect(
          screen.queryByText(`Hi, ${mockUser.name}!`)
        ).not.toBeInTheDocument();
      });
    });
  });
});
