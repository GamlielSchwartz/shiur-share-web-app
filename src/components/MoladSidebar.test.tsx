import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../theme';
import MoladSidebar from './MoladSidebar';
import { getKiddushLevanaMonths } from '../lib/kiddushLevana';
import { buildEvents } from '../lib/calendarEvents';

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
    expect(screen.getByText('Molad in Jerusalem')).toBeInTheDocument();
    expect(
      screen.getByText('Friday, Feb 12, 2021, 5:58 AM and 5 chalakim'),
    ).toBeInTheDocument();
    expect(screen.getByText('Opinion of Majority')).toBeInTheDocument();
    // earliest = molad + 3 days
    expect(
      screen.getByText('Monday, Feb 15, 2021, 5:58 AM'),
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
