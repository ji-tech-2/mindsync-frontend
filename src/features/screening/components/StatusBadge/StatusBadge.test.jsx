import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatusBadge from './StatusBadge';

describe('StatusBadge', () => {
  it('renders HEALTHY label for healthy category', () => {
    render(<StatusBadge category="healthy" />);
    expect(screen.getByText('HEALTHY')).toBeTruthy();
  });

  it('renders AVERAGE label for average category', () => {
    render(<StatusBadge category="average" />);
    expect(screen.getByText('AVERAGE')).toBeTruthy();
  });

  it('renders NOT HEALTHY label for not healthy category', () => {
    render(<StatusBadge category="not healthy" />);
    expect(screen.getByText('NOT HEALTHY')).toBeTruthy();
  });

  it('renders DANGEROUS label for dangerous category', () => {
    render(<StatusBadge category="dangerous" />);
    expect(screen.getByText('DANGEROUS')).toBeTruthy();
  });

  it('renders HEALTHY as default for unknown category', () => {
    render(<StatusBadge category="something-else" />);
    expect(screen.getByText('HEALTHY')).toBeTruthy();
  });

  it('applies correct color for dangerous', () => {
    const { container } = render(<StatusBadge category="dangerous" />);
    expect(container.firstChild.style.backgroundColor).toBe('var(--color-red)');
  });

  it('applies correct color for not healthy', () => {
    const { container } = render(<StatusBadge category="not healthy" />);
    expect(container.firstChild.style.backgroundColor).toBe(
      'var(--color-orange)'
    );
  });

  it('applies correct color for average', () => {
    const { container } = render(<StatusBadge category="average" />);
    expect(container.firstChild.style.backgroundColor).toBe(
      'var(--color-yellow)'
    );
  });

  it('applies correct color for healthy', () => {
    const { container } = render(<StatusBadge category="healthy" />);
    expect(container.firstChild.style.backgroundColor).toBe(
      'var(--color-green)'
    );
  });

  it('applies additional className', () => {
    const { container } = render(
      <StatusBadge category="healthy" className="custom" />
    );
    expect(container.firstChild.className).toContain('custom');
  });
});
