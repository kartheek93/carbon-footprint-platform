/**
 * Component tests for key UI elements
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ActivityLogger from '../src/components/ActivityLogger.jsx';
import ActivityHistory from '../src/components/ActivityHistory.jsx';
import BadgeToast from '../src/components/BadgeToast.jsx';
import Dashboard from '../src/components/Dashboard.jsx';

// ─── ActivityLogger ───────────────────────────────────────────────────────────

describe('ActivityLogger', () => {
  it('renders the form', () => {
    render(<ActivityLogger onAdd={vi.fn()} />);
    expect(screen.getByLabelText(/log a new activity/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/activity type/i)).toBeInTheDocument();
  });

  it('disables submit button when amount is empty', () => {
    render(<ActivityLogger onAdd={vi.fn()} />);
    const btn = screen.getByRole('button', { name: /log activity/i });
    expect(btn).toBeDisabled();
  });

  it('enables submit button when valid amount entered', () => {
    render(<ActivityLogger onAdd={vi.fn()} />);
    const input = screen.getByLabelText(/distance/i);
    fireEvent.change(input, { target: { value: '100' } });
    const btn = screen.getByRole('button', { name: /log activity/i });
    expect(btn).not.toBeDisabled();
  });

  it('calls onAdd with correct data when submitted', () => {
    const onAdd = vi.fn().mockReturnValue(true);
    render(<ActivityLogger onAdd={onAdd} />);
    const input = screen.getByLabelText(/distance/i);
    fireEvent.change(input, { target: { value: '50' } });
    const btn = screen.getByRole('button', { name: /log activity/i });
    fireEvent.click(btn);
    expect(onAdd).toHaveBeenCalledOnce();
    const arg = onAdd.mock.calls[0][0];
    expect(arg.category).toBe('transport');
    expect(arg.emissionKg).toBeGreaterThan(0);
  });

  it('shows error message when error prop provided', () => {
    render(<ActivityLogger onAdd={vi.fn()} error="Test error" />);
    expect(screen.getByRole('alert')).toHaveTextContent('Test error');
  });

  it('shows emission preview when amount is entered', () => {
    render(<ActivityLogger onAdd={vi.fn()} />);
    const input = screen.getByLabelText(/distance/i);
    fireEvent.change(input, { target: { value: '100' } });
    expect(screen.getByText(/estimated emission/i)).toBeInTheDocument();
  });

  it('category buttons are accessible with aria-pressed', () => {
    render(<ActivityLogger onAdd={vi.fn()} />);
    const transportBtn = screen.getByRole('button', { name: /transport/i });
    expect(transportBtn).toHaveAttribute('aria-pressed', 'true');
  });
});

// ─── ActivityHistory ──────────────────────────────────────────────────────────

describe('ActivityHistory', () => {
  it('shows empty state message when no entries', () => {
    render(<ActivityHistory entries={[]} onDelete={vi.fn()} />);
    expect(screen.getByText(/no activities logged yet/i)).toBeInTheDocument();
  });

  it('renders entries in the list', () => {
    const entries = [
      {
        id: '1', category: 'transport', activityType: 'car_petrol',
        emissionKg: 10, date: '2024-01-15T10:00:00Z', notes: '',
      },
    ];
    render(<ActivityHistory entries={entries} onDelete={vi.fn()} />);
    expect(screen.getByText(/car petrol/i)).toBeInTheDocument();
  });

  it('calls onDelete when delete button clicked', () => {
    const onDelete = vi.fn();
    const entries = [
      {
        id: 'del_test', category: 'food', activityType: 'beef',
        emissionKg: 5, date: '2024-01-10T00:00:00Z', notes: '',
      },
    ];
    render(<ActivityHistory entries={entries} onDelete={onDelete} />);
    const deleteBtn = screen.getByRole('button', { name: /delete/i });
    fireEvent.click(deleteBtn);
    expect(onDelete).toHaveBeenCalledWith('del_test');
  });

  it('has accessible filter controls', () => {
    render(<ActivityHistory entries={[]} onDelete={vi.fn()} />);
    expect(screen.getByRole('group', { name: /filter and sort/i })).toBeInTheDocument();
  });
});

// ─── BadgeToast ───────────────────────────────────────────────────────────────

describe('BadgeToast', () => {
  it('renders nothing when badge is null', () => {
    const { container } = render(<BadgeToast badge={null} />);
    expect(container.firstChild).toBeNull();
  });

  it('renders badge information when provided', () => {
    const badge = { id: 'first_log', icon: '🌱', label: 'First Step', description: 'Logged first activity' };
    render(<BadgeToast badge={badge} />);
    expect(screen.getByText('First Step')).toBeInTheDocument();
    expect(screen.getByText('Logged first activity')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });
});

// ─── Dashboard ────────────────────────────────────────────────────────────────

describe('Dashboard', () => {
  const defaultProps = {
    entries: [],
    totalKg: 0,
    byCategory: {},
    annualProjection: 0,
    streak: 0,
    earnedBadges: [],
  };

  it('renders stat cards', () => {
    render(<Dashboard {...defaultProps} />);
    expect(screen.getByLabelText(/carbon footprint summary/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/total logged/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/annual projection/i)).toBeInTheDocument();
  });

  it('renders benchmarks section', () => {
    render(<Dashboard {...defaultProps} />);
    expect(screen.getByText(/how you compare/i)).toBeInTheDocument();
    expect(screen.getByText(/paris target/i)).toBeInTheDocument();
    expect(screen.getByText(/global average/i)).toBeInTheDocument();
  });

  it('shows empty chart messages when no data', () => {
    render(<Dashboard {...defaultProps} />);
    expect(screen.getAllByText(/log some activities|no data yet/i).length).toBeGreaterThan(0);
  });

  it('shows positive comparison when under global average', () => {
    render(<Dashboard {...defaultProps} annualProjection={2000} />);
    expect(screen.getByText(/below the global average/i)).toBeInTheDocument();
  });
});
