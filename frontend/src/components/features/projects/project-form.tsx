'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
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
import { createProjectSchema, CreateProjectFormValues } from '@/lib/validators/project.schema';
import { useCreateProject, useUpdateProject } from '@/hooks/use-projects';
import { Project } from '@/types/project.types';
import { ROUTES } from '@/constants/routes';
import { toast } from '@/components/ui/use-toast';
import { toISODateString } from '@/lib/utils/date';

const PRESET_COLORS = [
  '#3B82F6', '#8B5CF6', '#22C55E', '#F59E0B', '#EF4444',
  '#06B6D4', '#EC4899', '#F97316', '#10B981', '#6366F1',
];

const STATUS_OPTIONS = [
  { value: 'PLANNING', label: 'Planning' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const PRIORITY_OPTIONS = [
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

interface ProjectFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  project?: Project;
}

export function ProjectForm({ open, onOpenChange, project }: ProjectFormProps) {
  const isEdit = !!project;
  const router = useRouter();
  const { mutate: createProject, isPending: isCreating } = useCreateProject();
  const { mutate: updateProject, isPending: isUpdating } = useUpdateProject(project?.id ?? '');

  const form = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      name: project?.name ?? '',
      description: project?.description ?? '',
      status: project?.status ?? 'PLANNING',
      priority: project?.priority ?? 'MEDIUM',
      color: project?.color ?? '#3B82F6',
      startDate: project?.startDate ?? '',
      endDate: project?.endDate ?? '',
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        name: project?.name ?? '',
        description: project?.description ?? '',
        status: project?.status ?? 'PLANNING',
        priority: project?.priority ?? 'MEDIUM',
        color: project?.color ?? '#3B82F6',
        startDate: project?.startDate ?? '',
        endDate: project?.endDate ?? '',
      });
    }
  }, [open, project, form]);

  const onSubmit = (values: CreateProjectFormValues) => {
    const payload = {
      ...values,
      startDate: values.startDate || undefined,
      endDate: values.endDate || undefined,
    };

    if (isEdit && project) {
      updateProject(payload, {
        onSuccess: () => {
          toast({ title: 'Project updated successfully' });
          onOpenChange(false);
        },
        onError: () =>
          toast({ title: 'Failed to update project', variant: 'destructive' }),
      });
    } else {
      createProject(payload, {
        onSuccess: (data) => {
          toast({ title: 'Project created successfully' });
          onOpenChange(false);
          router.push(ROUTES.PROJECT((data as any)?.data?.id ?? (data as any)?.id ?? ''));
        },
        onError: () =>
          toast({ title: 'Failed to create project', variant: 'destructive' }),
      });
    }
  };

  const watchedColor = form.watch('color');

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto flex flex-col">
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Edit Project' : 'Create Project'}</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col flex-1 overflow-y-auto"
          >
            <div className="flex-1 space-y-4 py-4 pr-1">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="My awesome project" {...field} />
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
                        placeholder="What is this project about?"
                        rows={3}
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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

              {/* Color picker */}
              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Color</FormLabel>
                    <div className="space-y-2">
                      {/* Preset swatches */}
                      <div className="flex flex-wrap gap-2">
                        {PRESET_COLORS.map((color) => (
                          <button
                            key={color}
                            type="button"
                            className="h-7 w-7 rounded-full transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-foreground"
                            style={{
                              backgroundColor: color,
                              transform:
                                field.value === color ? 'scale(1.15)' : undefined,
                              boxShadow:
                                field.value === color
                                  ? `0 0 0 2px white, 0 0 0 4px ${color}`
                                  : undefined,
                            }}
                            onClick={() => field.onChange(color)}
                            aria-label={`Select color ${color}`}
                          />
                        ))}
                      </div>
                      {/* Custom color input */}
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={field.value}
                          onChange={(e) => field.onChange(e.target.value)}
                          className="h-8 w-14 cursor-pointer rounded border border-input bg-transparent p-0.5"
                        />
                        <span className="text-xs text-muted-foreground font-mono">
                          {watchedColor}
                        </span>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Date</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value || null}
                          onChange={(date) =>
                            field.onChange(date ? toISODateString(date) : '')
                          }
                          placeholder="Pick start date"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="endDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Date</FormLabel>
                      <FormControl>
                        <DatePicker
                          value={field.value || null}
                          onChange={(date) =>
                            field.onChange(date ? toISODateString(date) : '')
                          }
                          placeholder="Pick end date"
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
                {isEdit ? 'Update Project' : 'Create Project'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
