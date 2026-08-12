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

export function toISODateString(date: Date | string | null | undefined): string | undefined {
  if (!date) return undefined;
  const d = date instanceof Date ? date : new Date(date);
  return format(d, 'yyyy-MM-dd');
}
