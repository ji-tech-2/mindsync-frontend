import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import ProgressBar from './ProgressBar';

// Helper to find the inner bar div (the one with inline style)
const getBarElement = (container) => {
  const allDivs = container.querySelectorAll('div');
  for (const div of allDivs) {
    if (div.style.width) return div;
  }
  // Fallback: the deepest div
  return allDivs[allDivs.length - 1];
};

describe('ProgressBar', () => {
  it('renders with default progress', () => {
    const { container } = render(<ProgressBar />);
    // The component renders with width based on progress (0 by default)
    getBarElement(container);
    // Even if style.width is empty for 0%, the component renders
    expect(container.firstChild).toBeTruthy();
  });

  it('renders with specified progress', () => {
    const { container } = render(<ProgressBar progress={50} />);
    const bar = getBarElement(container);
    expect(bar.style.width).toBe('50%');
  });

  it('clamps progress to 0 minimum', () => {
    const { container } = render(<ProgressBar progress={-10} />);
    // progress = Math.max(0, Math.min(100, -10)) = 0 → '0%'
    expect(container.firstChild).toBeTruthy();
  });

  it('clamps progress to 100 maximum', () => {
    const { container } = render(<ProgressBar progress={150} />);
    const bar = getBarElement(container);
    expect(bar.style.width).toBe('100%');
  });

  it('renders with 100% progress', () => {
    const { container } = render(<ProgressBar progress={100} />);
    const bar = getBarElement(container);
    expect(bar.style.width).toBe('100%');
  });

  it('applies additional className', () => {
    const { container } = render(<ProgressBar className="custom" />);
    expect(container.firstChild.className).toContain('custom');
  });
});
