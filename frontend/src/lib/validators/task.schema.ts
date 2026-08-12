import { z } from 'zod';

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  description: z.string().optional(),
  projectId: z.string().uuid('Select a valid project'),
  status: z
    .enum(['BACKLOG', 'TODO', 'IN_PROGRESS', 'IN_REVIEW', 'TESTING', 'DONE', 'CANCELLED'])
    .optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  // Empty string means "none selected" — backend treats undefined/null as no value
  assigneeId:   z.preprocess((v) => v === '' ? null : v, z.string().uuid().nullable().optional()),
  milestoneId:  z.preprocess((v) => v === '' ? null : v, z.string().uuid().nullable().optional()),
  dueDate:      z.string().optional().nullable(),
  startDate:    z.string().optional().nullable(),
  estimatedHours: z.number().min(0).max(1000).optional().nullable(),
  parentTaskId: z.preprocess((v) => v === '' ? null : v, z.string().uuid().nullable().optional()),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type CreateTaskFormValues = CreateTaskInput;

export const updateTaskSchema = createTaskSchema.partial().omit({ projectId: true });
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
