'use client';
import { useState } from 'react';
import { MessageSquare, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { UserAvatar } from '@/components/shared/user-avatar';
import { useDailyUpdateReplies, useCreateDailyUpdateReply } from '@/hooks/use-updates';
import { useAuthStore } from '@/stores/auth.store';
import { useToast } from '@/hooks/use-toast';
import { extractApiError } from '@/lib/utils/error';
import { formatRelativeTime } from '@/lib/utils/date';
import { UPDATE_REPLY_ROLES } from '@/types/user.types';

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  PROJECT_MANAGER: 'Project Manager',
};

export function UpdateReplies({
  updateId,
  updateAuthorId,
}: {
  updateId: string;
  updateAuthorId?: string;
}) {
  const { toast } = useToast();
  const currentUser = useAuthStore((s) => s.currentUser);
  const { data: replies = [], isLoading } = useDailyUpdateReplies(updateId);
  const createReply = useCreateDailyUpdateReply(updateId);
  const [content, setContent] = useState('');

  const isLeadership = !!currentUser && UPDATE_REPLY_ROLES.includes(currentUser.role);
  const isAuthor = !!currentUser && currentUser.id === updateAuthorId;
  const canReply = isLeadership || isAuthor;

  const submit = async () => {
    const text = content.trim();
    if (!text || !currentUser) return;
    try {
      await createReply.mutateAsync({ content: text, authorId: currentUser.id });
      setContent('');
      toast({ title: 'Reply posted' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: extractApiError(err) });
    }
  };

  if (!canReply && !isLoading && replies.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          Replies{' '}
          {replies.length > 0 && (
            <span className="text-muted-foreground font-normal">({replies.length})</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <Skeleton className="h-16 w-full" />
        ) : (
          replies.map((r) => (
            <div key={r.id} className="flex gap-3">
              <UserAvatar
                user={{ name: r.author.name, avatar: r.author.avatar ?? undefined }}
                size="sm"
                className="shrink-0 mt-0.5"
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-semibold">{r.author.name}</span>
                  {ROLE_LABELS[r.author.role] && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                      {r.author.jobTitle || ROLE_LABELS[r.author.role]}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeTime(r.createdAt)}
                  </span>
                </div>
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words mt-1">
                  {r.content}
                </p>
              </div>
            </div>
          ))
        )}

        {canReply && (
          <div className="space-y-2 pt-1">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={3}
              placeholder={
                isLeadership && !isAuthor ? 'Write a reply to this work update...' : 'Reply...'
              }
              className="resize-none text-sm"
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                  e.preventDefault();
                  submit();
                }
              }}
            />
            <div className="flex justify-end">
              <Button
                size="sm"
                onClick={submit}
                disabled={!content.trim() || createReply.isPending}
              >
                <Send className="w-3.5 h-3.5 mr-1.5" />
                Reply
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
