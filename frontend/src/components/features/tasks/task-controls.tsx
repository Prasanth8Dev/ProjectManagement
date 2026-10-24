'use client';
import { useState } from 'react';
import {
  PlayCircle,
  PauseCircle,
  Octagon,
  CheckCircle2,
  Eye,
  Lock,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  useStartTask,
  usePauseTask,
  useResumeTask,
  useBlockTask,
  useUnblockTask,
  useCompleteTask,
  useSendTaskForReview,
  useCompleteTaskReview,
  useCloseTask,
} from '@/hooks/use-tasks';
import { useToast } from '@/hooks/use-toast';
import { extractApiError } from '@/lib/utils/error';
import type { TaskStatus } from '@/types/task.types';

interface TaskControlsProps {
  taskId: string;
  status: TaskStatus;
  isPaused: boolean;
  isBlocked: boolean;
  hasAssignee: boolean;
}

type PromptKind = 'pause' | 'block' | 'complete' | 'sendForReview' | 'completeReview' | 'close';

const PROMPT_CONFIG: Record<
  PromptKind,
  { title: string; description: string; label: string; placeholder: string; confirmLabel: string }
> = {
  pause: {
    title: 'Pause this task',
    description: 'Optionally note why — this shows up in the activity timeline.',
    label: 'Reason (optional)',
    placeholder: 'e.g. Waiting on design sign-off',
    confirmLabel: 'Pause Task',
  },
  block: {
    title: 'Mark this task as blocked',
    description: 'Optionally note the blocker — this shows up in the activity timeline.',
    label: 'Reason (optional)',
    placeholder: 'e.g. Blocked on API dependency from another team',
    confirmLabel: 'Block Task',
  },
  complete: {
    title: 'Complete this task',
    description: 'Mark this task as done. You can add a closing note below.',
    label: 'Comment (optional)',
    placeholder: 'e.g. Deployed to staging, ready for QA',
    confirmLabel: 'Complete Task',
  },
  sendForReview: {
    title: 'Send for review',
    description: 'Move this task to review/QA.',
    label: 'Comment (optional)',
    placeholder: 'Anything the reviewer should know',
    confirmLabel: 'Send for Review',
  },
  completeReview: {
    title: 'Complete review',
    description: 'Mark the review/QA pass as complete.',
    label: 'Comment (optional)',
    placeholder: 'Review notes',
    confirmLabel: 'Complete Review',
  },
  close: {
    title: 'Close this task',
    description: 'This is the final step — closed tasks are done for good.',
    label: 'Comment (optional)',
    placeholder: 'Closing note',
    confirmLabel: 'Close Task',
  },
};

