import { z } from 'zod';

export const createDailyUpdateSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  summary: z.string().min(1, 'Summary is required'),
  hoursWorked: z.number().min(0).max(24),
  tomorrowPlan: z.string().optional(),
  blockers: z.string().optional(),
  mood: z.number().min(1).max(5).optional(),
  tasks: z
    .array(
      z.object({
        taskId: z.string().uuid(),
        isCompleted: z.boolean().optional(),
        isBlocked: z.boolean().optional(),
        hoursSpent: z.number().optional(),
        notes: z.string().optional(),
      })
    )
    .optional(),
  projectIds: z.array(z.string().uuid()).optional(),
});

export type CreateDailyUpdateInput = z.infer<typeof createDailyUpdateSchema>;

export const updateDailyUpdateSchema = createDailyUpdateSchema.partial();
export type UpdateDailyUpdateInput = z.infer<typeof updateDailyUpdateSchema>;
