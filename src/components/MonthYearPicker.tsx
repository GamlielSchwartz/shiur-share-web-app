import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import type { SelectChangeEvent } from '@mui/material/Select';
import Stack from '@mui/material/Stack';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

/** Number of years to offer on either side of the current year. */
const YEAR_SPAN = 10;

interface Props {
  date: Date;
  onChange: (date: Date) => void;
}

/**
 * Compact month + year jump control. Selecting either dropdown navigates the
 * calendar to the first of that month, keeping the other field unchanged.
 */
export default function MonthYearPicker({ date, onChange }: Props) {
  const month = date.getMonth();
  const year = date.getFullYear();

  const currentYear = new Date().getFullYear();
  const years: number[] = [];
  for (let y = currentYear - YEAR_SPAN; y <= currentYear + YEAR_SPAN; y++) {
    years.push(y);
  }
  // Make sure the currently-viewed year is always selectable even if it falls
  // outside the default span (e.g. after paging far into the past/future).
  if (!years.includes(year)) {
    years.push(year);
    years.sort((a, b) => a - b);
  }

  function handleMonth(event: SelectChangeEvent<number>) {
    onChange(new Date(year, Number(event.target.value), 1));
  }

  function handleYear(event: SelectChangeEvent<number>) {
    onChange(new Date(Number(event.target.value), month, 1));
  }

  return (
    <Stack direction="row" spacing={1}>
      <Select
        size="small"
        value={month}
        onChange={handleMonth}
        inputProps={{ 'aria-label': 'Jump to month' }}
      >
        {MONTHS.map((name, index) => (
          <MenuItem key={name} value={index}>
            {name}
          </MenuItem>
        ))}
      </Select>
      <Select
        size="small"
        value={year}
        onChange={handleYear}
        inputProps={{ 'aria-label': 'Jump to year' }}
      >
        {years.map((y) => (
          <MenuItem key={y} value={y}>
            {y}
          </MenuItem>
        ))}
      </Select>
    </Stack>
  );
}
