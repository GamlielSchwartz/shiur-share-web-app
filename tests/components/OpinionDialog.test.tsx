import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider } from '@mui/material/styles';
import { theme } from '../../src/theme';
import OpinionDialog from '../../src/components/OpinionDialog';

function renderWithTheme(ui: React.ReactNode) {
  return render(<ThemeProvider theme={theme}>{ui}</ThemeProvider>);
}

describe('OpinionDialog', () => {
  it('shows the title and body text when open', () => {
    renderWithTheme(
      <OpinionDialog
        open
        title="Opinion of Majority"
        text="Most Acharonim permit from 3 days."
        onClose={() => {}}
      />,
    );
    expect(screen.getByText('Opinion of Majority')).toBeInTheDocument();
    expect(
      screen.getByText('Most Acharonim permit from 3 days.'),
    ).toBeInTheDocument();
  });

  it('renders nothing when closed', () => {
    renderWithTheme(
      <OpinionDialog open={false} title="Hidden" text="Hidden body" onClose={() => {}} />,
    );
    expect(screen.queryByText('Hidden body')).not.toBeInTheDocument();
  });

  it('calls onClose when the Close button is clicked', async () => {
    const onClose = vi.fn();
    renderWithTheme(
      <OpinionDialog open title="t" text="body" onClose={onClose} />,
    );
    await userEvent.click(screen.getByRole('button', { name: /close/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
