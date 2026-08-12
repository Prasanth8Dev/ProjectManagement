import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils/cn';

interface StatCardProps {
  title?: string;
  label?: string;
  value: number | string;
  icon: LucideIcon;
  description?: string;
  trend?: { value: number; label?: string };
  color?: string;
  className?: string;
}

export function StatCard({
  title,
  label,
  value,
  icon: Icon,
  description,
  trend,
  color = 'text-primary',
  className,
}: StatCardProps) {
  const displayLabel = title ?? label ?? '';

  return (
    <Card className={cn('', className)}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground leading-tight">
              {displayLabel}
            </p>
            <p className="text-2xl font-bold mt-1 tabular-nums">{value}</p>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
            )}
            {trend !== undefined && (
              <p
                className={cn(
                  'text-xs mt-1.5 flex items-center gap-1',
                  trend.value >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                )}
              >
                {trend.value >= 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                <span>
                  {trend.value >= 0 ? '+' : ''}
                  {trend.value}% {trend.label ?? 'from last month'}
                </span>
              </p>
            )}
          </div>
          <div
            className={cn(
              'h-11 w-11 rounded-xl bg-muted flex items-center justify-center shrink-0',
              color
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
