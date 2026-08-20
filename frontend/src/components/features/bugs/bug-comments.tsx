'use client';
import { CommentInput } from '@/components/features/comments/comment-input';
import { CommentItem } from '@/components/features/comments/comment-item';
import { useBugComments } from '@/hooks/use-comments';
import { Skeleton } from '@/components/ui/skeleton';
import { MessageSquare } from 'lucide-react';

interface BugCommentsProps {
  bugId: string;
}

export function BugComments({ bugId }: BugCommentsProps) {
  const { data: comments, isLoading } = useBugComments(bugId);
  const topLevelComments = (comments ?? []).filter((c: any) => !c.parentId);

  return (
    <div className="space-y-5">
      {/* Add comment input at top */}
      <CommentInput bugId={bugId} />

      {/* Comment list */}
      <div className="space-y-4">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-7 w-7 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-14 w-full rounded-md" />
                <Skeleton className="h-3 w-12" />
              </div>
            </div>
          ))
        ) : topLevelComments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <MessageSquare className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">
              No comments yet. Be the first to comment!
            </p>
          </div>
        ) : (
          topLevelComments.map((comment: any) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              bugId={bugId}
            />
          ))
        )}
      </div>
    </div>
  );
}
