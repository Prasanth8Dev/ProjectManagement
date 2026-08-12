import {
  startOfDay as fnsStartOfDay,
  endOfDay as fnsEndOfDay,
  startOfWeek as fnsStartOfWeek,
  endOfWeek as fnsEndOfWeek,
  startOfMonth as fnsStartOfMonth,
  endOfMonth as fnsEndOfMonth,
  subDays,
  addDays,
  format,
  parseISO,
  isValid,
} from 'date-fns';

export function startOfDay(date: Date): Date {
  return fnsStartOfDay(date);
}

export function endOfDay(date: Date): Date {
  return fnsEndOfDay(date);
}

export function startOfWeek(date: Date): Date {
  return fnsStartOfWeek(date, { weekStartsOn: 1 });
}

export function endOfWeek(date: Date): Date {
  return fnsEndOfWeek(date, { weekStartsOn: 1 });
}

export function startOfMonth(date: Date): Date {
  return fnsStartOfMonth(date);
}

export function endOfMonth(date: Date): Date {
  return fnsEndOfMonth(date);
}

export function subtractDays(date: Date, days: number): Date {
  return subDays(date, days);
}

export function addDaysToDate(date: Date, days: number): Date {
  return addDays(date, days);
}

export function formatDate(date: Date, pattern: string = 'yyyy-MM-dd'): string {
  return format(date, pattern);
}

export function parseDate(dateString: string): Date {
  const parsed = parseISO(dateString);
  if (!isValid(parsed)) {
    throw new Error(`Invalid date string: ${dateString}`);
  }
  return parsed;
}

export function getTodayRange(): { start: Date; end: Date } {
  const now = new Date();
  return {
    start: startOfDay(now),
    end: endOfDay(now),
  };
}

export function getWeekRange(date: Date = new Date()): { start: Date; end: Date } {
  return {
    start: startOfWeek(date),
    end: endOfWeek(date),
  };
}
