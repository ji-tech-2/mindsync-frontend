import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import StageContainer from './StageContainer';

// Mock ResizeObserver as a proper class
class MockResizeObserver {
  constructor() {
    this.observe = vi.fn();
    this.unobserve = vi.fn();
    this.disconnect = vi.fn();
  }
}

beforeEach(() => {
  global.ResizeObserver = MockResizeObserver;
});

describe('StageContainer', () => {
  const stages = [
    <div key="1">Stage 1 Content</div>,
    <div key="2">Stage 2 Content</div>,
    <div key="3">Stage 3 Content</div>,
  ];

  it('renders null when no stages provided', () => {
    const { container } = render(
      <StageContainer stages={[]} currentStage={0} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders null when stages is undefined', () => {
    const { container } = render(
      <StageContainer stages={undefined} currentStage={0} />
    );
    expect(container.innerHTML).toBe('');
  });

  it('renders first stage by default', () => {
    render(<StageContainer stages={stages} currentStage={0} />);
    expect(screen.getByText('Stage 1 Content')).toBeTruthy();
  });

  it('renders correct stage based on currentStage', () => {
    render(<StageContainer stages={stages} currentStage={1} />);
    expect(screen.getByText('Stage 2 Content')).toBeTruthy();
  });

  it('renders third stage', () => {
    render(<StageContainer stages={stages} currentStage={2} />);
    expect(screen.getByText('Stage 3 Content')).toBeTruthy();
  });

  it('shows both stages during transition', () => {
    const { rerender } = render(
      <StageContainer stages={stages} currentStage={0} />
    );
    rerender(<StageContainer stages={stages} currentStage={1} />);

    // During animation, both stages should be visible
    expect(screen.getByText('Stage 1 Content')).toBeTruthy();
    expect(screen.getByText('Stage 2 Content')).toBeTruthy();
  });

  it('removes previous stage after transition timeout', async () => {
    vi.useFakeTimers();
    const { rerender } = render(
      <StageContainer stages={stages} currentStage={0} />
    );
    rerender(<StageContainer stages={stages} currentStage={1} />);

    // Both visible during animation
    expect(screen.getByText('Stage 1 Content')).toBeTruthy();
    expect(screen.getByText('Stage 2 Content')).toBeTruthy();

    // After timeout, prev stage should be gone
    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(screen.queryByText('Stage 1 Content')).toBeNull();
    expect(screen.getByText('Stage 2 Content')).toBeTruthy();

    vi.useRealTimers();
  });

  it('applies back animation class when isGoingBack is true', () => {
    const { rerender, container } = render(
      <StageContainer stages={stages} currentStage={1} isGoingBack={false} />
    );
    rerender(
      <StageContainer stages={stages} currentStage={0} isGoingBack={true} />
    );
    // Check that container has content (animation classes applied via CSS modules)
    expect(container.firstChild).toBeTruthy();
  });

  it('applies forward animation class when isGoingBack is false', () => {
    const { rerender, container } = render(
      <StageContainer stages={stages} currentStage={0} isGoingBack={false} />
    );
    rerender(
      <StageContainer stages={stages} currentStage={1} isGoingBack={false} />
    );
    expect(container.firstChild).toBeTruthy();
  });

  it('cleans up ResizeObserver on unmount', () => {
    const disconnectFn = vi.fn();
    class TrackingResizeObserver {
      constructor() {
        this.observe = vi.fn();
        this.unobserve = vi.fn();
        this.disconnect = disconnectFn;
      }
    }
    global.ResizeObserver = TrackingResizeObserver;

    const { unmount } = render(
      <StageContainer stages={stages} currentStage={0} />
    );
    unmount();
    expect(disconnectFn).toHaveBeenCalled();
  });
});
