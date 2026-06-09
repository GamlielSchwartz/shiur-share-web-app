import { Calendar, luxonLocalizer, Views } from 'react-big-calendar';
import { DateTime } from 'luxon';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import type { KlEvent } from '../lib/calendarEvents';

const localizer = luxonLocalizer(DateTime, { firstDayOfWeek: 0 });

interface Props {
  events: KlEvent[];
  date: Date;
  onNavigate: (date: Date) => void;
  onSelectEvent: (event: KlEvent) => void;
}

export default function CalendarView({
  events,
  date,
  onNavigate,
  onSelectEvent,
}: Props) {
  return (
    <Calendar<KlEvent>
      localizer={localizer}
      events={events}
      date={date}
      onNavigate={onNavigate}
      onSelectEvent={onSelectEvent}
      views={[Views.MONTH]}
      defaultView={Views.MONTH}
      startAccessor="start"
      endAccessor="end"
      popup
      eventPropGetter={(event) => ({
        style: {
          backgroundColor: event.opinion.bgColor,
          color: event.opinion.color,
          border: '0px',
          opacity: 0.9,
          cursor: 'pointer',
        },
      })}
      style={{ height: '72vh', minHeight: 520 }}
    />
  );
}
