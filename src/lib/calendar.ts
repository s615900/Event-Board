import { addDays } from './dates';
import type { EventItem } from './types';

// "Add to calendar" helpers. Events are all-day, so the end date is exclusive
// (one day after the last competition day), as both formats require.

const compact = (isoDate: string) => isoDate.replaceAll('-', '');

export function googleCalendarUrl(event: EventItem, pageUrl: string): string {
  const end = addDays(event.endDate || event.startDate, 1);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.name,
    dates: `${compact(event.startDate)}/${compact(end)}`,
    details: [event.note, `賽事資訊：${pageUrl}`].filter(Boolean).join('\n\n'),
    location: [event.county, event.location].filter(Boolean).join(' '),
  });
  return `https://calendar.google.com/calendar/render?${params}`;
}

function escapeIcs(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n');
}

export function icsFile(event: EventItem, pageUrl: string, now: Date = new Date()): string {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//賽事看板//TW',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${event.id}@event-board`,
    `DTSTAMP:${stamp}`,
    `DTSTART;VALUE=DATE:${compact(event.startDate)}`,
    `DTEND;VALUE=DATE:${compact(addDays(event.endDate || event.startDate, 1))}`,
    `SUMMARY:${escapeIcs(event.name)}`,
    `LOCATION:${escapeIcs([event.county, event.location].filter(Boolean).join(' '))}`,
    `DESCRIPTION:${escapeIcs([event.note, `賽事資訊：${pageUrl}`].filter(Boolean).join('\n\n'))}`,
    `URL:${pageUrl}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];
  return lines.join('\r\n') + '\r\n';
}
