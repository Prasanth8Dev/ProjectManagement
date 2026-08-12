'use client';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
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
import { Checkbox } from '@/components/ui/checkbox';
import { DatePicker } from '@/components/shared/date-picker';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCreateDailyUpdate, useUpdateDailyUpdate } from '@/hooks/use-daily-updates';
import { useTasks } from '@/hooks/use-tasks';
import { useProjects } from '@/hooks/use-projects';
import { DailyWorkUpdate, MoodType } from '@/types/daily-update.types';
import { ROUTES } from '@/constants/routes';
import { toast } from '@/components/ui/use-toast';
import { toISODateString } from '@/lib/utils/date';
import { TaskStatusBadge } from '@/components/shared/status-badge';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useAuthStore } from '@/stores/auth.store';

const MOOD_OPTIONS: { value: MoodType; emoji: string; label: string }[] = [
  { value: 1, emoji: '😞', label: 'Bad' },
  { value: 2, emoji: '😐', label: 'Okay' },
  { value: 3, emoji: '🙂', label: 'Good' },
  { value: 4, emoji: '😊', label: 'Great' },
  { value: 5, emoji: '🤩', label: 'Excellent' },
];

const updateFormSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  summary: z.string().min(1, 'Summary is required'),
  hoursWorked: z.coerce.number().min(0).max(16),
  tomorrowPlan: z.string().optional(),
  blockers: z.string().optional(),
  mood: z.number().min(1).max(5).optional(),
  taskEntries: z
    .array(
      z.object({
        taskId: z.string(),
        isCompleted: z.boolean().default(false),
        isBlocked: z.boolean().default(false),
        hoursSpent: z.coerce.number().min(0).max(24).optional(),
      })
    )
    .optional(),
  projectIds: z.array(z.string()).optional(),
});

type UpdateFormValues = z.infer<typeof updateFormSchema>;

interface UpdateFormProps {
  update?: DailyWorkUpdate;
  onSuccess?: () => void;
}

