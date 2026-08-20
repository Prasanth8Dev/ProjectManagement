'use client';
import { useState, useRef } from 'react';
import { Send } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Popover, PopoverAnchor, PopoverContent } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { UserAvatar } from '@/components/shared/user-avatar';
import { useCreateComment, useCreateBugComment } from '@/hooks/use-comments';
import { useUserSearch } from '@/hooks/use-members';
import { useDebounce } from '@/hooks/use-debounce';
import { toast } from '@/components/ui/use-toast';
import { useAuthStore } from '@/stores/auth.store';

interface CommentInputProps {
  taskId?: string;
  bugId?: string;
  parentId?: string;
  onSuccess?: () => void;
  placeholder?: string;
  isLoading?: boolean;
  autoFocus?: boolean;
}

export function CommentInput({
  taskId,
  bugId,
  parentId,
  onSuccess,
  placeholder = 'Write a comment...',
  autoFocus,
}: CommentInputProps) {
  const [content, setContent] = useState('');
  // Tracks users mentioned via the @autocomplete so we can send their ids
  // alongside the comment. Keyed by id -> name so we can tell, at submit
  // time, whether the "@Name" text is still actually present in the box.
  const [mentionedUsers, setMentionedUsers] = useState<Record<string, string>>({});
  const [mentionQuery, setMentionQuery] = useState<string | null>(null);
  const [mentionStart, setMentionStart] = useState<number | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const debouncedMentionQuery = useDebounce(mentionQuery ?? '', 200);
  const { data: mentionResults = [] } = useUserSearch(debouncedMentionQuery, mentionQuery !== null);

  // Both hooks are always called (rules-of-hooks) — only the one matching
  // the id that was actually passed in gets invoked on submit.
  const { mutate: createTaskComment, isPending: isCreatingTaskComment } = useCreateComment(taskId ?? '');
  const { mutate: createBugComment, isPending: isCreatingBugComment } = useCreateBugComment(bugId ?? '');
  const createComment = bugId ? createBugComment : createTaskComment;
  const isPending = bugId ? isCreatingBugComment : isCreatingTaskComment;
  const { currentUser } = useAuthStore();

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setContent(value);

    const cursor = e.target.selectionStart ?? value.length;
    const uptoCursor = value.slice(0, cursor);
    const match = uptoCursor.match(/(?:^|\s)@([\w.-]*)$/);
    if (match) {
      setMentionQuery(match[1]);
      setMentionStart(cursor - match[1].length - 1);
    } else {
      setMentionQuery(null);
      setMentionStart(null);
    }
  };

  const insertMention = (userId: string, name: string) => {
    if (mentionStart === null) return;
    const cursor = textareaRef.current?.selectionStart ?? content.length;
    const before = content.slice(0, mentionStart);
    const after = content.slice(cursor);
    const insertion = `@${name} `;
    const nextValue = `${before}${insertion}${after}`;

    setContent(nextValue);
    setMentionedUsers((prev) => ({ ...prev, [userId]: name }));
    setMentionQuery(null);
    setMentionStart(null);

    requestAnimationFrame(() => {
      const el = textareaRef.current;
      if (!el) return;
      el.focus();
      const pos = before.length + insertion.length;
      el.setSelectionRange(pos, pos);
    });
  };

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

    // Only send mentions whose "@Name" text is still actually in the
    // comment (so deleting the text also drops the notification).
    const mentions = Object.entries(mentionedUsers)
      .filter(([, name]) => content.includes(`@${name}`))
      .map(([id]) => id);

    createComment(
      { content: trimmed, parentId, authorId: currentUser.id, mentions },
      {
        onSuccess: () => {
          setContent('');
          setMentionedUsers({});
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
    if (mentionQuery !== null && e.key === 'Escape') {
      setMentionQuery(null);
      setMentionStart(null);
      return;
    }
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="space-y-2">
      <Popover open={mentionQuery !== null}>
        <PopoverAnchor asChild>
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            rows={parentId ? 2 : 3}
            className="resize-none text-sm"
            autoFocus={autoFocus}
            disabled={isPending}
          />
        </PopoverAnchor>
        <PopoverContent
          align="start"
          className="w-64 p-0"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command>
            <CommandList>
              <CommandEmpty>No matching users.</CommandEmpty>
              <CommandGroup heading="Mention someone">
                {mentionResults.map((u: any) => (
                  <CommandItem key={u.id} value={u.name} onSelect={() => insertMention(u.id, u.name)}>
                    <div className="flex items-center gap-2">
                      <UserAvatar user={u} size="xs" />
                      <span className="text-sm">{u.name}</span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      <div className="flex items-center justify-between">
        <p className="text-xs text-muted-foreground">
          Press <kbd className="px-1 py-0.5 rounded bg-muted text-xs">⌘</kbd>+
          <kbd className="px-1 py-0.5 rounded bg-muted text-xs">Enter</kbd> to submit ·{' '}
          <kbd className="px-1 py-0.5 rounded bg-muted text-xs">@</kbd> to mention
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
