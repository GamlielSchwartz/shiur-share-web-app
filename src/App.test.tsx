import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Settings } from 'luxon';

// Stub the heavy react-big-calendar wrapper; we are testing orchestration
// (zip search -> location/timezone -> recomputed events), not the grid widget.
vi.mock('./components/CalendarView', () => ({
  default: ({ events }: { events: unknown[] }) => (
    <div data-testid="calendar">{events.length} events</div>
  ),
}));

import App from './App';

afterEach(() => {
  Settings.defaultZone = 'Asia/Jerusalem';
});

function heading() {
  return screen.getByRole('heading', { name: /times for/i });
}

describe('App integration', () => {
  it('defaults to Jerusalem and renders calendar events', () => {
    render(<App />);
    expect(heading()).toHaveTextContent('Times for Jerusalem');
    expect(screen.getByTestId('calendar')).toBeInTheDocument();
    expect(screen.getByTestId('calendar').textContent).toMatch(/\d+ events/);
  });

  it('switches to a searched zip code and its timezone', async () => {
    render(<App />);
    await userEvent.type(
      screen.getByRole('textbox', { name: /search by zip/i }),
      '90001{Enter}',
    );
    await waitFor(() =>
      expect(heading()).toHaveTextContent('Los Angeles, CA'),
    );
    expect(
      await screen.findByText(/showing times for los angeles, ca/i),
    ).toBeInTheDocument();
    expect(Settings.defaultZone.name).toBe('America/Los_Angeles');
  });

  it('surfaces an error for an unknown zip code without changing location', async () => {
    render(<App />);
    await userEvent.type(
      screen.getByRole('textbox', { name: /search by zip/i }),
      '00000{Enter}',
    );
    expect(
      await screen.findByText(/couldn't find zip code "00000"/i),
    ).toBeInTheDocument();
    expect(heading()).toHaveTextContent('Times for Jerusalem');
  });
});
