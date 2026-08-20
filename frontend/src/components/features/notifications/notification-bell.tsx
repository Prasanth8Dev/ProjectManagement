'use client';
import { useRouter } from 'next/navigation';
import { Bell, AtSign, UserPlus, MessageSquare, Link2, CheckCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/stores/auth.store';
import {
  useNotifications,
  useUnreadNotificationCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '@/hooks/use-notifications';
import { formatRelativeTime } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';
import type { AppNotification, NotificationType } from '@/types/notification.types';

const TYPE_ICON: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  MENTION: AtSign,
  TASK_ASSIGNED: UserPlus,
  BUG_ASSIGNED: UserPlus,
  TASK_COMMENT: MessageSquare,
  BUG_COMMENT: MessageSquare,
  BUG_LINKED_TO_TASK: Link2,
};

export function NotificationBell() {
  const router = useRouter();
  const currentUser = useAuthStore((s) => s.currentUser);
  const userId = currentUser?.id;

  const { data: unreadCount } = useUnreadNotificationCount(userId);
  const { data, isLoading } = useNotifications(userId, { limit: 10 });
  const { mutate: markRead } = useMarkNotificationRead(userId);
  const { mutate: markAllRead, isPending: isMarkingAll } = useMarkAllNotificationsRead(userId);

  const notifications: AppNotification[] = (data as any)?.data ?? [];
  const hasUnread = (unreadCount ?? 0) > 0;

  const handleSelect = (notification: AppNotification) => {
    if (!notification.isRead) markRead(notification.id);
    if (notification.link) router.push(notification.link);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {hasUnread && (
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-destructive" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-3 py-2">
          <span className="text-sm font-semibold">Notifications</span>
          {hasUnread && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
              disabled={isMarkingAll}
              onClick={(e) => {
                e.preventDefault();
                markAllRead();
              }}
            >
              <CheckCheck className="h-3.5 w-3.5 mr-1" />
              Mark all read
            </Button>
          )}
        </div>
        <DropdownMenuSeparator className="m-0" />
        <div className="max-h-96 overflow-y-auto">
          {isLoading ? (
            <div className="space-y-3 p-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <Bell className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">You're all caught up.</p>
            </div>
          ) : (
            notifications.map((n) => {
              const Icon = TYPE_ICON[n.type] ?? Bell;
              return (
                <button
                  key={n.id}
                  onClick={() => handleSelect(n)}
                  className={cn(
                    'flex w-full items-start gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-muted',
                    !n.isRead && 'bg-primary/5'
                  )}
                >
                  <Icon className="h-4 w-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className={cn('leading-snug', !n.isRead && 'font-medium')}>{n.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatRelativeTime(n.createdAt)}
                    </p>
                  </div>
                  {!n.isRead && (
                    <span className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                  )}
                </button>
              );
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
