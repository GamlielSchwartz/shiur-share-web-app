import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../theme';
import ZipSearch from './ZipSearch';

function renderWithTheme(ui: React.ReactNode) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('ZipSearch', () => {
  it('calls onSearch with the trimmed value when Enter is pressed', async () => {
    const onSearch = vi.fn();
    renderWithTheme(<ZipSearch onSearch={onSearch} />);
    const input = screen.getByRole('textbox', { name: /search by zip/i });
    await userEvent.type(input, '  10001  {Enter}');
    expect(onSearch).toHaveBeenCalledWith('10001');
  });

  it('does nothing when Enter is pressed on empty input', async () => {
    const onSearch = vi.fn();
    renderWithTheme(<ZipSearch onSearch={onSearch} />);
    const input = screen.getByRole('textbox', { name: /search by zip/i });
    await userEvent.type(input, '{Enter}');
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('does not search on every keystroke, only on Enter', async () => {
    const onSearch = vi.fn();
    renderWithTheme(<ZipSearch onSearch={onSearch} />);
    const input = screen.getByRole('textbox', { name: /search by zip/i });
    await userEvent.type(input, '10001');
    expect(onSearch).not.toHaveBeenCalled();
  });
});
