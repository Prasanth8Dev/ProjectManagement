'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { UserSelect } from '@/components/shared/user-select';
import { UserAvatar } from '@/components/shared/user-avatar';
import { useProjectMembers } from '@/hooks/use-projects';
import { useCreateMeeting, useUpdateMeeting } from '@/hooks/use-meetings';
import { useToast } from '@/hooks/use-toast';
import { extractApiError } from '@/lib/utils/error';
import { MEETING_TYPE_OPTIONS } from '@/constants/meeting-types';
import type { Meeting } from '@/types/meeting.types';
import { cn } from '@/lib/utils/cn';

const meetingSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.string().min(1),
  scheduledAt: z.string().min(1, 'Date & time is required'),
  duration: z.union([z.number(), z.nan()]).optional(),
  organizerId: z.string().optional(),
  description: z.string().optional(),
});

type MeetingFormValues = z.infer<typeof meetingSchema>;

interface MeetingFormProps {
  projectId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting?: Meeting;
}

function toLocalInputValue(iso?: string | null) {
  if (!iso) return '';
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function MeetingForm({ projectId, open, onOpenChange, meeting }: MeetingFormProps) {
  const isEdit = !!meeting;
  const { toast } = useToast();
  const { data: members = [] } = useProjectMembers(projectId);
  const [participantIds, setParticipantIds] = useState<string[]>([]);

  const createMeeting = useCreateMeeting(projectId);
  const updateMeeting = useUpdateMeeting(meeting?.id ?? '');
  const isPending = createMeeting.isPending || updateMeeting.isPending;

  const form = useForm<MeetingFormValues>({
    resolver: zodResolver(meetingSchema),
    defaultValues: {
      title: '',
      type: 'STANDUP',
      scheduledAt: '',
      duration: undefined,
      organizerId: '',
      description: '',
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      title: meeting?.title ?? '',
      type: meeting?.type ?? 'STANDUP',
      scheduledAt: toLocalInputValue(meeting?.scheduledAt),
      duration: meeting?.duration ?? undefined,
      organizerId: meeting?.organizerId ?? '',
      description: meeting?.description ?? '',
    });
    setParticipantIds(meeting?.participants?.map((p) => p.userId) ?? []);
  }, [open, meeting, form]);

  const toggleParticipant = (userId: string) => {
    setParticipantIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const onSubmit = async (values: MeetingFormValues) => {
    const payload = {
      title: values.title,
      type: values.type as any,
      scheduledAt: new Date(values.scheduledAt).toISOString(),
      duration: values.duration && !Number.isNaN(values.duration) ? values.duration : undefined,
      organizerId: values.organizerId || undefined,
      participantIds,
      description: values.description || undefined,
    };

    try {
      if (isEdit && meeting) {
        await updateMeeting.mutateAsync(payload);
        toast({ title: 'Meeting updated' });
      } else {
        await createMeeting.mutateAsync(payload);
        toast({ title: 'Meeting created' });
      }
      onOpenChange(false);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: extractApiError(err) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Meeting' : 'Schedule Meeting'}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Daily Stand-up" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Type</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {MEETING_TYPE_OPTIONS.map((o) => (
                          <SelectItem key={o.value} value={o.value}>
                            {o.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Duration (min)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        placeholder="30"
                        value={field.value ?? ''}
                        onChange={(e) =>
                          field.onChange(e.target.value ? e.target.valueAsNumber : undefined)
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="scheduledAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date & Time *</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="organizerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Organizer</FormLabel>
                  <FormControl>
                    <UserSelect
                      value={field.value || undefined}
                      onChange={(v) => field.onChange(v ?? '')}
                      placeholder="Select organizer"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div>
              <FormLabel>Participants</FormLabel>
              <div className="mt-2 max-h-40 overflow-y-auto rounded-md border p-2 space-y-1">
                {members.length === 0 && (
                  <p className="text-xs text-muted-foreground px-1 py-2">No project members yet.</p>
                )}
                {members.map((m: any) => {
                  const user = m.user ?? m;
                  const checked = participantIds.includes(user.id);
                  return (
                    <button
                      type="button"
                      key={user.id}
                      onClick={() => toggleParticipant(user.id)}
                      className={cn(
                        'flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-sm hover:bg-muted transition-colors',
                        checked && 'bg-muted'
                      )}
                    >
                      <div
                        className={cn(
                          'h-3.5 w-3.5 rounded-sm border flex items-center justify-center shrink-0',
                          checked ? 'bg-primary border-primary' : 'border-input'
                        )}
                      >
                        {checked && <div className="h-1.5 w-1.5 rounded-[1px] bg-primary-foreground" />}
                      </div>
                      <UserAvatar user={user} size="xs" />
                      <span className="truncate">{user.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={3} placeholder="What's this meeting about?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                {isEdit ? 'Update Meeting' : 'Schedule Meeting'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
