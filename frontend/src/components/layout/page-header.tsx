import * as React from 'react';
import { cn } from '@/lib/utils/cn';

interface PageHeaderProps {
  title: string;
  description?: string;
  /** Buttons / controls rendered on the right side */
  actions?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({ title, description, actions, children, className }: PageHeaderProps) {
  const rightSlot = actions ?? children;
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="space-y-1 flex-1 min-w-0">
        <h1 className="text-2xl font-bold tracking-tight truncate">{title}</h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {rightSlot && (
        <div className="flex items-center gap-2 shrink-0">{rightSlot}</div>
      )}
    </div>
  );
}
