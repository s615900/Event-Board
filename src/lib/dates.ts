import type { EventItem, EventStatus } from './types';

// Today's date in Taiwan as YYYY-MM-DD. Used on both server (UTC on Vercel) and
// browser so "today" — and therefore every event status — is always Taiwan time.
export function taipeiToday(now: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Taipei', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function toLocalISODate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const WEEKDAYS_EN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];
const WEEKDAYS_ZH = ['日', '一', '二', '三', '四', '五', '六'];

function dayOfWeek(isoDate: string): number {
  return new Date(`${isoDate}T00:00:00Z`).getUTCDay();
}

export function weekdayEn(isoDate: string): string {
  return isoDate ? WEEKDAYS_EN[dayOfWeek(isoDate)] ?? '' : '';
}

export function weekdayZh(isoDate: string): string {
  return isoDate ? WEEKDAYS_ZH[dayOfWeek(isoDate)] ?? '' : '';
}

export function daysBetween(fromISO: string, toISO: string): number {
  return Math.round((Date.parse(`${toISO}T00:00:00Z`) - Date.parse(`${fromISO}T00:00:00Z`)) / 86_400_000);
}

// 狀態 is derived from the competition dates — never stored or typed in by hand.
export function eventStatus(event: Pick<EventItem, 'startDate' | 'endDate'>, today: string): EventStatus {
  const end = event.endDate || event.startDate;
  if (event.startDate && today < event.startDate) return '即將舉行';
  if (end && today > end) return '已結束';
  return '進行中';
}

// "2026-11-04" or "2026-11-04 — 2026-11-06"
export function formatDateRange(event: Pick<EventItem, 'startDate' | 'endDate'>): string {
  return !event.endDate || event.endDate === event.startDate ? event.startDate : `${event.startDate} — ${event.endDate}`;
}

export function addDays(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

// "2026-10" → "2026 年 10 月"
export function monthLabel(month: string): string {
  const [y, m] = month.split('-');
  return y && m ? `${y} 年 ${Number(m)} 月` : month;
}

// "2026-10-03" → "10/03"
export function shortDate(isoDate: string): string {
  return isoDate.slice(5).replace('-', '/');
}

export function shiftMonth(month: string, delta: number): string {
  const [y, m] = month.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1 + delta, 1));
  return d.toISOString().slice(0, 7);
}

// Days of a month laid out Sunday-first, padded with nulls to whole weeks.
export function monthGrid(month: string): (string | null)[] {
  const [y, m] = month.split('-').map(Number);
  const first = new Date(Date.UTC(y, m - 1, 1));
  const daysInMonth = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells: (string | null)[] = Array(first.getUTCDay()).fill(null);
  for (let day = 1; day <= daysInMonth; day++) cells.push(`${month}-${String(day).padStart(2, '0')}`);
  while (cells.length % 7) cells.push(null);
  return cells;
}
