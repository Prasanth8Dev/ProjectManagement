'use client';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Shield, ShieldAlert, ShieldCheck, Eye } from 'lucide-react';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from '@/components/ui/sheet';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useUpdateMember } from '@/hooks/use-members';
import { toast } from '@/components/ui/use-toast';
import { User } from '@/types/user.types';
import { cn } from '@/lib/utils/cn';

const ROLES = [
  {
    value: 'ADMIN',
    label: 'Admin',
    icon: ShieldAlert,
    color: 'text-red-600',
    badge: 'bg-red-100 text-red-700',
    permissions: ['Full system access', 'Manage all users & roles', 'Create/delete teams & projects', 'View all reports & data'],
  },
  {
    value: 'MANAGER',
    label: 'Manager',
    icon: ShieldCheck,
    color: 'text-blue-600',
    badge: 'bg-blue-100 text-blue-700',
    permissions: ['Manage projects & tasks', 'Add/remove project members', 'Create teams', 'View project reports'],
  },
  {
    value: 'PROJECT_MANAGER',
    label: 'Project Manager',
    icon: ShieldCheck,
    color: 'text-indigo-600',
    badge: 'bg-indigo-100 text-indigo-700',
    permissions: ['Oversee specific projects', 'Manage project members', 'Track bugs & tasks', 'Add new members'],
  },
  {
    value: 'DEVELOPER',
    label: 'Developer',
    icon: Shield,
    color: 'text-green-600',
    badge: 'bg-green-100 text-green-700',
    permissions: ['Create & update tasks', 'Submit daily updates', 'Comment on tasks', 'View assigned projects'],
  },
  {
    value: 'VIEWER',
    label: 'Viewer',
    icon: Eye,
    color: 'text-slate-600',
    badge: 'bg-slate-100 text-slate-700',
    permissions: ['Read-only access', 'View projects & tasks', 'Cannot create or edit', 'Cannot submit updates'],
  },
] as const;

const schema = z.object({
  role:   z.enum(['ADMIN', 'MANAGER', 'PROJECT_MANAGER', 'DEVELOPER', 'VIEWER']),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

type FormValues = z.infer<typeof schema>;

interface EditRoleSheetProps {
  user: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditRoleSheet({ user, open, onOpenChange }: EditRoleSheetProps) {
  const { mutate: updateMember, isPending } = useUpdateMember(user.id);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { role: (user.role as any) ?? 'DEVELOPER', status: (user.status as any) ?? 'ACTIVE' },
  });

  useEffect(() => {
    if (open) {
      form.reset({ role: (user.role as any) ?? 'DEVELOPER', status: (user.status as any) ?? 'ACTIVE' });
    }
  }, [open, user]);

  const selectedRole = ROLES.find((r) => r.value === form.watch('role'));

  const onSubmit = (values: FormValues) => {
    updateMember(values, {
      onSuccess: () => {
        toast({ title: 'Role updated', description: `${user.name}'s role has been changed to ${values.role}.` });
        onOpenChange(false);
      },
      onError: (err: any) => {
        toast({ title: 'Error', description: err?.message ?? 'Failed to update role', variant: 'destructive' });
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Edit Role & Status</SheetTitle>
          <SheetDescription>
            Change <span className="font-medium text-foreground">{user.name}</span>'s role and account status.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-6">

            {/* Role selector */}
            <FormField control={form.control} name="role" render={({ field }) => (
              <FormItem>
                <FormLabel>Role</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ROLES.map((r) => {
                      const Icon = r.icon;
                      return (
                        <SelectItem key={r.value} value={r.value}>
                          <div className="flex items-center gap-2">
                            <Icon className={cn('h-4 w-4', r.color)} />
                            <span className="font-medium">{r.label}</span>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>

                {/* Permission preview */}
                {selectedRole && (
                  <div className="mt-3 rounded-lg border bg-muted/40 p-3 space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      {selectedRole.label} Permissions
                    </p>
                    <ul className="space-y-1">
                      {selectedRole.permissions.map((p) => (
                        <li key={p} className="flex items-center gap-2 text-sm">
                          <span className="text-green-500 font-bold">✓</span>
                          {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                <FormMessage />
              </FormItem>
            )} />

            {/* Status selector */}
            <FormField control={form.control} name="status" render={({ field }) => (
              <FormItem>
                <FormLabel>Account Status</FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="ACTIVE">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-green-500 inline-block" />
                        Active
                      </div>
                    </SelectItem>
                    <SelectItem value="INACTIVE">
                      <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-slate-400 inline-block" />
                        Inactive
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Inactive users are hidden from assignee lists but their data is preserved.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )} />

            <SheetFooter className="gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Saving…' : 'Save Changes'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
