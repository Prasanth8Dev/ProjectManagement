'use client';
import { Apple, Smartphone, Server, MonitorSmartphone } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { BugPlatform } from '@/types/bug.types';

interface Props {
  platform: BugPlatform;
  className?: string;
}

const PLATFORM_CONFIG: Record<
  BugPlatform,
  { label: string; className: string; icon: React.ComponentType<{ className?: string }> }
> = {
  IOS: {
    label: 'iOS',
    className: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800/50 dark:text-slate-300',
    icon: Apple,
  },
  ANDROID: {
    label: 'Android',
    className: 'bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400',
    icon: Smartphone,
  },
  BACKEND: {
    label: 'Backend',
    className: 'bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400',
    icon: Server,
  },
  FRONTEND: {
    label: 'Frontend',
    className: 'bg-cyan-100 text-cyan-700 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-400',
    icon: MonitorSmartphone,
  },
};

export function BugPlatformBadge({ platform, className }: Props) {
  const config = PLATFORM_CONFIG[platform];
  if (!config) return null;
  const Icon = config.icon;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold',
        config.className,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </span>
  );
}