export function TaskControls({ taskId, status, isPaused, isBlocked, hasAssignee }: TaskControlsProps) {
  const { toast } = useToast();
  const [prompt, setPrompt] = useState<PromptKind | null>(null);
  const [note, setNote] = useState('');

  const startMutation = useStartTask(taskId);
  const pauseMutation = usePauseTask(taskId);
  const resumeMutation = useResumeTask(taskId);
  const blockMutation = useBlockTask(taskId);
  const unblockMutation = useUnblockTask(taskId);
  const completeMutation = useCompleteTask(taskId);
  const reviewMutation = useSendTaskForReview(taskId);
  const completeReviewMutation = useCompleteTaskReview(taskId);
  const closeMutation = useCloseTask(taskId);

  const mutationForPrompt: Record<PromptKind, ReturnType<typeof usePauseTask>> = {
    pause: pauseMutation,
    block: blockMutation,
    complete: completeMutation,
    sendForReview: reviewMutation,
    completeReview: completeReviewMutation,
    close: closeMutation,
  };

  const runSimple = (mutation: { mutate: (arg: any, opts?: any) => void }, successMsg: string) => {
    mutation.mutate(undefined, {
      onSuccess: () => toast({ title: successMsg }),
      onError: (error: unknown) =>
        toast({ title: 'Action failed', description: extractApiError(error), variant: 'destructive' }),
    });
  };

  const openPrompt = (kind: PromptKind) => {
    setNote('');
    setPrompt(kind);
  };

  const submitPrompt = () => {
    if (!prompt) return;
    const mutation = mutationForPrompt[prompt];
    mutation.mutate(note.trim() || undefined, {
      onSuccess: () => {
        toast({ title: PROMPT_CONFIG[prompt].confirmLabel + 'd' });
        setPrompt(null);
        setNote('');
      },
      onError: (error: unknown) =>
        toast({ title: 'Action failed', description: extractApiError(error), variant: 'destructive' }),
    });
  };

  const buttons: React.ReactNode[] = [];

  if (['BACKLOG', 'TODO'].includes(status)) {
    buttons.push(
      <Button
        key="start"
        size="sm"
        disabled={!hasAssignee || startMutation.isPending}
        onClick={() => runSimple(startMutation, 'Task started')}
        title={!hasAssignee ? 'Assign this task before starting it' : undefined}
      >
        {startMutation.isPending ? (
          <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
        ) : (
          <PlayCircle className="w-4 h-4 mr-1.5" />
        )}
        Start Task
      </Button>,
    );
  }

  if (status === 'IN_PROGRESS') {
    if (isBlocked) {
      buttons.push(
        <Button
          key="unblock"
          size="sm"
          variant="outline"
          disabled={unblockMutation.isPending}
          onClick={() => runSimple(unblockMutation, 'Task unblocked')}
        >
          <Octagon className="w-4 h-4 mr-1.5" />
          Unblock
        </Button>,
      );
    } else {
      if (isPaused) {
        buttons.push(
          <Button
            key="resume"
            size="sm"
            disabled={resumeMutation.isPending}
            onClick={() => runSimple(resumeMutation, 'Task resumed')}
          >
            <PlayCircle className="w-4 h-4 mr-1.5" />
            Resume
          </Button>,
        );
      } else {
        buttons.push(
          <Button key="pause" size="sm" variant="outline" onClick={() => openPrompt('pause')}>
            <PauseCircle className="w-4 h-4 mr-1.5" />
            Pause
          </Button>,
        );
      }
      buttons.push(
        <Button key="block" size="sm" variant="outline" onClick={() => openPrompt('block')}>
          <Octagon className="w-4 h-4 mr-1.5" />
          Block
        </Button>,
      );
      buttons.push(
        <Button key="complete" size="sm" onClick={() => openPrompt('complete')}>
          <CheckCircle2 className="w-4 h-4 mr-1.5" />
          Complete
        </Button>,
      );
    }
  }

  if (['IN_PROGRESS', 'DONE'].includes(status) && !isBlocked) {
    buttons.push(
      <Button key="review" size="sm" variant="outline" onClick={() => openPrompt('sendForReview')}>
        <Eye className="w-4 h-4 mr-1.5" />
        Send for Review
      </Button>,
    );
  }

  if (status === 'IN_REVIEW') {
    buttons.push(
      <Button key="completeReview" size="sm" onClick={() => openPrompt('completeReview')}>
        <Eye className="w-4 h-4 mr-1.5" />
        Complete Review
      </Button>,
    );
  }

  if (status === 'DONE') {
    buttons.push(
      <Button key="close" size="sm" variant="outline" onClick={() => openPrompt('close')}>
        <Lock className="w-4 h-4 mr-1.5" />
        Close Task
      </Button>,
    );
  }

  if (buttons.length === 0) {
    return null;
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">{buttons}</div>

      <Dialog open={!!prompt} onOpenChange={(open) => !open && setPrompt(null)}>
        {prompt && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{PROMPT_CONFIG[prompt].title}</DialogTitle>
              <DialogDescription>{PROMPT_CONFIG[prompt].description}</DialogDescription>
            </DialogHeader>
            <div className="space-y-2">
              <Label>{PROMPT_CONFIG[prompt].label}</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={PROMPT_CONFIG[prompt].placeholder}
                rows={3}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setPrompt(null)}>
                Cancel
              </Button>
              <Button onClick={submitPrompt} disabled={mutationForPrompt[prompt].isPending}>
                {mutationForPrompt[prompt].isPending && (
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                )}
                {PROMPT_CONFIG[prompt].confirmLabel}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </>
  );
}
