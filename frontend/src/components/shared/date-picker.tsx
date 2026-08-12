'use client';
import { useState } from 'react';
import { format, parseISO } from 'date-fns';
import { CalendarIcon, X } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils/cn';

interface DatePickerProps {
  value?: Date | string | null;
  onChange?: (date: Date | null) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  clearable?: boolean;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Pick a date',
  disabled,
  className,
  clearable = true,
}: DatePickerProps) {
  const [open, setOpen] = useState(false);

  const selectedDate =
    value instanceof Date
      ? value
      : typeof value === 'string' && value
      ? parseISO(value)
      : null;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'justify-start text-left font-normal w-full',
            !selectedDate && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
          <span className="flex-1 truncate">
            {selectedDate ? format(selectedDate, 'PPP') : placeholder}
          </span>
          {clearable && selectedDate && (
            <span
              role="button"
              aria-label="Clear date"
              className="ml-1 rounded-sm hover:bg-muted p-0.5"
              onClick={(e) => {
                e.stopPropagation();
                onChange?.(null);
              }}
            >
              <X className="h-3.5 w-3.5 text-muted-foreground" />
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selectedDate ?? undefined}
          onSelect={(date) => {
            onChange?.(date ?? null);
            setOpen(false);
          }}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}
