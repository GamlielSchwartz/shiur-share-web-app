import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../src/theme';
import MoladSidebar from '../../src/components/MoladSidebar';
import { getKiddushLevanaMonths } from '../../src/lib/kiddushLevana';
import { buildEvents } from '../../src/lib/calendarEvents';

const events = buildEvents(
  getKiddushLevanaMonths(new Date('2021-02-12'), 'Asia/Jerusalem'),
);
const adarMajority = events.find(
  (e) =>
    e.month.jewishYear === 5781 &&
    e.month.jewishMonth === 12 &&
    e.opinion.key === 'majority',
)!;

function renderWithTheme(ui: React.ReactNode) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('MoladSidebar', () => {
  it('prompts the user when nothing is selected', () => {
    renderWithTheme(
      <MoladSidebar selected={null} locationCity="Jerusalem" onLearnMore={() => {}} />,
    );
    expect(screen.getByText(/click a colored bar/i)).toBeInTheDocument();
  });

  it('shows the month, molad and opinion times for a selection', () => {
    renderWithTheme(
      <MoladSidebar
        selected={adarMajority}
        locationCity="Jerusalem"
        onLearnMore={() => {}}
      />,
    );
    expect(screen.getByText('Adar')).toBeInTheDocument();
    // Announced molad is Jerusalem mean time (6:19 AM), matching Chabad/luchos.
    expect(
      screen.getByText('Molad in Jerusalem (as announced)'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Friday, Feb 12, 2021, 6:19 AM and 4 chalakim'),
    ).toBeInTheDocument();
    // Actual local line uses the exact molad chalakim (4), not the rounded
    // seconds (which would give 5), and the LMT-corrected instant (5:58 AM).
    expect(
      screen.getByText('Molad in Jerusalem (actual local time)'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Friday, Feb 12, 2021, 5:58 AM and 4 chalakim'),
    ).toBeInTheDocument();
    expect(screen.getByText('Opinion of Majority')).toBeInTheDocument();
    // earliest = molad + 3 days
    expect(
      screen.getByText('Monday, Feb 15, 2021, 5:58 AM'),
    ).toBeInTheDocument();
  });

  it('shows the announced Jerusalem molad plus the local time elsewhere', () => {
    const nyEvents = buildEvents(
      getKiddushLevanaMonths(new Date('2021-02-12'), 'America/New_York'),
    );
    const nyAdar = nyEvents.find(
      (e) =>
        e.month.jewishYear === 5781 &&
        e.month.jewishMonth === 12 &&
        e.opinion.key === 'majority',
    )!;
    renderWithTheme(
      <MoladSidebar
        selected={nyAdar}
        locationCity="New York, NY"
        onLearnMore={() => {}}
      />,
    );
    expect(
      screen.getByText('Molad in Jerusalem (as announced)'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Molad in New York, NY (actual local time)'),
    ).toBeInTheDocument();
    // Announced Jerusalem mean time stays 6:19 AM Friday regardless of zone;
    // the actual instant in NY is the prior evening.
    expect(
      screen.getByText('Friday, Feb 12, 2021, 6:19 AM and 4 chalakim'),
    ).toBeInTheDocument();
    expect(
      screen.getByText('Thursday, Feb 11, 2021, 10:58 PM and 4 chalakim'),
    ).toBeInTheDocument();
  });

  it('fires onLearnMore when the button is clicked', async () => {
    const onLearnMore = vi.fn();
    renderWithTheme(
      <MoladSidebar
        selected={adarMajority}
        locationCity="Jerusalem"
        onLearnMore={onLearnMore}
      />,
    );
    await userEvent.click(screen.getByRole('button', { name: /learn more/i }));
    expect(onLearnMore).toHaveBeenCalled();
  });
});
