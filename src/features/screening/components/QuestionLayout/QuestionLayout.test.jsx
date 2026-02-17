import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import QuestionLayout from './QuestionLayout';

describe('QuestionLayout', () => {
  it('renders question text', () => {
    render(
      <QuestionLayout question="How are you feeling?">
        <input />
      </QuestionLayout>
    );
    expect(screen.getByText('How are you feeling?')).toBeTruthy();
  });

  it('renders children in input area', () => {
    render(
      <QuestionLayout question="Test">
        <button>Click me</button>
      </QuestionLayout>
    );
    expect(screen.getByText('Click me')).toBeTruthy();
  });

  it('renders question as h2', () => {
    render(
      <QuestionLayout question="My Question">
        <div />
      </QuestionLayout>
    );
    const heading = screen.getByRole('heading', { level: 2 });
    expect(heading.textContent).toBe('My Question');
  });

  it('applies additional className', () => {
    const { container } = render(
      <QuestionLayout question="Q" className="custom">
        <div />
      </QuestionLayout>
    );
    expect(container.firstChild.className).toContain('custom');
  });
});
