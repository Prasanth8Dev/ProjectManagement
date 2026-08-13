'use client';
import { useState, useRef } from 'react';
import { Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useCreateComment } from '@/hooks/use-comments';
import { toast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/stores/auth.store';

interface CommentInputProps {
  taskId: string;
  parentId?: string;
  onSuccess?: () => void;
  placeholder?: string;
  isLoading?: boolean;
  autoFocus?: boolean;
}

export function CommentInput({
  taskId,
  parentId,
  onSuccess,
  placeholder = 'Write a comment...',
  autoFocus,
}: CommentInputProps) {
  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { mutate: createComment, isPending } = useCreateComment(taskId);
  const { currentUser } = useAuthStore();

  const handleSubmit = () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    if (!currentUser?.id) {
      toast({
        title: 'Failed to add comment',
        description: 'You must be logged in to comment.',
        variant: 'destructive',
      });
      return;
    }
    createComment(
      { content: trimmed, parentId, authorId: currentUser.id },
      {
        onSuccess: () => {
          setContent('');
          onSuccess?.();
          toast({ title: parentId ? 'Reply added' : 'Comment added' });
        },
        onError: (err: any) =>
          toast({
            title: 'Failed to add comment',
            description:
              err?.response?.data?.message?.toString?.() ?? undefined,
            variant: 'destructive',
          }),
      }
    );
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-2">
      <Textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={parentId ? 2 : 3}
        className="resize-none text-sm"
        autoFocus={autoFocus}
        disabled={isPending}
      />
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Press <kbd className="px-1 py-0.5 rounded bg-muted text-xs">⌘</kbd>+
          <kbd className="px-1 py-0.5 rounded bg-muted text-xs">Enter</kbd> to submit
        </p>
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={isPending || !content.trim()}
          loading={isPending}
        >
          <Send className="h-3.5 w-3.5 mr-1.5" />
          {parentId ? 'Reply' : 'Comment'}
        </Button>
      </div>
    </div>
  );
}
