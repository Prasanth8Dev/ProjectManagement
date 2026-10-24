'use client';
import Link from 'next/link';
import { format } from 'date-fns';
import { Calendar, Clock, Users, ListChecks } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { UserAvatar } from '@/components/shared/user-avatar';
import { ROUTES } from '@/constants/routes';
import { MEETING_TYPE_CONFIG } from '@/constants/meeting-types';
import type { Meeting } from '@/types/meeting.types';
import { cn } from '@/lib/utils/cn';

export function MeetingCard({ meeting }: { meeting: Meeting }) {
  const typeCfg = MEETING_TYPE_CONFIG[meeting.type] ?? MEETING_TYPE_CONFIG.GENERAL;

  return (
    <Link href={ROUTES.MEETING(meeting.id)}>
      <Card className="hover:border-primary/50 hover:shadow-sm transition-all cursor-pointer">
        <CardContent className="pt-5">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-medium truncate">{meeting.title}</h3>
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium shrink-0',
                    typeCfg.bgColor,
                    typeCfg.color
                  )}
                >
                  {typeCfg.label}
                </span>
              </div>
              {meeting.description && (
                <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                  {meeting.description}
                </p>
              )}
            </div>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5" />
              {format(new Date(meeting.scheduledAt), 'MMM d, yyyy · h:mm a')}
            </span>
            {meeting.duration && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                {meeting.duration}m
              </span>
            )}
            {(meeting._count?.actionItems ?? meeting.actionItems?.length ?? 0) > 0 && (
              <span className="flex items-center gap-1.5">
                <ListChecks className="w-3.5 h-3.5" />
                {meeting._count?.actionItems ?? meeting.actionItems?.length} action item
                {(meeting._count?.actionItems ?? meeting.actionItems?.length) === 1 ? '' : 's'}
              </span>
            )}
          </div>

          {meeting.participants?.length > 0 && (
            <div className="mt-3 flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-muted-foreground" />
              <div className="flex -space-x-1.5">
                {meeting.participants.slice(0, 6).map((p) => (
                  <UserAvatar
                    key={p.userId}
                    user={p.user}
                    size="xs"
                    className="ring-2 ring-background"
                  />
                ))}
              </div>
              {meeting.participants.length > 6 && (
                <span className="text-xs text-muted-foreground">
                  +{meeting.participants.length - 6}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
