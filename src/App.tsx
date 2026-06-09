import { useMemo, useState } from 'react';
import { Settings } from 'luxon';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import MyLocationIcon from '@mui/icons-material/MyLocation';

import ZipSearch from './components/ZipSearch';
import CalendarView from './components/CalendarView';
import MoladSidebar from './components/MoladSidebar';
import MonthYearPicker from './components/MonthYearPicker';
import OpinionDialog from './components/OpinionDialog';
import { getKiddushLevanaMonths } from './lib/kiddushLevana';
import { buildEvents, type KlEvent } from './lib/calendarEvents';
import {
  DEFAULT_LOCATION,
  detectLocation,
  lookupZip,
  type AppLocation,
} from './lib/location';

// Drive the calendar grid and all date formatting from the selected location's
// timezone. Updated whenever the user picks a new location.
Settings.defaultZone = DEFAULT_LOCATION.timeZone;

interface SnackState {
  open: boolean;
  message: string;
  severity: 'success' | 'error';
}

export default function App() {
  const [location, setLocation] = useState<AppLocation>(DEFAULT_LOCATION);
  const [referenceDate, setReferenceDate] = useState<Date>(() => new Date());
  const [selected, setSelected] = useState<KlEvent | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [snack, setSnack] = useState<SnackState>({
    open: false,
    message: '',
    severity: 'success',
  });

  const months = useMemo(
    () => getKiddushLevanaMonths(referenceDate, location.timeZone),
    [referenceDate, location.timeZone],
  );
  const events = useMemo(() => buildEvents(months), [months]);

  async function handleZipSearch(zip: string) {
    const result = await lookupZip(zip);
    if (!result) {
      setSnack({
        open: true,
        message: `Couldn't find zip code "${zip}"`,
        severity: 'error',
      });
      return;
    }
    Settings.defaultZone = result.timeZone;
    setLocation(result);
    setSelected(null);
    setSnack({
      open: true,
      message: `Showing times for ${result.city}`,
      severity: 'success',
    });
  }

  async function handleDetectLocation() {
    try {
      const result = await detectLocation();
      Settings.defaultZone = result.timeZone;
      setLocation(result);
      setSelected(null);
      setSnack({
        open: true,
        message: `Showing times for ${result.city}`,
        severity: 'success',
      });
    } catch (err) {
      setSnack({
        open: true,
        message:
          err instanceof Error ? err.message : 'Could not detect your location.',
        severity: 'error',
      });
    }
  }

  function handleNavigate(date: Date) {
    setReferenceDate(date);
    setSelected(null);
  }

  return (
    <Box sx={{ minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <NightsStayIcon sx={{ mr: 1.5 }} />
          <Typography variant="h6" component="h1" sx={{ flexGrow: 1 }} noWrap>
            Kiddush Levana
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center">
            <ZipSearch onSearch={handleZipSearch} />
            <Tooltip title="Use my current location">
              <IconButton
                color="inherit"
                onClick={handleDetectLocation}
                aria-label="Use my current location"
              >
                <MyLocationIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>

      <Container maxWidth="lg" sx={{ py: 3 }}>
        <Typography variant="h5" gutterBottom>
          Times for{' '}
          <Box component="span" sx={{ fontStyle: 'italic' }}>
            {location.city}
          </Box>
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Molad and Kiddush Levana times calculated with the KosherJava zmanim
          engine. Click a colored bar for exact times and the halachic sources.
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gap: 3,
            gridTemplateColumns: { xs: '1fr', md: '320px 1fr' },
            alignItems: 'start',
          }}
        >
          <MoladSidebar
            selected={selected}
            locationCity={location.city}
            onLearnMore={() => setDialogOpen(true)}
          />
          <Box
            sx={{
              bgcolor: 'background.paper',
              p: 2,
              borderRadius: 2,
              boxShadow: 1,
            }}
          >
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mb: 2 }}
              flexWrap="wrap"
            >
              <Typography variant="body2" color="text.secondary">
                Jump to
              </Typography>
              <MonthYearPicker date={referenceDate} onChange={handleNavigate} />
            </Stack>
            <CalendarView
              events={events}
              date={referenceDate}
              onNavigate={handleNavigate}
              onSelectEvent={setSelected}
            />
          </Box>
        </Box>
      </Container>

      <OpinionDialog
        open={dialogOpen}
        title={selected ? `Opinion of ${selected.opinion.title}` : ''}
        text={selected ? selected.opinion.blurb : ''}
        onClose={() => setDialogOpen(false)}
      />

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={() => setSnack((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          severity={snack.severity}
          variant="filled"
          onClose={() => setSnack((s) => ({ ...s, open: false }))}
        >
          {snack.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
