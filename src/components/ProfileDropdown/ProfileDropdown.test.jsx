import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import ProfileDropdown from './ProfileDropdown';
import * as authModule from '@/features/auth';

// Mock the auth module
vi.mock('@/features/auth', () => ({
  useAuth: vi.fn(),
  LogoutButton: () => <button>Logout</button>,
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
      expect(container.firstChild).toBeEmptyDOMElement();
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
      vi.mocked(authModule.useAuth).mockReturnValue({ user: mockUser });
    });

    it('does not show dropdown content initially', () => {
      renderWithRouter(<ProfileDropdown />);
      expect(screen.queryByText(mockUser.email)).not.toBeInTheDocument();
      expect(
        screen.queryByText(`Hello, ${mockUser.name}!`)
      ).not.toBeInTheDocument();
    });

    it('shows dropdown content when button is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ProfileDropdown />);

      const button = screen.getByLabelText('Profile menu');
      await user.click(button);

      expect(screen.getByText(mockUser.email)).toBeInTheDocument();
      expect(screen.getByText(`Hello, ${mockUser.name}!`)).toBeInTheDocument();
    });

    it('hides dropdown when button is clicked again', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ProfileDropdown />);

      const button = screen.getByLabelText('Profile menu');
      await user.click(button);
      expect(screen.getByText(mockUser.email)).toBeInTheDocument();

      await user.click(button);
      expect(screen.queryByText(mockUser.email)).not.toBeInTheDocument();
    });
  });

  describe('Outside Click Behavior', () => {
    beforeEach(() => {
      vi.mocked(authModule.useAuth).mockReturnValue({ user: mockUser });
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
      expect(screen.getByText(mockUser.email)).toBeInTheDocument();

      const outside = screen.getByTestId('outside');
      await user.click(outside);

      expect(screen.queryByText(mockUser.email)).not.toBeInTheDocument();
    });
  });

  describe('Dropdown Content', () => {
    beforeEach(() => {
      vi.mocked(authModule.useAuth).mockReturnValue({ user: mockUser });
    });

    it('displays user email in header', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ProfileDropdown />);

      await user.click(screen.getByLabelText('Profile menu'));
      expect(screen.getByText(mockUser.email)).toBeInTheDocument();
    });

    it('displays greeting with user name', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ProfileDropdown />);

      await user.click(screen.getByLabelText('Profile menu'));
      expect(screen.getByText(`Hello, ${mockUser.name}!`)).toBeInTheDocument();
    });

    it('displays Edit Profile link', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ProfileDropdown />);

      await user.click(screen.getByLabelText('Profile menu'));
      const editLink = screen.getByRole('link', { name: /edit profile/i });
      expect(editLink).toHaveAttribute('href', '/profile');
    });

    it('displays Logout button', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ProfileDropdown />);

      await user.click(screen.getByLabelText('Profile menu'));
      expect(screen.getByText('Logout')).toBeInTheDocument();
    });

    it('closes dropdown when Edit Profile is clicked', async () => {
      const user = userEvent.setup();
      renderWithRouter(<ProfileDropdown />);

      const button = screen.getByLabelText('Profile menu');
      await user.click(button);
      expect(screen.getByText(mockUser.email)).toBeInTheDocument();

      const editLink = screen.getByRole('link', { name: /edit profile/i });
      await user.click(editLink);

      // Dropdown should be closed after navigation
      await waitFor(() => {
        expect(screen.queryByText(mockUser.email)).not.toBeInTheDocument();
      });
    });
  });
});
