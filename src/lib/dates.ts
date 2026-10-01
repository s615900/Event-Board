import { useSyncExternalStore } from 'react';

// Ragic returns dates as "2026/11/04"; the admin form uses "2026-11-04".
export function normalizeDate(value: string): string {
  return value.replaceAll('/', '-').slice(0, 10);
}

export function toLocalISODate(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

const WEEKDAYS_EN = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

export function weekdayEn(value: string): string {
  const d = new Date(`${normalizeDate(value)}T00:00:00`);
  return Number.isNaN(d.getTime()) ? '' : WEEKDAYS_EN[d.getDay()];
}

export function daysBetween(fromISO: string, toISO: string): number {
  return Math.round((Date.parse(`${toISO}T00:00:00`) - Date.parse(`${fromISO}T00:00:00`)) / 86_400_000);
}

const noopSubscribe = () => () => {};

// The visitor's local date, or null during server render and hydration. The
// server runs in UTC (e.g. on Vercel) while visitors are in Taiwan, so "today"
// is only decided in the browser to keep server and client markup identical.
export function useToday(): string | null {
  return useSyncExternalStore(noopSubscribe, () => toLocalISODate(new Date()), () => null);
}