export function UpdateForm({ update, onSuccess }: UpdateFormProps) {
  const isEdit = !!update;
  const router = useRouter();
  const currentUserId = useAuthStore((s) => s.currentUser?.id ?? '');

  const { mutate: createUpdate, isPending: isCreating } = useCreateDailyUpdate();
  const { mutate: editUpdate, isPending: isEditing } = useUpdateDailyUpdate(update?.id ?? '');

  const { data: tasksData } = useTasks({ assigneeId: currentUserId, limit: 50 });
  const { data: projectsData } = useProjects({ limit: 50 });

  const tasks = tasksData?.data ?? [];
  const projects = projectsData?.data ?? [];

  const [selectedMood, setSelectedMood] = useState<MoodType | undefined>(
    update?.mood
  );
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>(
    update?.projects?.map((p) => p.id) ?? []
  );
  const [taskEntries, setTaskEntries] = useState<
    Record<string, { isCompleted: boolean; isBlocked: boolean; hoursSpent?: number }>
  >(
    update?.tasks.reduce(
      (acc, t) => ({
        ...acc,
        [t.taskId]: {
          isCompleted: t.isCompleted,
          isBlocked: t.isBlocked,
          hoursSpent: t.hoursSpent,
        },
      }),
      {}
    ) ?? {}
  );
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>(
    update?.tasks.map((t) => t.taskId) ?? []
  );

  const form = useForm<UpdateFormValues>({
    resolver: zodResolver(updateFormSchema),
    defaultValues: {
      date: update?.date ?? toISODateString(new Date()),
      summary: update?.summary ?? '',
      hoursWorked: update?.hoursWorked ?? 8,
      tomorrowPlan: update?.tomorrowPlan ?? '',
      blockers: update?.blockers ?? '',
      mood: update?.mood,
    },
  });

  const watchedHours = form.watch('hoursWorked');

  const toggleTask = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
    if (!taskEntries[taskId]) {
      setTaskEntries((prev) => ({
        ...prev,
        [taskId]: { isCompleted: false, isBlocked: false },
      }));
    }
  };

  const updateTaskEntry = (
    taskId: string,
    field: 'isCompleted' | 'isBlocked' | 'hoursSpent',
    value: boolean | number
  ) => {
    setTaskEntries((prev) => ({
      ...prev,
      [taskId]: { ...(prev[taskId] ?? {}), [field]: value },
    }));
  };

  const toggleProject = (projectId: string) => {
    setSelectedProjectIds((prev) =>
      prev.includes(projectId)
        ? prev.filter((id) => id !== projectId)
        : [...prev, projectId]
    );
  };

  const onSubmit = (values: UpdateFormValues) => {
    const payload = {
      userId: currentUserId,
      date: values.date,
      summary: values.summary,
      hoursWorked: values.hoursWorked,
      tomorrowPlan: values.tomorrowPlan || undefined,
      blockers: values.blockers || undefined,
      mood: selectedMood,
      projectIds: selectedProjectIds,
      tasks: selectedTaskIds.map((taskId) => ({
        taskId,
        isCompleted: taskEntries[taskId]?.isCompleted ?? false,
        isBlocked: taskEntries[taskId]?.isBlocked ?? false,
        hoursSpent: taskEntries[taskId]?.hoursSpent,
      })),
    };

    if (isEdit && update) {
      editUpdate(payload, {
        onSuccess: () => {
          toast({ title: 'Update saved' });
          onSuccess?.();
        },
        onError: () =>
          toast({ title: 'Failed to save update', variant: 'destructive' }),
      });
    } else {
      createUpdate(payload, {
        onSuccess: () => {
          toast({ title: 'Daily update submitted' });
          router.push(ROUTES.UPDATES);
          onSuccess?.();
        },
        onError: () =>
          toast({ title: 'Failed to submit update', variant: 'destructive' }),
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Date */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date *</FormLabel>
              <FormControl>
                <DatePicker
                  value={field.value || null}
                  onChange={(date) =>
                    field.onChange(date ? toISODateString(date) : '')
                  }
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Summary */}
        <FormField
          control={form.control}
          name="summary"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Summary *</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What did you accomplish today?"
                  rows={4}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Hours worked slider */}
        <FormField
          control={form.control}
          name="hoursWorked"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>Hours Worked</FormLabel>
                <span className="text-sm font-semibold tabular-nums">
                  {watchedHours}h
                </span>
              </div>
              <FormControl>
                <input
                  type="range"
                  min={0}
                  max={16}
                  step={0.5}
                  className="w-full accent-primary"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  value={field.value}
                />
              </FormControl>
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>0h</span>
                <span>8h</span>
                <span>16h</span>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Mood */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Mood</label>
          <div className="flex gap-2">
            {MOOD_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() =>
                  setSelectedMood(
                    selectedMood === opt.value ? undefined : opt.value
                  )
                }
                className={cn(
                  'flex flex-col items-center gap-0.5 p-2 rounded-lg border-2 transition-all text-xl',
                  selectedMood === opt.value
                    ? 'border-primary bg-primary/10 scale-110'
                    : 'border-transparent hover:border-muted-foreground/20 hover:bg-muted'
                )}
                title={opt.label}
              >
                <span>{opt.emoji}</span>
                <span className="text-[10px] text-muted-foreground">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        <Separator />

        {/* Tomorrow Plan */}
        <FormField
          control={form.control}
          name="tomorrowPlan"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Plan for Tomorrow</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="What will you work on tomorrow?"
                  rows={3}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Blockers */}
        <FormField
          control={form.control}
          name="blockers"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Blockers / Impediments</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Any blockers or impediments?"
                  rows={2}
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Separator />

        {/* Tasks section */}
        {tasks.length > 0 && (
          <div className="space-y-3">
            <label className="text-sm font-medium">Tasks Worked On</label>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {tasks.map((task) => {
                const isSelected = selectedTaskIds.includes(task.id);
                const entry = taskEntries[task.id];
                return (
                  <Card
                    key={task.id}
                    className={cn(
                      'border transition-colors',
                      isSelected ? 'border-primary/40 bg-primary/5' : 'border-border'
                    )}
                  >
                    <CardContent className="p-3 space-y-2">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id={`task-${task.id}`}
                          checked={isSelected}
                          onCheckedChange={() => toggleTask(task.id)}
                        />
                        <label
                          htmlFor={`task-${task.id}`}
                          className="flex-1 cursor-pointer text-sm font-medium line-clamp-1"
                        >
                          {task.title}
                        </label>
                        <TaskStatusBadge status={task.status} showIcon={false} />
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-4 pl-6 flex-wrap">
                          <label className="flex items-center gap-1.5 text-xs cursor-pointer">
                            <Checkbox
                              checked={entry?.isCompleted ?? false}
                              onCheckedChange={(v) =>
                                updateTaskEntry(task.id, 'isCompleted', !!v)
                              }
                            />
                            Completed
                          </label>
                          <label className="flex items-center gap-1.5 text-xs cursor-pointer text-red-600">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <Checkbox
                              checked={entry?.isBlocked ?? false}
                              onCheckedChange={(v) =>
                                updateTaskEntry(task.id, 'isBlocked', !!v)
                              }
                            />
                            Blocked
                          </label>
                          <div className="flex items-center gap-1.5 text-xs">
                            <label className="text-muted-foreground">Hours:</label>
                            <Input
                              type="number"
                              min="0"
                              max="16"
                              step="0.5"
                              className="h-6 w-16 text-xs"
                              value={entry?.hoursSpent ?? ''}
                              onChange={(e) =>
                                updateTaskEntry(
                                  task.id,
                                  'hoursSpent',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                            />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Projects section */}
        {projects.length > 0 && (
          <div className="space-y-3">
            <label className="text-sm font-medium">Projects Worked On</label>
            <div className="flex flex-wrap gap-2">
              {projects.map((project) => {
                const isSelected = selectedProjectIds.includes(project.id);
                return (
                  <button
                    key={project.id}
                    type="button"
                    onClick={() => toggleProject(project.id)}
                    className={cn(
                      'flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border-2 transition-all',
                      isSelected
                        ? 'border-primary bg-primary/10 font-medium'
                        : 'border-border hover:border-muted-foreground/30'
                    )}
                  >
                    <span
                      className="h-2 w-2 rounded-full"
                      style={{ backgroundColor: project.color }}
                    />
                    {project.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Submit */}
        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button type="submit" loading={isCreating || isEditing}>
            {isEdit ? 'Update Report' : 'Submit Report'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
