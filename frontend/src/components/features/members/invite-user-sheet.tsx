'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter,
} from '@/components/ui/sheet';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useCreateMember } from '@/hooks/use-members';
import { toast } from '@/components/ui/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';

const ROLES = [
  { value: 'ADMIN',           label: 'Admin',           description: 'Full access — manage users, teams, all projects' },
  { value: 'MANAGER',         label: 'Manager',         description: 'Manage projects and tasks, add members' },
  { value: 'PROJECT_MANAGER', label: 'Project Manager', description: 'Oversee specific projects, manage team and bugs' },
  { value: 'DEVELOPER',       label: 'Developer',       description: 'Create and update tasks in assigned projects' },
  { value: 'VIEWER',          label: 'Viewer',          description: 'Read-only access to projects and tasks' },
];

const schema = z.object({
  name:       z.string().min(2, 'Name must be at least 2 characters'),
  email:      z.string().email('Invalid email address'),
  password:   z.string().min(6, 'Password must be at least 6 characters'),
  role:       z.enum(['ADMIN', 'MANAGER', 'PROJECT_MANAGER', 'DEVELOPER', 'VIEWER']).default('DEVELOPER'),
  jobTitle:   z.string().optional(),
  department: z.string().optional(),
  phone:      z.string().optional(),
  bio:        z.string().optional(),
});

type FormValues = z.infer<typeof schema>;

interface InviteUserSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function InviteUserSheet({ open, onOpenChange }: InviteUserSheetProps) {
  const { mutate: createMember, isPending } = useCreateMember();
  const [showPw, setShowPw] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '', email: '', password: '', role: 'DEVELOPER',
      jobTitle: '', department: '', phone: '', bio: '',
    },
  });

  const onSubmit = (values: FormValues) => {
    createMember(values, {
      onSuccess: (user) => {
        toast({ title: 'User created', description: `${user.name} has been added to the organisation.` });
        form.reset();
        onOpenChange(false);
      },
      onError: (err: any) => {
        const msg = err?.response?.data?.message ?? err?.message ?? 'Failed to create user';
        toast({ title: 'Error', description: msg, variant: 'destructive' });
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Add New Member</SheetTitle>
          <SheetDescription>
            Create a user account. They will be visible across all projects and can be assigned tasks immediately.
          </SheetDescription>
        </SheetHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-6">

            {/* Name */}
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input placeholder="Jane Smith" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Email */}
            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address <span className="text-destructive">*</span></FormLabel>
                <FormControl><Input type="email" placeholder="jane@company.com" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Password */}
            <FormField control={form.control} name="password" render={({ field }) => (
              <FormItem>
                <FormLabel>Password <span className="text-destructive">*</span></FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={showPw ? 'text' : 'password'}
                      placeholder="Min 6 characters"
                      className="pr-10"
                      {...field}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Role */}
            <FormField control={form.control} name="role" render={({ field }) => (
              <FormItem>
                <FormLabel>Role <span className="text-destructive">*</span></FormLabel>
                <Select value={field.value} onValueChange={field.onChange}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        <div>
                          <p className="font-medium">{r.label}</p>
                          <p className="text-xs text-muted-foreground">{r.description}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-4">
              {/* Job Title */}
              <FormField control={form.control} name="jobTitle" render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title</FormLabel>
                  <FormControl><Input placeholder="Frontend Developer" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              {/* Department */}
              <FormField control={form.control} name="department" render={({ field }) => (
                <FormItem>
                  <FormLabel>Department</FormLabel>
                  <FormControl><Input placeholder="Engineering" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Phone */}
            <FormField control={form.control} name="phone" render={({ field }) => (
              <FormItem>
                <FormLabel>Phone</FormLabel>
                <FormControl><Input placeholder="+1 234 567 8900" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Bio */}
            <FormField control={form.control} name="bio" render={({ field }) => (
              <FormItem>
                <FormLabel>Bio</FormLabel>
                <FormControl>
                  <Textarea placeholder="Short description about this person…" rows={3} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <SheetFooter className="pt-2 gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending}>
                {isPending ? 'Creating…' : 'Create Member'}
              </Button>
            </SheetFooter>
          </form>
        </Form>
      </SheetContent>
    </Sheet>
  );
}
