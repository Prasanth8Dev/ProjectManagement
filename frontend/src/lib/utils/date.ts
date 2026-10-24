import {
  format,
  formatDistanceToNow,
  isAfter,
  isBefore,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  addDays,
  isToday,
  isPast,
  differenceInCalendarDays,
} from 'date-fns';

export function formatDate(date: string | Date, fmt = 'MMM d, yyyy'): string {
  return format(new Date(date), fmt);
}

export function formatDateTime(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy h:mm a');
}

export function formatRelativeTime(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function isOverdue(dueDate: string | Date): boolean {
  const d = new Date(dueDate);
  return isPast(d) && !isToday(d);
}

export function getDaysUntilDue(dueDate: string | Date): number {
  return differenceInCalendarDays(new Date(dueDate), startOfDay(new Date()));
}

export function getWeekRange(date: Date = new Date()): { start: Date; end: Date } {
  return {
    start: startOfWeek(date, { weekStartsOn: 1 }),
    end: endOfWeek(date, { weekStartsOn: 1 }),
  };
}

export function formatDateForInput(date: Date | null): string {
  if (!date) return '';
  return format(date, 'yyyy-MM-dd');
}

export function getDayName(date: Date): string {
  return format(date, 'EEE');
}

/** Formats a millisecond duration as "1d 4h", "6h 18m", "42m", etc. */
export function formatDuration(ms: number | null | undefined): string {
  if (ms === null || ms === undefined || Number.isNaN(ms) || ms < 0) return '—';
  const totalMinutes = Math.round(ms / 60000);
  if (totalMinutes < 1) return '<1m';
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

export function toISODateString(date: Date | string | null | undefined): string | undefined {
  if (!date) return undefined;
  const d = date instanceof Date ? date : new Date(date);
  return format(d, 'yyyy-MM-dd');
}
