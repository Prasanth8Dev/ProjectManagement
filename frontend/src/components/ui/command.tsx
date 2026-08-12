'use client';
import * as React from 'react';
import { Search } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

// Lightweight Command/Combobox components — no external deps

interface CommandContextValue {
  search: string;
}
const CommandContext = React.createContext<CommandContextValue>({ search: '' });

interface CommandProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

function Command({ children, className, ...props }: CommandProps) {
  const [search, setSearch] = React.useState('');
  return (
    <CommandContext.Provider value={{ search }}>
      <div
        className={cn(
          'flex flex-col overflow-hidden rounded-md bg-popover text-popover-foreground',
          className
        )}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && (child.type as { displayName?: string }).displayName === 'CommandInput') {
            return React.cloneElement(child as React.ReactElement<CommandInputProps>, {
              value: search,
              onValueChange: setSearch,
            });
          }
          return child;
        })}
      </div>
    </CommandContext.Provider>
  );
}

interface CommandInputProps {
  placeholder?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

function CommandInput({ placeholder, value, onValueChange, className }: CommandInputProps) {
  return (
    <div className="flex items-center border-b px-3">
      <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
      <input
        value={value ?? ''}
        onChange={(e) => onValueChange?.(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
      />
    </div>
  );
}
CommandInput.displayName = 'CommandInput';

function CommandList({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('max-h-64 overflow-y-auto overflow-x-hidden', className)}
      {...props}
    >
      {children}
    </div>
  );
}

function CommandEmpty({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  const { search } = React.useContext(CommandContext);
  // Always render — parent controls visibility via conditionals in practice
  return (
    <div
      className={cn('py-6 text-center text-sm text-muted-foreground', className)}
      {...props}
    >
      {children}
    </div>
  );
}

function CommandGroup({ children, className, heading, ...props }: React.HTMLAttributes<HTMLDivElement> & { heading?: string }) {
  return (
    <div className={cn('overflow-hidden p-1', className)} {...props}>
      {heading && (
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{heading}</div>
      )}
      {children}
    </div>
  );
}

interface CommandItemProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  value?: string;
  onSelect?: (value: string) => void;
  disabled?: boolean;
}

function CommandItem({ children, className, value, onSelect, disabled, ...props }: CommandItemProps) {
  return (
    <div
      role="option"
      aria-selected={false}
      aria-disabled={disabled}
      onClick={() => !disabled && onSelect?.(value ?? '')}
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
        'hover:bg-accent hover:text-accent-foreground',
        disabled && 'pointer-events-none opacity-50',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

function CommandSeparator({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('-mx-1 h-px bg-border', className)} {...props} />;
}

export {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
};
