'use client';
import { useEffect } from 'react';
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
import { useCreateActionItem, useUpdateActionItem } from '@/hooks/use-meetings';
import { useToast } from '@/hooks/use-toast';
import { extractApiError } from '@/lib/utils/error';
import { TASK_PRIORITY_OPTIONS } from '@/constants/priorities';
import { ACTION_ITEM_STATUS_OPTIONS } from '@/constants/meeting-types';
import type { MeetingActionItem } from '@/types/meeting.types';

const actionItemSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  assigneeId: z.string().optional(),
  priority: z.string().min(1),
  dueDate: z.string().optional(),
  status: z.string().optional(),
});

type ActionItemFormValues = z.infer<typeof actionItemSchema>;

interface ActionItemFormProps {
  meetingId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  actionItem?: MeetingActionItem;
}

export function ActionItemForm({ meetingId, open, onOpenChange, actionItem }: ActionItemFormProps) {
  const isEdit = !!actionItem;
  const { toast } = useToast();
  const createActionItem = useCreateActionItem(meetingId);
  const updateActionItem = useUpdateActionItem(meetingId);
  const isPending = createActionItem.isPending || updateActionItem.isPending;

  const form = useForm<ActionItemFormValues>({
    resolver: zodResolver(actionItemSchema),
    defaultValues: {
      title: '',
      description: '',
      assigneeId: '',
      priority: 'MEDIUM',
      dueDate: '',
      status: 'OPEN',
    },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({
      title: actionItem?.title ?? '',
      description: actionItem?.description ?? '',
      assigneeId: actionItem?.assigneeId ?? '',
      priority: actionItem?.priority ?? 'MEDIUM',
      dueDate: actionItem?.dueDate ? actionItem.dueDate.slice(0, 10) : '',
      status: actionItem?.status ?? 'OPEN',
    });
  }, [open, actionItem, form]);

  const onSubmit = async (values: ActionItemFormValues) => {
    const payload = {
      title: values.title,
      description: values.description || undefined,
      assigneeId: values.assigneeId || undefined,
      priority: values.priority as any,
      dueDate: values.dueDate || undefined,
    };

    try {
      if (isEdit && actionItem) {
        await updateActionItem.mutateAsync({
          actionItemId: actionItem.id,
          data: { ...payload, status: values.status as any },
        });
        toast({ title: 'Action item updated' });
      } else {
        await createActionItem.mutateAsync(payload);
        toast({ title: 'Action item added' });
      }
      onOpenChange(false);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: extractApiError(err) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Edit Action Item' : 'Add Action Item'}</DialogTitle>
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
                    <Input placeholder="e.g. Fix login redirect bug" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="assigneeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignee</FormLabel>
                  <FormControl>
                    <UserSelect
                      value={field.value || undefined}
                      onChange={(v) => field.onChange(v ?? '')}
                      placeholder="Unassigned"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TASK_PRIORITY_OPTIONS.map((o) => (
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
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Due Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {isEdit && (
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={actionItem?.status === 'CONVERTED'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ACTION_ITEM_STATUS_OPTIONS.filter(
                          (o) => o.value !== 'CONVERTED' || actionItem?.status === 'CONVERTED'
                        ).map((o) => (
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
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />}
                {isEdit ? 'Update' : 'Add Action Item'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
