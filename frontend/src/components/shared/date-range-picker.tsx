'use client';
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { DateRange } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils/cn';

interface DateRangePickerProps {
  from?: Date | string | null;
  to?: Date | string | null;
  onChange?: (range: { from: Date | null; to: Date | null }) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

function toDate(value: Date | string | null | undefined): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  return parseISO(value);
}

export function DateRangePicker({
  from,
  to,
  onChange,
  placeholder = 'Pick date range',
  className,
  disabled,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false);

  const fromDate = toDate(from);
  const toDate_ = toDate(to);

  const range: DateRange = {
    from: fromDate,
    to: toDate_,
  };

  const label =
    fromDate
      ? toDate_
        ? `${format(fromDate, 'MMM d')} – ${format(toDate_, 'MMM d, yyyy')}`
        : format(fromDate, 'MMM d, yyyy')
      : null;

  const handleSelect = (r: DateRange | undefined) => {
    onChange?.({
      from: r?.from ?? null,
      to: r?.to ?? null,
    });
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange?.({ from: null, to: null });
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start text-left font-normal',
            !label && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="flex-1 truncate">{label ?? placeholder}</span>
          {label && (
            <span
              role="button"
              aria-label="Clear date range"
              className="ml-1 rounded-sm hover:bg-muted p-0.5"
              onClick={handleClear}
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="range"
          selected={range}
          onSelect={handleSelect}
          numberOfMonths={2}
          initialFocus
        />
        {label && (
          <div className="border-t p-3 flex justify-end">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClear}
              className="text-xs text-muted-foreground"
            >
              Clear
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
