'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useCreateTeam, useUpdateTeam } from '@/hooks/use-teams';
import { useToast } from '@/hooks/use-toast';
import { extractApiError } from '@/lib/utils/error';
import type { Team } from '@/types/team.types';

const teamSchema = z.object({
  name: z.string().min(1, 'Team name is required').max(100),
  description: z.string().optional(),
  color: z.string().optional(),
});

type TeamFormValues = z.infer<typeof teamSchema>;

interface TeamFormProps {
  team?: Team;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function TeamForm({ team, open, onOpenChange }: TeamFormProps) {
  const { toast } = useToast();
  const createTeam = useCreateTeam();
  const updateTeam = useUpdateTeam(team?.id ?? '');

  const form = useForm<TeamFormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: {
      name: team?.name ?? '',
      description: team?.description ?? '',
      color: team?.color ?? '#6366f1',
    },
  });

  const isEdit = !!team;
  const isPending = createTeam.isPending || updateTeam.isPending;

  async function onSubmit(values: TeamFormValues) {
    try {
      if (isEdit) {
        await updateTeam.mutateAsync(values);
        toast({ title: 'Team updated successfully' });
      } else {
        await createTeam.mutateAsync(values);
        toast({ title: 'Team created successfully' });
      }
      form.reset();
      onOpenChange(false);
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: extractApiError(err) });
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{isEdit ? 'Edit Team' : 'Create Team'}</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Frontend Team" {...field} />
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
                    <Textarea placeholder="What does this team work on?" rows={3} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Team Color</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-3">
                      <input type="color" {...field} className="h-10 w-14 cursor-pointer rounded-md border border-input p-1" />
                      <span className="text-sm text-muted-foreground">{field.value}</span>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <SheetFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Team'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
