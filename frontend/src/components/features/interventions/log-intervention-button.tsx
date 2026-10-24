'use client';
import { useState } from 'react';
import { MessageSquareWarning, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useMembers } from '@/hooks/use-members';
import { useCreateTaskIntervention, useCreateBugIntervention } from '@/hooks/use-interventions';
import { useToast } from '@/hooks/use-toast';
import { extractApiError } from '@/lib/utils/error';

interface LogInterventionButtonProps {
  scope: 'task' | 'bug';
  entityId: string;
  /** Pre-selects the current assignee, if any. */
  employeeId?: string | null;
  className?: string;
}

export function LogInterventionButton({
  scope,
  entityId,
  employeeId: defaultEmployeeId,
  className,
}: LogInterventionButtonProps) {
  const [open, setOpen] = useState(false);
  const [employeeId, setEmployeeId] = useState(defaultEmployeeId ?? '');
  const [note, setNote] = useState('');
  const { toast } = useToast();

  const { data: membersResp } = useMembers({ limit: 100 } as any);
  const members = membersResp?.data ?? [];

  const taskMutation = useCreateTaskIntervention(entityId);
  const bugMutation = useCreateBugIntervention(entityId);
  const mutation = scope === 'task' ? taskMutation : bugMutation;

  const handleOpenChange = (next: boolean) => {
    setOpen(next);
    if (next) {
      setEmployeeId(defaultEmployeeId ?? '');
      setNote('');
    }
  };

  const handleSubmit = () => {
    if (!employeeId || !note.trim()) return;
    mutation.mutate(
      { employeeId, note: note.trim() },
      {
        onSuccess: () => {
          toast({ title: 'Intervention logged' });
          setOpen(false);
          setNote('');
        },
        onError: (error) => {
          toast({
            title: 'Failed to log intervention',
            description: extractApiError(error),
            variant: 'destructive',
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={className}
        onClick={() => handleOpenChange(true)}
      >
        <MessageSquareWarning className="w-4 h-4 mr-1.5" />
        Log Intervention
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Log a manual intervention</DialogTitle>
          <DialogDescription>
            Note that you had to step in — clarify requirements, redo part of the work,
            chase progress, etc. This feeds the employee&rsquo;s performance signal.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Employee</Label>
            <Select value={employeeId} onValueChange={setEmployeeId}>
              <SelectTrigger>
                <SelectValue placeholder="Select the employee this is about" />
              </SelectTrigger>
              <SelectContent>
                {(members as any[]).map((u: any) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Note</Label>
            <Textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="What did you have to step in for?"
              rows={4}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!employeeId || !note.trim() || mutation.isPending}
          >
            {mutation.isPending && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
            Log Intervention
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
