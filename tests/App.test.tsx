import { describe, it, expect, afterEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Settings } from 'luxon';

// Stub the heavy react-big-calendar wrapper; we are testing orchestration
// (zip search -> location/timezone -> recomputed events), not the grid widget.
vi.mock('../src/components/CalendarView', () => ({
  default: ({ events }: { events: unknown[] }) => (
    <div data-testid="calendar">{events.length} events</div>
  ),
}));

import App from '../src/App';

afterEach(() => {
  Settings.defaultZone = 'Asia/Jerusalem';
  vi.unstubAllGlobals();
});

function heading() {
  return screen.getByRole('heading', { name: /times for/i });
}

// Mock the zippopotam.us zip lookup. Only 90001 (Los Angeles) is known here;
// anything else returns a 404 so we can exercise the not-found path.
function stubZipApi() {
  vi.stubGlobal(
    'fetch',
    vi.fn(async (url: string) => {
      if (String(url).endsWith('/90001')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            'post code': '90001',
            places: [
              {
                'place name': 'Los Angeles',
                'state abbreviation': 'CA',
                latitude: '33.9731',
                longitude: '-118.2479',
              },
            ],
          }),
        } as unknown as Response;
      }
      return { ok: false, status: 404 } as Response;
    }),
  );
}

describe('App integration', () => {
  it('defaults to Jerusalem and renders calendar events', () => {
    render(<App />);
    expect(heading()).toHaveTextContent('Times for Jerusalem');
    expect(screen.getByTestId('calendar')).toBeInTheDocument();
    expect(screen.getByTestId('calendar').textContent).toMatch(/\d+ events/);
  });

  it('switches to a searched zip code and its timezone', async () => {
    stubZipApi();
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
    stubZipApi();
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

  it('renders the jump-to month/year controls and the location button', () => {
    render(<App />);
    expect(screen.getByLabelText('Jump to month')).toBeInTheDocument();
    expect(screen.getByLabelText('Jump to year')).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /use my current location/i }),
    ).toBeInTheDocument();
  });

  it('detects the user location via GPS and switches to it', async () => {
    // Los Angeles coordinates.
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: (success: PositionCallback) =>
          success({
            coords: { latitude: 34.05, longitude: -118.24 },
          } as GeolocationPosition),
      },
    });
    render(<App />);
    await userEvent.click(
      screen.getByRole('button', { name: /use my current location/i }),
    );
    await waitFor(() => expect(heading()).toHaveTextContent('Los Angeles'));
    expect(Settings.defaultZone.name).toBe('America/Los_Angeles');
  });

  it('shows an error when location detection is denied', async () => {
    vi.stubGlobal('navigator', {
      geolocation: {
        getCurrentPosition: (
          _success: PositionCallback,
          error: PositionErrorCallback,
        ) => error({ code: 1, message: 'denied' } as GeolocationPositionError),
      },
    });
    render(<App />);
    await userEvent.click(
      screen.getByRole('button', { name: /use my current location/i }),
    );
    expect(
      await screen.findByText(/could not get your location/i),
    ).toBeInTheDocument();
    expect(heading()).toHaveTextContent('Times for Jerusalem');
  });
});
