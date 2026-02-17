import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ScoreDisplay from './ScoreDisplay';

describe('ScoreDisplay', () => {
  it('renders rounded score', () => {
    render(<ScoreDisplay score={75.6} category="healthy" />);
    expect(screen.getByText('76')).toBeTruthy();
    expect(screen.getByText('/100')).toBeTruthy();
  });

  it('renders integer score', () => {
    render(<ScoreDisplay score={50} category="average" />);
    expect(screen.getByText('50')).toBeTruthy();
  });

  it('applies green color for healthy category', () => {
    const { container } = render(
      <ScoreDisplay score={80} category="healthy" />
    );
    const circle =
      container.querySelector('[class*="scoreCircle"]') ||
      container.firstChild.firstChild;
    expect(circle.style.borderColor).toBe('var(--color-green)');
    expect(circle.style.color).toBe('var(--color-green)');
  });

  it('applies yellow color for average category', () => {
    const { container } = render(
      <ScoreDisplay score={50} category="average" />
    );
    const circle =
      container.querySelector('[class*="scoreCircle"]') ||
      container.firstChild.firstChild;
    expect(circle.style.borderColor).toBe('var(--color-yellow)');
  });

  it('applies orange color for not healthy category', () => {
    const { container } = render(
      <ScoreDisplay score={20} category="not healthy" />
    );
    const circle =
      container.querySelector('[class*="scoreCircle"]') ||
      container.firstChild.firstChild;
    expect(circle.style.borderColor).toBe('var(--color-orange)');
  });

  it('applies red color for dangerous category', () => {
    const { container } = render(
      <ScoreDisplay score={5} category="dangerous" />
    );
    const circle =
      container.querySelector('[class*="scoreCircle"]') ||
      container.firstChild.firstChild;
    expect(circle.style.borderColor).toBe('var(--color-red)');
  });

  it('applies additional className', () => {
    const { container } = render(
      <ScoreDisplay score={50} category="healthy" className="custom" />
    );
    expect(container.firstChild.className).toContain('custom');
  });
});
