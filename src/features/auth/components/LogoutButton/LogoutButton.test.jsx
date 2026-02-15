import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LogoutButton from './LogoutButton';

const mockLogoutWithTransition = vi.fn();

vi.mock('../../hooks/useAuth', () => ({
  default: () => ({
    logoutWithTransition: mockLogoutWithTransition,
  }),
}));

describe('LogoutButton', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render logout button', () => {
    render(
      <MemoryRouter>
        <LogoutButton />
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: /logout/i });
    expect(button).toBeTruthy();
  });

  it('should call logoutWithTransition when clicked', () => {
    render(
      <MemoryRouter>
        <LogoutButton />
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(button);

    expect(mockLogoutWithTransition).toHaveBeenCalledTimes(1);
  });

  it('should render custom children when provided', () => {
    render(
      <MemoryRouter>
        <LogoutButton>Sign Out</LogoutButton>
      </MemoryRouter>
    );

    expect(screen.getByText('Sign Out')).toBeTruthy();
  });

  it('should use custom className when provided', () => {
    render(
      <MemoryRouter>
        <LogoutButton className="custom-class" />
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: /logout/i });
    expect(button.className).toBe('custom-class');
  });

  it('should use default className when not provided', () => {
    render(
      <MemoryRouter>
        <LogoutButton />
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: /logout/i });
    expect(button.className).toBe('logout-btn');
  });

  it('should be accessible', () => {
    render(
      <MemoryRouter>
        <LogoutButton />
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: /logout/i });
    expect(button).toHaveProperty('type', 'button');
  });

  it('should handle multiple clicks gracefully', () => {
    render(
      <MemoryRouter>
        <LogoutButton />
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(button);
    fireEvent.click(button);
    fireEvent.click(button);

    expect(mockLogoutWithTransition).toHaveBeenCalledTimes(3);
  });
});
