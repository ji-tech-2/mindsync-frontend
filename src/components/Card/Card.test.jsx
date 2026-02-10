import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Card from './Card';

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(<Card>Test Content</Card>);
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('applies padded class by default', () => {
    const { container } = render(<Card>Content</Card>);
    const card = container.firstChild;
    expect(card.className).toMatch(/padded/);
  });

  it('does not apply padded class when padded is false', () => {
    const { container } = render(<Card padded={false}>Content</Card>);
    const card = container.firstChild;
    expect(card.className).not.toMatch(/padded/);
  });

  it('applies custom className', () => {
    const { container } = render(<Card className="custom-class">Content</Card>);
    const card = container.firstChild;
    expect(card.className).toMatch(/custom-class/);
  });
});
