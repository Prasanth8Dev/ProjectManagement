import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils/cn';

interface ProgressBarProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
  color?: string;
  className?: string;
  size?: 'sm' | 'default';
}

export function ProgressBar({
  value,
  label,
  showPercentage = false,
  color,
  className,
  size = 'default',
}: ProgressBarProps) {
  const clampedValue = Math.min(100, Math.max(0, value));

  return (
    <div className={cn('space-y-1', className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          {label && <span>{label}</span>}
          {showPercentage && (
            <span className="font-medium text-foreground">{Math.round(clampedValue)}%</span>
          )}
        </div>
      )}
      <Progress
        value={clampedValue}
        className={cn(size === 'sm' ? 'h-1.5' : 'h-2')}
        style={color ? { '--progress-foreground': color } as React.CSSProperties : undefined}
      />
    </div>
  );
}
