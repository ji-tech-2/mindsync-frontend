import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import SegmentedControl from './SegmentedControl';

describe('SegmentedControl Component', () => {
  const options = [
    { label: 'Daily', value: 'daily' },
    { label: 'Weekly', value: 'weekly' },
  ];

  it('renders all options', () => {
    render(
      <SegmentedControl options={options} value="daily" onChange={() => {}} />
    );
    expect(screen.getByText('Daily')).toBeInTheDocument();
    expect(screen.getByText('Weekly')).toBeInTheDocument();
  });

  it('highlights the active option', () => {
    render(
      <SegmentedControl options={options} value="weekly" onChange={() => {}} />
    );
    const weeklyBtn = screen.getByRole('tab', { name: 'Weekly' });
    const dailyBtn = screen.getByRole('tab', { name: 'Daily' });

    expect(weeklyBtn.className).toMatch(/active/);
    expect(dailyBtn.className).not.toMatch(/active/);
    expect(weeklyBtn).toHaveAttribute('aria-selected', 'true');
    expect(dailyBtn).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onChange when an option is clicked', () => {
    const handleChange = vi.fn();
    render(
      <SegmentedControl
        options={options}
        value="daily"
        onChange={handleChange}
      />
    );

    fireEvent.click(screen.getByText('Weekly'));
    expect(handleChange).toHaveBeenCalledWith('weekly');
  });

  it('applies fullWidth class', () => {
    const { container } = render(
      <SegmentedControl options={options} value="daily" fullWidth />
    );
    expect(container.firstChild.className).toMatch(/fullWidth/);
  });

  it('applies small size class', () => {
    const { container } = render(
      <SegmentedControl options={options} value="daily" size="sm" />
    );
    expect(container.firstChild.className).toMatch(/sm/);
  });
});
