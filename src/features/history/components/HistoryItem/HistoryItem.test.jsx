import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import HistoryItem from './HistoryItem';

describe('HistoryItem', () => {
  const defaultProps = {
    date: '2024-01-15T10:00:00Z',
    score: 75,
    category: 'healthy',
    onClick: vi.fn(),
  };

  it('renders the formatted date', () => {
    render(<HistoryItem {...defaultProps} />);
    // Date formatted in en-US using the browser's local timezone
    expect(screen.getByText(/January/)).toBeTruthy();
    expect(screen.getByText(/2024/)).toBeTruthy();
  });

  it('renders the score', () => {
    render(<HistoryItem {...defaultProps} />);
    expect(screen.getByText('75')).toBeTruthy();
    expect(screen.getByText('/100')).toBeTruthy();
  });

  it('renders healthy badge', () => {
    render(<HistoryItem {...defaultProps} category="healthy" />);
    expect(screen.getByText('Healthy')).toBeTruthy();
  });

  it('renders average badge', () => {
    render(<HistoryItem {...defaultProps} category="average" />);
    expect(screen.getByText('Average')).toBeTruthy();
  });

  it('renders not healthy badge', () => {
    render(<HistoryItem {...defaultProps} category="not healthy" />);
    expect(screen.getByText('Not Healthy')).toBeTruthy();
  });

  it('renders dangerous badge', () => {
    render(<HistoryItem {...defaultProps} category="dangerous" />);
    expect(screen.getByText('Dangerous')).toBeTruthy();
  });

  it('renders unknown badge for null category', () => {
    render(<HistoryItem {...defaultProps} category={null} />);
    expect(screen.getByText('Unknown')).toBeTruthy();
  });

  it('renders unknown category for unrecognized value', () => {
    render(<HistoryItem {...defaultProps} category="something-else" />);
    expect(screen.getByText('something-else')).toBeTruthy();
  });

  it('calls onClick when clicked', () => {
    const onClick = vi.fn();
    render(<HistoryItem {...defaultProps} onClick={onClick} />);
    const item = screen.getByRole('button');
    fireEvent.click(item);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('calls onClick on Enter key press', () => {
    const onClick = vi.fn();
    render(<HistoryItem {...defaultProps} onClick={onClick} />);
    const item = screen.getByRole('button');
    fireEvent.keyPress(item, { key: 'Enter', charCode: 13 });
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('has proper accessibility attributes', () => {
    render(<HistoryItem {...defaultProps} />);
    const item = screen.getByRole('button');
    expect(item.tabIndex).toBe(0);
  });
});
