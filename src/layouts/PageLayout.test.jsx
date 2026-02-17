import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PageLayout from './PageLayout';

describe('PageLayout', () => {
  it('renders title', () => {
    render(<PageLayout title="Dashboard">Content</PageLayout>);
    expect(screen.getByText('Dashboard')).toBeTruthy();
  });

  it('renders children', () => {
    render(
      <PageLayout title="Test">
        <p>Hello World</p>
      </PageLayout>
    );
    expect(screen.getByText('Hello World')).toBeTruthy();
  });

  it('renders headerRight when provided', () => {
    render(
      <PageLayout title="Test" headerRight={<button>Action</button>}>
        Content
      </PageLayout>
    );
    expect(screen.getByText('Action')).toBeTruthy();
  });

  it('does not render headerRight div when not provided', () => {
    const { container } = render(<PageLayout title="Test">Content</PageLayout>);
    // Only the title should be in the header, no extra div
    const header = container.querySelector('header');
    expect(header.children.length).toBe(1); // just h1
  });
});
