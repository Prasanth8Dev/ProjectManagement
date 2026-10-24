'use client';
import { useState } from 'react';
import Link from 'next/link';
import { format } from 'date-fns';
import {
  MoreHorizontal,
  Edit2,
  Trash2,
  MessageSquare,
  ArrowRightCircle,
  Loader2,
  CalendarClock,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { UserAvatar } from '@/components/shared/user-avatar';
import { CommentInput } from '@/components/features/comments/comment-input';
import { CommentItem } from '@/components/features/comments/comment-item';
import { useActionItemComments } from '@/hooks/use-comments';
import {
  useDeleteActionItem,
  useConvertActionItemToTask,
} from '@/hooks/use-meetings';
import { useToast } from '@/hooks/use-toast';
import { extractApiError } from '@/lib/utils/error';
import { ACTION_ITEM_STATUS_CONFIG } from '@/constants/meeting-types';
import { TASK_PRIORITY_CONFIG } from '@/constants/priorities';
import { TASK_STATUS_CONFIG } from '@/constants/task-statuses';
import { ROUTES } from '@/constants/routes';
import { ActionItemForm } from './action-item-form';
import type { MeetingActionItem } from '@/types/meeting.types';
import { cn } from '@/lib/utils/cn';

export function ActionItemCard({
  meetingId,
  actionItem,
}: {
  meetingId: string;
  actionItem: MeetingActionItem;
}) {
  const { toast } = useToast();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [convertOpen, setConvertOpen] = useState(false);
  const [showComments, setShowComments] = useState(false);

  const deleteActionItem = useDeleteActionItem(meetingId);
  const convertToTask = useConvertActionItemToTask(meetingId);
  const { data: comments = [] } = useActionItemComments(showComments ? actionItem.id : '');

  const statusCfg = ACTION_ITEM_STATUS_CONFIG[actionItem.status] ?? ACTION_ITEM_STATUS_CONFIG.OPEN;
  const priorityCfg = TASK_PRIORITY_CONFIG[actionItem.priority as keyof typeof TASK_PRIORITY_CONFIG];
  const isOverdue =
    actionItem.dueDate &&
    actionItem.status !== 'DONE' &&
    actionItem.status !== 'CONVERTED' &&
    new Date(actionItem.dueDate) < new Date();

  const handleDelete = async () => {
    try {
      await deleteActionItem.mutateAsync(actionItem.id);
      toast({ title: 'Action item deleted' });
      setDeleteOpen(false);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: extractApiError(err) });
    }
  };

  const handleConvert = async () => {
    try {
      await convertToTask.mutateAsync(actionItem.id);
      toast({ title: 'Converted to task' });
      setConvertOpen(false);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: extractApiError(err) });
    }
  };

  return (
    <Card>
      <CardContent className="pt-4 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-medium text-sm">{actionItem.title}</h4>
              <span
                className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                  statusCfg.bgColor,
                  statusCfg.color
                )}
              >
                {statusCfg.label}
              </span>
              {priorityCfg && (
                <span
                  className={cn(
                    'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                    priorityCfg.bgColor,
                    priorityCfg.color
                  )}
                >
                  {priorityCfg.label}
                </span>
              )}
            </div>
            {actionItem.description && (
              <p className="text-sm text-muted-foreground mt-1">{actionItem.description}</p>
            )}

            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
              {actionItem.assignee && (
                <span className="flex items-center gap-1.5">
                  <UserAvatar user={actionItem.assignee} size="xs" />
                  {actionItem.assignee.name}
                </span>
              )}
              {actionItem.dueDate && (
                <span
                  className={cn(
                    'flex items-center gap-1',
                    isOverdue && 'text-red-600 font-medium'
                  )}
                >
                  <CalendarClock className="w-3.5 h-3.5" />
                  {format(new Date(actionItem.dueDate), 'MMM d, yyyy')}
                  {isOverdue ? ' (overdue)' : ''}
                </span>
              )}
              <button
                onClick={() => setShowComments((v) => !v)}
                className="flex items-center gap-1 hover:text-foreground transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                {actionItem._count?.comments ?? 0} comment
                {(actionItem._count?.comments ?? 0) === 1 ? '' : 's'}
              </button>
            </div>

            {actionItem.taskId && actionItem.task && (
              <Link
                href={ROUTES.TASK(actionItem.taskId)}
                className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
              >
                <ArrowRightCircle className="w-3.5 h-3.5" />
                Task #{actionItem.task.id.slice(0, 8)} —{' '}
                {TASK_STATUS_CONFIG[actionItem.task.status as keyof typeof TASK_STATUS_CONFIG]
                  ?.label ?? actionItem.task.status}
              </Link>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0">
            {!actionItem.taskId && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 text-xs"
                onClick={() => setConvertOpen(true)}
              >
                Convert to Task
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-36">
                <DropdownMenuItem onClick={() => setEditOpen(true)}>
                  <Edit2 className="h-3.5 w-3.5 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteOpen(true)}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {showComments && (
          <div className="mt-3 pt-3 border-t space-y-3">
            {comments.length > 0 && (
              <div className="space-y-3">
                {comments.map((c: any) => (
                  <CommentItem key={c.id} comment={c} actionItemId={actionItem.id} />
                ))}
              </div>
            )}
            <CommentInput actionItemId={actionItem.id} placeholder="Add a comment..." />
          </div>
        )}
      </CardContent>

      <ActionItemForm
        meetingId={meetingId}
        open={editOpen}
        onOpenChange={setEditOpen}
        actionItem={actionItem}
      />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete this action item?"
        description="This can't be undone."
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={deleteActionItem.isPending}
      />

      <ConfirmDialog
        open={convertOpen}
        onOpenChange={setConvertOpen}
        title="Convert to task?"
        description="This creates a new task in this project from the action item's title, description, assignee, priority, and due date. The task stays linked to this action item."
        confirmLabel="Convert"
        onConfirm={handleConvert}
        isLoading={convertToTask.isPending}
      />
    </Card>
  );
}
