import { z } from 'zod';

export const createTeamSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().optional(),
  color: z.string().optional(),
});

export type CreateTeamInput = z.infer<typeof createTeamSchema>;

export const updateTeamSchema = createTeamSchema.partial();
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>;

export const addTeamMemberSchema = z.object({
  userId: z.string().uuid('Select a valid user'),
  role: z.enum(['LEAD', 'MEMBER']),
});

export type AddTeamMemberInput = z.infer<typeof addTeamMemberSchema>;
