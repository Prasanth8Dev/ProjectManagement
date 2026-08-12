'use client';
import Link from 'next/link';
import { Clock, CheckSquare, AlertCircle, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { UserAvatar } from '@/components/shared/user-avatar';
import { DailyWorkUpdate } from '@/types/daily-update.types';
import { ROUTES } from '@/constants/routes';
import { formatDate, formatRelativeTime as formatRelative } from '@/lib/utils/date';

const MOOD_EMOJIS: Record<number, string> = {
  1: '😞',
  2: '😐',
  3: '🙂',
  4: '😊',
  5: '🤩',
};

interface UpdateCardProps {
  update: DailyWorkUpdate;
}

export function UpdateCard({ update }: UpdateCardProps) {
  const completedTasks = update.tasks.filter((t) => t.isCompleted).length;
  const blockedTasks = update.tasks.filter((t) => t.isBlocked).length;
  const totalTasks = update.tasks.length;

  return (
    <Link href={ROUTES.UPDATE(update.id)}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer group">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2.5 min-w-0">
              <UserAvatar user={update.user} size="sm" className="shrink-0" />
              <div className="min-w-0">
                <p className="text-sm font-semibold truncate">{update.user.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatDate(update.date, 'EEEE, MMM d')}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {update.mood && (
                <span className="text-xl leading-none" title={`Mood: ${update.mood}/5`}>
                  {MOOD_EMOJIS[update.mood]}
                </span>
              )}
              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full">
                <Clock className="h-3 w-3" />
                <span>{update.hoursWorked}h</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-3">
          {/* Summary */}
          <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
            {update.summary}
          </p>

          {/* Stats row */}
          <div className="flex items-center gap-4 text-xs">
            {totalTasks > 0 && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <TrendingUp className="h-3.5 w-3.5" />
                {totalTasks} task{totalTasks !== 1 ? 's' : ''} worked
              </span>
            )}
            {completedTasks > 0 && (
              <span className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <CheckSquare className="h-3.5 w-3.5" />
                {completedTasks} done
              </span>
            )}
            {blockedTasks > 0 && (
              <span className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <AlertCircle className="h-3.5 w-3.5" />
                {blockedTasks} blocked
              </span>
            )}
            <span className="ml-auto text-muted-foreground">
              {formatRelative(update.createdAt)}
            </span>
          </div>

          {/* Project tags */}
          {update.projects && update.projects.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {update.projects.slice(0, 3).map((project) => (
                <span
                  key={project.id}
                  className="text-xs px-1.5 py-0.5 rounded-sm"
                  style={{
                    backgroundColor: project.color + '22',
                    color: project.color,
                  }}
                >
                  {project.name}
                </span>
              ))}
              {update.projects.length > 3 && (
                <span className="text-xs px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground">
                  +{update.projects.length - 3}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
