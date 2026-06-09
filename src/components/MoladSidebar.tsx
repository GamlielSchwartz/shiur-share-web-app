import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Box from '@mui/material/Box';
import type { KlEvent } from '../lib/calendarEvents';
import { formatDateTime, formatMolad } from '../lib/format';

interface Props {
  selected: KlEvent | null;
  locationCity: string;
  onLearnMore: () => void;
}

function Labelled({ label, value }: { label: string; value: string }) {
  return (
    <Box>
      <Typography variant="overline" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" sx={{ fontWeight: 500 }}>
        {value}
      </Typography>
    </Box>
  );
}

export default function MoladSidebar({
  selected,
  locationCity,
  onLearnMore,
}: Props) {
  if (!selected) {
    return (
      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Molad &amp; Kiddush Levana
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Click a colored bar in the calendar to see the exact molad time and
            the earliest and latest times to say Kiddush Levana, along with the
            halachic sources.
          </Typography>
        </CardContent>
      </Card>
    );
  }

  const { month, opinion } = selected;

  return (
    <Stack spacing={2}>
      <Card variant="outlined">
        <CardContent>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            sx={{ mb: 1.5 }}
            flexWrap="wrap"
          >
            <Chip label={month.monthName} color="primary" size="small" />
            <Chip
              label={month.jewishYear}
              variant="outlined"
              size="small"
            />
          </Stack>
          <Labelled
            label={`Molad in ${locationCity}`}
            value={formatMolad(month.molad)}
          />
        </CardContent>
      </Card>

      <Card variant="outlined">
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Opinion of {opinion.title}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {opinion.subtitle}
          </Typography>
          <Stack spacing={2}>
            <Labelled
              label="Earliest Kiddush Levana"
              value={formatDateTime(opinion.earliest(month))}
            />
            <Labelled
              label="Latest Kiddush Levana"
              value={formatDateTime(opinion.latest(month))}
            />
          </Stack>
        </CardContent>
        <CardActions>
          <Button size="small" onClick={onLearnMore}>
            Learn more
          </Button>
        </CardActions>
      </Card>
    </Stack>
  );
}
