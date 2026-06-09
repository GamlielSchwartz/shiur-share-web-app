import { describe, it, expect, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../src/theme';
import MonthYearPicker from '../../src/components/MonthYearPicker';

function renderWithTheme(ui: React.ReactNode) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('MonthYearPicker', () => {
  it('shows the current month and year of the given date', () => {
    renderWithTheme(
      <MonthYearPicker date={new Date(2021, 1, 12)} onChange={() => {}} />,
    );
    expect(screen.getByLabelText('Jump to month')).toHaveTextContent(
      'February',
    );
    expect(screen.getByLabelText('Jump to year')).toHaveTextContent('2021');
  });

  it('navigates to the first of the chosen month, keeping the year', async () => {
    const onChange = vi.fn();
    renderWithTheme(
      <MonthYearPicker date={new Date(2021, 1, 12)} onChange={onChange} />,
    );
    await userEvent.click(screen.getByLabelText('Jump to month'));
    const listbox = await screen.findByRole('listbox');
    await userEvent.click(within(listbox).getByText('July'));

    expect(onChange).toHaveBeenCalledTimes(1);
    const result = onChange.mock.calls[0][0] as Date;
    expect(result.getFullYear()).toBe(2021);
    expect(result.getMonth()).toBe(6); // July
    expect(result.getDate()).toBe(1);
  });

  it('navigates to the chosen year, keeping the month', async () => {
    const onChange = vi.fn();
    const thisYear = new Date().getFullYear();
    renderWithTheme(
      <MonthYearPicker date={new Date(thisYear, 1, 12)} onChange={onChange} />,
    );
    await userEvent.click(screen.getByLabelText('Jump to year'));
    const listbox = await screen.findByRole('listbox');
    await userEvent.click(within(listbox).getByText(String(thisYear + 1)));

    const result = onChange.mock.calls[0][0] as Date;
    expect(result.getFullYear()).toBe(thisYear + 1);
    expect(result.getMonth()).toBe(1);
  });

  it('keeps an out-of-span year selectable', () => {
    renderWithTheme(
      <MonthYearPicker date={new Date(1980, 5, 1)} onChange={() => {}} />,
    );
    expect(screen.getByLabelText('Jump to year')).toHaveTextContent('1980');
  });
});
