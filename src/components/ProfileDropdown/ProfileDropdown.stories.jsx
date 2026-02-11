import { BrowserRouter } from 'react-router-dom';
import ProfileDropdown from './ProfileDropdown';
import * as authModule from '@/features/auth';
import { vi } from 'vitest';

// Mock the auth module for stories
vi.mock('@/features/auth', () => ({
  useAuth: vi.fn(),
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
            backgroundColor: '#fffbea',
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
  render: () => {
    vi.mocked(authModule.useAuth).mockReturnValue({
      user: mockUser,
      logout: vi.fn(),
    });
    return <ProfileDropdown />;
  },
};

export const NotAuthenticated = {
  args: {},
  render: () => {
    vi.mocked(authModule.useAuth).mockReturnValue({
      user: null,
    });
    return <ProfileDropdown />;
  },
};

export const DifferentUser = {
  args: {},
  render: () => {
    vi.mocked(authModule.useAuth).mockReturnValue({
      user: {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
      },
      logout: vi.fn(),
    });
    return <ProfileDropdown />;
  },
};

export const LongName = {
  args: {},
  render: () => {
    vi.mocked(authModule.useAuth).mockReturnValue({
      user: {
        name: 'Christopher Alexander',
        email: 'christopher@example.com',
      },
      logout: vi.fn(),
    });
    return <ProfileDropdown />;
  },
};
