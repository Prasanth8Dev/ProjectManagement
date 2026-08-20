'use client';
import { useState } from 'react';
import { MoreHorizontal, Edit2, Trash2, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { UserAvatar } from '@/components/shared/user-avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Comment } from '@/types/comment.types';
import { useUpdateComment, useDeleteComment } from '@/hooks/use-comments';
import { QUERY_KEYS } from '@/constants/query-keys';
import { CommentInput } from './comment-input';
import { formatRelativeTime as formatRelative } from '@/lib/utils/date';
import { toast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/stores/auth.store';
import { cn } from '@/lib/utils/cn';

interface CommentItemProps {
  comment: Comment;
  taskId?: string;
  bugId?: string;
  level?: number;
}

export function CommentItem({ comment, taskId, bugId, level = 0 }: CommentItemProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [showReplyInput, setShowReplyInput] = useState(false);
  const [showReplies, setShowReplies] = useState(false);
  const { currentUser } = useAuthStore();

  const invalidateKey = bugId ? QUERY_KEYS.bugs.comments(bugId) : QUERY_KEYS.tasks.comments(taskId ?? '');
  const detailKey = bugId ? QUERY_KEYS.bugs.detail(bugId) : QUERY_KEYS.tasks.detail(taskId ?? '');
  const { mutate: updateComment, isPending: isUpdating } = useUpdateComment(invalidateKey);
  const { mutate: deleteComment, isPending: isDeleting } = useDeleteComment(invalidateKey, detailKey);

  const isAuthor = !!currentUser?.id && comment.author?.id === currentUser.id;
  const hasReplies = (comment.replies?.length ?? 0) > 0;

  const handleSaveEdit = () => {
    const trimmed = editContent.trim();
    if (!trimmed) return;
    updateComment(
      { commentId: comment.id, data: { content: trimmed } },
      {
        onSuccess: () => {
          setIsEditing(false);
          toast({ title: 'Comment updated' });
        },
        onError: () =>
          toast({ title: 'Failed to update comment', variant: 'destructive' }),
      }
    );
  };

  const handleDelete = () => {
    deleteComment(comment.id, {
      onSuccess: () => toast({ title: 'Comment deleted' }),
      onError: () =>
        toast({ title: 'Failed to delete comment', variant: 'destructive' }),
    });
  };

  return (
    <div
      className={cn(
        'space-y-3',
        level > 0 && 'ml-9 pl-4 border-l-2 border-border'
      )}
    >
      <div className="flex gap-3">
        <UserAvatar
          user={comment.author}
          size="sm"
          className="shrink-0 mt-0.5"
        />
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold">{comment.author.name}</span>
              <span className="text-xs text-muted-foreground">
                {formatRelative(comment.createdAt)}
              </span>
              {comment.isEdited && (
                <span className="text-xs text-muted-foreground italic">
                  (edited)
                </span>
              )}
            </div>
            {isAuthor && !isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 opacity-0 group-hover:opacity-100 focus:opacity-100"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-36">
                  <DropdownMenuItem
                    onClick={() => {
                      setEditContent(comment.content);
                      setIsEditing(true);
                    }}
                  >
                    <Edit2 className="h-3.5 w-3.5 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={handleDelete}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Content / Edit mode */}
          {isEditing ? (
            <div className="space-y-2">
              <Textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={3}
                className="resize-none text-sm"
                autoFocus
                onKeyDown={(e) => {
                  if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
                    e.preventDefault();
                    handleSaveEdit();
                  }
                  if (e.key === 'Escape') setIsEditing(false);
                }}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleSaveEdit}
                  loading={isUpdating}
                  disabled={!editContent.trim()}
                >
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {comment.content}
            </p>
          )}

          {/* Actions */}
          {level === 0 && !isEditing && (
            <div className="flex items-center gap-2 mt-2">
              <Button
                variant="ghost"
                size="sm"
                className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                onClick={() => {
                  setShowReplyInput((v) => !v);
                  setShowReplies(true);
                }}
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1" />
                Reply
              </Button>
              {hasReplies && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                  onClick={() => setShowReplies((v) => !v)}
                >
                  {showReplies ? (
                    <ChevronUp className="h-3.5 w-3.5 mr-1" />
                  ) : (
                    <ChevronDown className="h-3.5 w-3.5 mr-1" />
                  )}
                  {comment.replies?.length}{' '}
                  {comment.replies?.length === 1 ? 'reply' : 'replies'}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Reply input */}
      {showReplyInput && level === 0 && (
        <div className="ml-9 pl-4 border-l-2 border-border">
          <CommentInput
            taskId={taskId}
            bugId={bugId}
            parentId={comment.id}
            autoFocus
            onSuccess={() => {
              setShowReplyInput(false);
              setShowReplies(true);
            }}
            placeholder={`Reply to ${comment.author.name}...`}
          />
        </div>
      )}

      {/* Nested replies */}
      {showReplies && hasReplies && (
        <div className="space-y-3">
          {comment.replies?.map((reply) => (
            <CommentItem
              key={reply.id}
              comment={reply}
              taskId={taskId}
              bugId={bugId}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
