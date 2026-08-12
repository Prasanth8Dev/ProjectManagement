'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
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
import { UserSelect } from '@/components/shared/user-select';
import { toast } from '@/components/ui/use-toast';
import { useCreateBug, useUpdateBug } from '@/hooks/use-bugs';
import { useProjects } from '@/hooks/use-projects';
import { useAuthStore } from '@/stores/auth.store';
import type { Bug } from '@/types/bug.types';

const bugSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  stepsToReproduce: z.string().optional(),
  expectedBehavior: z.string().optional(),
  actualBehavior: z.string().optional(),
  environment: z.string().optional(),
  status: z.enum(['OPEN', 'IN_PROGRESS', 'IN_REVIEW', 'RESOLVED', 'CLOSED', 'WONT_FIX']).default('OPEN'),
  severity: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).default('MEDIUM'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
  projectId: z.string().optional(),
  assigneeId: z.string().optional(),
});

type BugFormValues = z.infer<typeof bugSchema>;

const STATUS_OPTIONS = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'WONT_FIX', label: "Won't Fix" },
];

const SEVERITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'URGENT', label: 'Urgent' },
];

interface BugFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bug?: Bug;
  defaultProjectId?: string;
}

export function BugFormSheet({ open, onOpenChange, bug, defaultProjectId }: BugFormSheetProps) {
  const isEdit = !!bug;
  const currentUser = useAuthStore((s) => s.currentUser);
  const { mutate: createBug, isPending: isCreating } = useCreateBug();
  const { mutate: updateBug, isPending: isUpdating } = useUpdateBug(bug?.id ?? '');
  const { data: projectsData } = useProjects({ limit: 100 });
  const projects = projectsData?.data ?? [];

  const form = useForm<BugFormValues>({
    resolver: zodResolver(bugSchema),
    defaultValues: {
      title: bug?.title ?? '',
      description: bug?.description ?? '',
      stepsToReproduce: bug?.stepsToReproduce ?? '',
      expectedBehavior: bug?.expectedBehavior ?? '',
      actualBehavior: bug?.actualBehavior ?? '',
      environment: bug?.environment ?? '',
      status: bug?.status ?? 'OPEN',
      severity: bug?.severity ?? 'MEDIUM',
      priority: bug?.priority ?? 'MEDIUM',
      projectId: bug?.projectId ?? defaultProjectId ?? '',
      assigneeId: bug?.assigneeId ?? '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        title: bug?.title ?? '',
        description: bug?.description ?? '',
        stepsToReproduce: bug?.stepsToReproduce ?? '',
        expectedBehavior: bug?.expectedBehavior ?? '',
        actualBehavior: bug?.actualBehavior ?? '',
        environment: bug?.environment ?? '',
        status: bug?.status ?? 'OPEN',
        severity: bug?.severity ?? 'MEDIUM',
        priority: bug?.priority ?? 'MEDIUM',
        projectId: bug?.projectId ?? defaultProjectId ?? '',
        assigneeId: bug?.assigneeId ?? '',
      });
    }
  }, [open, bug, defaultProjectId, form]);

  const onSubmit = (values: BugFormValues) => {
    const payload = {
      ...values,
      projectId: values.projectId || undefined,
      assigneeId: values.assigneeId || undefined,
    };

    if (isEdit && bug) {
      updateBug(payload, {
        onSuccess: () => {
          toast({ title: 'Bug updated successfully' });
          onOpenChange(false);
        },
        onError: () => toast({ title: 'Failed to update bug', variant: 'destructive' }),
      });
    } else {
      createBug(
        { ...payload, reporterId: currentUser?.id ?? '' },
        {
          onSuccess: () => {
            toast({ title: 'Bug reported successfully' });
            onOpenChange(false);
            form.reset();
          },
          onError: () => toast({ title: 'Failed to report bug', variant: 'destructive' }),
        }
      );
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto flex flex-col">
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Edit Bug' : 'Report a Bug'}</SheetTitle>
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
                      <Input placeholder="Brief description of the bug..." {...field} />
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
                        placeholder="Detailed description..."
                        rows={3}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Steps to Reproduce */}
              <FormField
                control={form.control}
                name="stepsToReproduce"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Steps to Reproduce</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="1. Go to...\n2. Click on...\n3. Observe..."
                        rows={3}
                        className="resize-none font-mono text-xs"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Expected / Actual Behavior */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="expectedBehavior"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expected Behavior</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What should happen..."
                          rows={2}
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="actualBehavior"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Actual Behavior</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="What actually happens..."
                          rows={2}
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Environment */}
              <FormField
                control={form.control}
                name="environment"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Environment</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Chrome 120, macOS 14, iOS 17..."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Severity + Priority */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="severity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Severity</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SEVERITY_OPTIONS.map((o) => (
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
                          {PRIORITY_OPTIONS.map((o) => (
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

              {/* Status (shown only in edit mode) */}
              {isEdit && (
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
                          {STATUS_OPTIONS.map((o) => (
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

              {/* Project */}
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ''}
                      disabled={!!defaultProjectId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="No project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No project</SelectItem>
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
            </div>

            <SheetFooter className="pt-4 border-t mt-auto">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isCreating || isUpdating}>
                {isCreating || isUpdating
                  ? isEdit ? 'Saving…' : 'Reporting…'
                  : isEdit ? 'Update Bug' : 'Report Bug'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
