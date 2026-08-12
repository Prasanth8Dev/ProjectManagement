'use client';
import * as React from 'react';
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameDay,
  isSameMonth,
  isWithinInterval,
  format,
} from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils/cn';

export type DateRange = { from?: Date; to?: Date };

type CalendarModeSingle = {
  mode: 'single';
  selected?: Date;
  onSelect?: (date: Date | undefined) => void;
  numberOfMonths?: never;
};

type CalendarModeRange = {
  mode: 'range';
  selected?: DateRange;
  onSelect?: (range: DateRange | undefined) => void;
  numberOfMonths?: number;
};

type CalendarProps = (CalendarModeSingle | CalendarModeRange) & {
  initialFocus?: boolean;
  className?: string;
  disabled?: (date: Date) => boolean;
};

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function buildCalendarDays(month: Date): Date[] {
  const start = startOfWeek(startOfMonth(month));
  const end = endOfWeek(endOfMonth(month));
  const days: Date[] = [];
  let cursor = start;
  while (cursor <= end) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }
  return days;
}

function MonthGrid({
  month,
  mode,
  selected,
  onDayClick,
  disabled,
  rangeStart,
}: {
  month: Date;
  mode: 'single' | 'range';
  selected?: Date | DateRange;
  onDayClick: (date: Date) => void;
  disabled?: (date: Date) => boolean;
  rangeStart?: Date | null;
}) {
  const days = buildCalendarDays(month);

  const isSelected = (day: Date) => {
    if (!selected) return false;
    if (selected instanceof Date) return isSameDay(day, selected);
    const range = selected as DateRange;
    if (range.from && isSameDay(day, range.from)) return true;
    if (range.to && isSameDay(day, range.to)) return true;
    return false;
  };

  const isInRange = (day: Date) => {
    if (mode !== 'range') return false;
    const range = selected as DateRange | undefined;
    const from = rangeStart ?? range?.from;
    const to = range?.to;
    if (!from || !to) return false;
    const [a, b] = from <= to ? [from, to] : [to, from];
    return isWithinInterval(day, { start: a, end: b }) && !isSameDay(day, a) && !isSameDay(day, b);
  };

  const isRangeEdge = (day: Date) => {
    if (mode !== 'range') return false;
    const range = selected as DateRange | undefined;
    return !!(
      (range?.from && isSameDay(day, range.from)) ||
      (range?.to && isSameDay(day, range.to))
    );
  };

  return (
    <>
      <div className="grid grid-cols-7 mb-1">
        {WEEKDAYS.map((d) => (
          <div key={d} className="text-center text-xs font-medium text-muted-foreground py-1">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {days.map((day, i) => {
          const outside = !isSameMonth(day, month);
          const sel = isSelected(day);
          const inRange = isInRange(day);
          const edge = isRangeEdge(day);
          const isDisabled = disabled?.(day) ?? false;
          return (
            <button
              key={i}
              type="button"
              onClick={() => !isDisabled && onDayClick(day)}
              disabled={isDisabled}
              className={cn(
                'h-8 w-full text-sm rounded-md transition-colors',
                outside && 'text-muted-foreground opacity-40',
                !outside && !sel && !inRange && 'hover:bg-accent hover:text-accent-foreground',
                sel && 'bg-primary text-primary-foreground font-medium',
                inRange && !sel && 'bg-primary/15 rounded-none',
                edge && !sel && 'bg-primary/20',
                isDisabled && 'cursor-not-allowed opacity-30',
              )}
            >
              {format(day, 'd')}
            </button>
          );
        })}
      </div>
    </>
  );
}

export function Calendar(props: CalendarProps) {
  const numMonths = (props.mode === 'range' ? props.numberOfMonths : 1) ?? 1;
  const [currentMonth, setCurrentMonth] = React.useState<Date>(() => {
    if (props.mode === 'single') return props.selected ?? new Date();
    if (props.mode === 'range') return (props.selected as DateRange)?.from ?? new Date();
    return new Date();
  });

  // For range mode: track first click before second is chosen
  const [rangeStart, setRangeStart] = React.useState<Date | null>(null);

  const handleDayClick = (day: Date) => {
    if (props.mode === 'single') {
      const wasSame = props.selected && isSameDay(day, props.selected as Date);
      (props as CalendarModeSingle).onSelect?.(wasSame ? undefined : day);
    } else {
      const range = props.selected as DateRange | undefined;
      if (!rangeStart) {
        // First click: set start, clear end
        setRangeStart(day);
        (props as CalendarModeRange).onSelect?.({ from: day, to: undefined });
      } else {
        // Second click: finalise range
        const [from, to] = rangeStart <= day ? [rangeStart, day] : [day, rangeStart];
        setRangeStart(null);
        (props as CalendarModeRange).onSelect?.({ from, to });
      }
    }
  };

  const months = Array.from({ length: numMonths }, (_, i) => addMonths(currentMonth, i));

  return (
    <div className={cn('p-3', props.className)}>
      <div className="flex items-center justify-between mb-2">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => setCurrentMonth((m) => subMonths(m, 1))}
          aria-label="Previous month"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="text-sm font-medium">
          {months.map((m) => format(m, 'MMMM yyyy')).join(' – ')}
        </span>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0"
          onClick={() => setCurrentMonth((m) => addMonths(m, 1))}
          aria-label="Next month"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className={cn('flex gap-4', numMonths > 1 && 'divide-x')}>
        {months.map((month, mi) => (
          <div key={mi} className={cn('flex-1', mi > 0 && 'pl-4')}>
            {numMonths > 1 && (
              <p className="text-xs font-medium text-center text-muted-foreground mb-2">
                {format(month, 'MMMM yyyy')}
              </p>
            )}
            <MonthGrid
              month={month}
              mode={props.mode}
              selected={props.selected as Date | DateRange | undefined}
              onDayClick={handleDayClick}
              disabled={props.disabled}
              rangeStart={rangeStart}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
