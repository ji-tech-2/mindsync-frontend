import { BrowserRouter } from 'react-router-dom';
import ProfileDropdown from './ProfileDropdown';
import * as authModule from '@/features/auth';
import { vi } from 'vitest';

// Mock the auth module for stories
vi.mock('@/features/auth', () => ({
  useAuth: vi.fn(),
  LogoutButton: () => (
    <button
      style={{
        width: '100%',
        padding: '0.75rem',
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        fontWeight: '500',
        cursor: 'pointer',
      }}
    >
      Logout
    </button>
  ),
}));

const mockUser = {
  name: 'John Doe',
  email: 'john@example.com',
};

export default {
  title: 'Components/ProfileDropdown',
  component: ProfileDropdown,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  decorators: [
    () => (
      <BrowserRouter>
        <div
          style={{
            padding: '2rem',
            backgroundColor: '#f5f5f5',
            minHeight: '400px',
          }}
        >
          <Story />
        </div>
      </BrowserRouter>
    ),
  ],
};

export const Default = {
  args: {},
  beforeEach: () => {
    vi.mocked(authModule.useAuth).mockReturnValue({ user: mockUser });
  },
  render: () => {
    vi.mocked(authModule.useAuth).mockReturnValue({ user: mockUser });
    return <ProfileDropdown />;
  },
};

export const NotAuthenticated = {
  args: {},
  beforeEach: () => {
    vi.mocked(authModule.useAuth).mockReturnValue({ user: null });
  },
  render: () => {
    vi.mocked(authModule.useAuth).mockReturnValue({ user: null });
    return <ProfileDropdown />;
  },
};

export const DifferentUser = {
  args: {},
  beforeEach: () => {
    vi.mocked(authModule.useAuth).mockReturnValue({
      user: {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
      },
    });
  },
  render: () => {
    vi.mocked(authModule.useAuth).mockReturnValue({
      user: {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
      },
    });
    return <ProfileDropdown />;
  },
};

export const LongEmail = {
  args: {},
  beforeEach: () => {
    vi.mocked(authModule.useAuth).mockReturnValue({
      user: {
        name: 'John Doe',
        email: 'verylongemail.address.example@companydomain.com',
      },
    });
  },
  render: () => {
    vi.mocked(authModule.useAuth).mockReturnValue({
      user: {
        name: 'John Doe',
        email: 'verylongemail.address.example@companydomain.com',
      },
    });
    return <ProfileDropdown />;
  },
};
