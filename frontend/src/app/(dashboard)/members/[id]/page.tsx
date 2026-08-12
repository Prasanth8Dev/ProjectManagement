'use client';
import { useState } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Mail, Briefcase, Building2, CheckCircle2, ListTodo, FileText, Settings } from 'lucide-react';
import Link from 'next/link';
import { useMember } from '@/hooks/use-members';
import { useTasks } from '@/hooks/use-tasks';
import { useDailyUpdates } from '@/hooks/use-updates';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ErrorState } from '@/components/ui/error-state';
import { TaskCard } from '@/components/features/tasks/task-card';
import { UpdateCard } from '@/components/features/updates/update-card';
import { ActivityFeed } from '@/components/features/activity/activity-feed';
import { EditRoleSheet } from '@/components/features/members/edit-role-sheet';
import { ROUTES } from '@/constants/routes';

const ROLE_COLORS: Record<string, string> = {
  ADMIN:     'bg-red-100 text-red-700',
  MANAGER:   'bg-blue-100 text-blue-700',
  DEVELOPER: 'bg-green-100 text-green-700',
  VIEWER:    'bg-slate-100 text-slate-700',
};

const STATUS_COLORS: Record<string, string> = {
  ACTIVE:   'bg-green-100 text-green-700',
  INACTIVE: 'bg-slate-100 text-slate-500',
  INVITED:  'bg-yellow-100 text-yellow-700',
};

function StatBadge({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50">
      <span className="text-muted-foreground">{icon}</span>
      <div>
        <p className="font-bold text-lg leading-none">{value}</p>
        <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );
}

export default function MemberProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [editRoleOpen, setEditRoleOpen] = useState(false);

  const { data: memberResp, isLoading, isError } = useMember(id);
  const { data: tasksResp,   isLoading: tasksLoading }   = useTasks({ assigneeId: id, limit: 5 });
  const { data: updatesResp, isLoading: updatesLoading } = useDailyUpdates({ userId: id, limit: 3 });

  const member  = memberResp?.data ?? (memberResp as any);   // handle both wrapped & unwrapped
  const tasks   = tasksResp?.data ?? [];
  const updates = updatesResp?.data ?? [];

  if (isError) {
    return <ErrorState title="Failed to load member" description="Please try again." />;
  }

  return (
    <div className="space-y-6">
      {/* Profile card */}
      <Card>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="flex items-center gap-6">
              <Skeleton className="w-20 h-20 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-52" />
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Avatar className="w-20 h-20">
                <AvatarImage src={member?.avatar} alt={member?.name} />
                <AvatarFallback className="text-3xl font-semibold">
                  {(member?.name ?? 'U').split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-2">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold">{member?.name}</h1>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[member?.role ?? ''] ?? 'bg-gray-100 text-gray-700'}`}>
                    {member?.role}
                  </span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[member?.status ?? ''] ?? ''}`}>
                    {member?.status}
                  </span>
                </div>

                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  {member?.email && (
                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{member.email}</span>
                  )}
                  {member?.jobTitle && (
                    <span className="flex items-center gap-1.5"><Briefcase className="w-3.5 h-3.5" />{member.jobTitle}</span>
                  )}
                  {member?.department && (
                    <span className="flex items-center gap-1.5"><Building2 className="w-3.5 h-3.5" />{member.department}</span>
                  )}
                </div>

                {member?.bio && (
                  <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">{member.bio}</p>
                )}
              </div>

              <div className="flex gap-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => setEditRoleOpen(true)}>
                  <Settings className="mr-2 h-4 w-4" />
                  Edit Role
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link href={ROUTES.REPORT_EMPLOYEE(id)}>View Report</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats */}
      {!isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <StatBadge icon={<ListTodo className="w-5 h-5" />}    label="Tasks Assigned"     value={member?._count?.assignedTasks ?? 0} />
          <StatBadge icon={<CheckCircle2 className="w-5 h-5" />} label="Updates Submitted"  value={member?._count?.dailyUpdates ?? 0} />
          <StatBadge icon={<FileText className="w-5 h-5" />}    label="Projects"           value={member?._count?.projectMemberships ?? 0} />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: tasks + updates */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Assigned Tasks</CardTitle></CardHeader>
            <CardContent>
              {tasksLoading ? (
                <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
              ) : tasks.length === 0 ? (
                <p className="text-sm text-muted-foreground">No tasks assigned.</p>
              ) : (
                <div className="space-y-3">{tasks.map((task) => <TaskCard key={task.id} task={task} />)}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Recent Updates</CardTitle></CardHeader>
            <CardContent>
              {updatesLoading ? (
                <div className="space-y-3">{Array.from({ length: 2 }).map((_, i) => <Skeleton key={i} className="h-24 w-full" />)}</div>
              ) : updates.length === 0 ? (
                <p className="text-sm text-muted-foreground">No updates submitted yet.</p>
              ) : (
                <div className="space-y-3">{updates.map((update: any) => <UpdateCard key={update.id} update={update} />)}</div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: activity */}
        <Card>
          <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
          <CardContent><ActivityFeed userId={id} limit={8} /></CardContent>
        </Card>
      </div>

      {member && (
        <EditRoleSheet user={member} open={editRoleOpen} onOpenChange={setEditRoleOpen} />
      )}
    </div>
  );
}
