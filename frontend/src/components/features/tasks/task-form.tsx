'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from '@/components/ui/sheet';
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
import { DatePicker } from '@/components/shared/date-picker';
import { UserSelect } from '@/components/shared/user-select';
import { createTaskSchema, CreateTaskFormValues } from '@/lib/validators/task.schema';
import { useCreateTask, useUpdateTask } from '@/hooks/use-tasks';
import { useProjects } from '@/hooks/use-projects';
import { useMilestones } from '@/hooks/use-milestones';
import { Task } from '@/types/task.types';
import { TASK_STATUS_OPTIONS } from '@/constants/task-statuses';
import { TASK_PRIORITY_OPTIONS } from '@/constants/priorities';
import { toast } from '@/components/ui/use-toast';
import { toISODateString } from '@/lib/utils/date';

interface TaskFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultProjectId?: string;
  parentTaskId?: string;
  task?: Task;
}

export function TaskForm({
  open,
  onOpenChange,
  defaultProjectId,
  parentTaskId,
  task,
}: TaskFormProps) {
  const isEdit = !!task;
  const { mutate: createTask, isPending: isCreating } = useCreateTask();
  const { mutate: updateTask, isPending: isUpdating } = useUpdateTask(task?.id ?? '');
  const { data: projectsData } = useProjects({ limit: 100 });
  const projects = projectsData?.data ?? [];

  const form = useForm<CreateTaskFormValues>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: task?.title ?? '',
      description: task?.description ?? '',
      projectId: task?.projectId ?? defaultProjectId ?? '',
      status: task?.status ?? 'TODO',
      priority: task?.priority ?? 'MEDIUM',
      assigneeId: task?.assigneeId ?? '',
      milestoneId: task?.milestoneId ?? '',
      dueDate: task?.dueDate ?? '',
      estimatedHours: task?.estimatedHours ?? undefined,
    },
  });

  const watchedProjectId = form.watch('projectId');
  const { data: milestonesResp } = useMilestones(watchedProjectId);
  const milestones = (milestonesResp as any)?.data ?? milestonesResp ?? [];

  // Reset form when dialog opens/closes or task changes
  useEffect(() => {
    if (open) {
      form.reset({
        title: task?.title ?? '',
        description: task?.description ?? '',
        projectId: task?.projectId ?? defaultProjectId ?? '',
        status: task?.status ?? 'TODO',
        priority: task?.priority ?? 'MEDIUM',
        assigneeId: task?.assigneeId ?? '',
        dueDate: task?.dueDate ?? '',
        estimatedHours: task?.estimatedHours ?? undefined,
        milestoneId: task?.milestoneId ?? '',
      });
    }
  }, [open, task, defaultProjectId, form]);

  const onSubmit = (values: CreateTaskFormValues) => {
    const payload = {
      ...values,
      assigneeId: values.assigneeId || undefined,
      milestoneId: values.milestoneId || undefined,
      dueDate: values.dueDate || undefined,
    };

    if (isEdit && task) {
      updateTask(
        payload,
        {
          onSuccess: () => {
            toast({ title: 'Task updated successfully' });
            onOpenChange(false);
          },
          onError: () =>
            toast({ title: 'Failed to update task', variant: 'destructive' }),
        }
      );
    } else {
      createTask(
        { ...payload, parentTaskId },
        {
          onSuccess: () => {
            toast({ title: 'Task created successfully' });
            onOpenChange(false);
            form.reset();
          },
          onError: () =>
            toast({ title: 'Failed to create task', variant: 'destructive' }),
        }
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto flex flex-col">
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Edit Task' : 'Create Task'}</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-y-auto"
          >
            <div className="flex-1 space-y-4 py-4 pr-1">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title *</FormLabel>
                    <FormControl>
                      <Input placeholder="Task title..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add a description..."
                        rows={4}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Project + Milestone row */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="projectId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project *</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={!!defaultProjectId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select project" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {projects.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
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
                  name="milestoneId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Milestone</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ''}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="No milestone" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">No milestone</SelectItem>
                          {(milestones as any[]).length === 0 && watchedProjectId && (
                            <div className="px-3 py-2 text-xs text-muted-foreground">
                              No milestones yet — create one in Project → Milestones
                            </div>
                          )}
                          {(milestones as any[]).map((m: any) => (
                            <SelectItem key={m.id} value={m.id}>
                              {m.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Status + Priority */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TASK_STATUS_OPTIONS.map((o) => (
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
                  name="priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Priority</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
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
              </div>

              {/* Assignee */}
              <FormField
                control={form.control}
                name="assigneeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assignee</FormLabel>
                    <FormControl>
                      <UserSelect
                        value={field.value ?? undefined}
                        onChange={(v) => field.onChange(v ?? '')}
                        placeholder="Unassigned"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Due Date + Estimated Hours */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value || null}
                          onChange={(date) =>
                            field.onChange(
                              date ? toISODateString(date) : ''
                            )
                          }
                          placeholder="Pick a date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="estimatedHours"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Est. Hours</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="0"
                          max="999"
                          step="0.5"
                          placeholder="0"
                          {...field}
                          onChange={(e) =>
                            field.onChange(
                              e.target.value ? e.target.valueAsNumber : undefined
                            )
                          }
                          value={field.value ?? ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <SheetFooter className="pt-4 border-t mt-auto">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" loading={isCreating || isUpdating}>
                {isEdit ? 'Update Task' : 'Create Task'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
