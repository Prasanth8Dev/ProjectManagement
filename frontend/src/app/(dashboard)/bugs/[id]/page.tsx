'use client';
import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Bug,
  Calendar,
  Edit2,
  Trash2,
  User,
  FolderKanban,
  Monitor,
  ChevronRight,
  ListTodo,
  ArrowRightLeft,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { UserAvatar } from '@/components/shared/user-avatar';
import { BugStatusBadge } from '@/components/features/bugs/bug-status-badge';
import { BugSeverityBadge } from '@/components/features/bugs/bug-severity-badge';
import { BugPlatformBadge } from '@/components/features/bugs/bug-platform-badge';
import { BugComments } from '@/components/features/bugs/bug-comments';
import { BugFormSheet } from '@/components/features/bugs/bug-form-sheet';
import { useBug, useDeleteBug, useChangeBugStatus, useAssignBug, useConvertBugToTask } from '@/hooks/use-bugs';
import { UserSelect } from '@/components/shared/user-select';
import { toast } from '@/components/ui/use-toast';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/lib/utils/date';
import type { BugStatus } from '@/types/bug.types';

const STATUS_OPTIONS: { value: BugStatus; label: string }[] = [
  { value: 'OPEN', label: 'Open' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'PENDING', label: 'Pending' },
  { value: 'IN_REVIEW', label: 'In Review' },
  { value: 'TESTING', label: 'Testing / QA' },
  { value: 'RESOLVED', label: 'Resolved' },
  { value: 'REOPENED', label: 'Re-opened' },
  { value: 'CLOSED', label: 'Closed' },
  { value: 'WONT_FIX', label: "Won't Fix" },
];

const PRIORITY_COLORS: Record<string, string> = {
  LOW: 'text-blue-600',
  MEDIUM: 'text-yellow-600',
  HIGH: 'text-orange-600',
  URGENT: 'text-red-600',
};

export default function BugDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [isEditOpen, setIsEditOpen] = useState(false);

  const { data, isLoading } = useBug(params.id);
  const { mutate: deleteBug, isPending: isDeleting } = useDeleteBug();
  const { mutate: changeStatus } = useChangeBugStatus(params.id);
  const { mutate: assignBug } = useAssignBug(params.id);
  const { mutate: convertToTask, isPending: isConverting } = useConvertBugToTask(params.id);

  const bug = (data as any)?.data ?? data;

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-4xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-40 w-full" />
      </div>
    );
  }

  if (!bug) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Bug className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Bug not found.</p>
        <Button variant="outline" onClick={() => router.push(ROUTES.BUGS)}>
          Back to Bugs
        </Button>
      </div>
    );
  }

  const handleDelete = () => {
    if (!confirm('Delete this bug? This cannot be undone.')) return;
    deleteBug(bug.id, {
      onSuccess: () => {
        toast({ title: 'Bug deleted' });
        router.push(ROUTES.BUGS);
      },
      onError: () => toast({ title: 'Failed to delete bug', variant: 'destructive' }),
    });
  };

  const handleConvertToTask = () => {
    convertToTask(undefined, {
      onSuccess: (updated: any) => {
        toast({ title: 'Task created and linked' });
        const linked = updated?.data ?? updated;
        if (linked?.linkedTask?.id) router.push(ROUTES.TASK(linked.linkedTask.id));
      },
      onError: (err: any) =>
        toast({
          title: 'Failed to convert to task',
          description: err?.response?.data?.message?.toString?.() ?? undefined,
          variant: 'destructive',
        }),
    });
  };

  return (
    <div
      className="space-y-6 max-w-4xl"
    >
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button
          onClick={() => router.push(ROUTES.BUGS)}
          className="hover:text-foreground transition-colors flex items-center gap-1"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Bug Tracker
        </button>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground font-medium truncate">{bug.title}</span>
      </div>

      {/* Header card */}
      <Card>
        <CardHeader className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3 flex-1 min-w-0">
              <Bug className="h-5 w-5 text-muted-foreground mt-0.5 flex-shrink-0" />
              <h1 className="text-xl font-semibold leading-tight">{bug.title}</h1>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              {bug.linkedTask ? (
                <Button size="sm" variant="outline" asChild>
                  <Link href={ROUTES.TASK(bug.linkedTask.id)}>
                    <ListTodo className="h-3.5 w-3.5 mr-1" />
                    View Task
                  </Link>
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleConvertToTask}
                  disabled={isConverting}
                >
                  <ArrowRightLeft className="h-3.5 w-3.5 mr-1" />
                  {isConverting ? 'Converting…' : 'Convert to Task'}
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => setIsEditOpen(true)}>
                <Edit2 className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {/* Status + Severity badges */}
          <div className="flex flex-wrap items-center gap-2">
            <BugStatusBadge status={bug.status} />
            <BugSeverityBadge severity={bug.severity} />
            {bug.platform && <BugPlatformBadge platform={bug.platform} />}
            <span className={`text-xs font-semibold uppercase tracking-wide ${PRIORITY_COLORS[bug.priority]}`}>
              {bug.priority} Priority
            </span>
          </div>
        </CardHeader>

        <Separator />

        <CardContent className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          {/* Status control */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Status</p>
            <Select
              value={bug.status}
              onValueChange={(v) =>
                changeStatus(v as BugStatus, {
                  onSuccess: () => toast({ title: 'Status updated' }),
                  onError: () => toast({ title: 'Failed to update status', variant: 'destructive' }),
                })
              }
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((o) => (
                  <SelectItem key={o.value} value={o.value} className="text-xs">
                    {o.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Assignee control */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium">Assignee</p>
            <UserSelect
              value={bug.assigneeId ?? undefined}
              onChange={(v) =>
                assignBug(v ?? null, {
                  onSuccess: () => toast({ title: 'Assignee updated' }),
                  onError: () => toast({ title: 'Failed to update assignee', variant: 'destructive' }),
                })
              }
              placeholder="Unassigned"
            />
          </div>

          {/* Reporter */}
          {bug.reporter && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-1">
                <User className="h-3 w-3" /> Reporter
              </p>
              <div className="flex items-center gap-2">
                <UserAvatar user={bug.reporter} size="xs" />
                <span>{bug.reporter.name}</span>
              </div>
            </div>
          )}

          {/* Project */}
          {bug.project && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-1">
                <FolderKanban className="h-3 w-3" /> Project
              </p>
              <div className="flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: bug.project.color ?? '#6366f1' }}
                />
                <span>{bug.project.name}</span>
              </div>
            </div>
          )}

          {/* Linked Task */}
          {bug.linkedTask && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-1">
                <ListTodo className="h-3 w-3" /> Linked Task
              </p>
              <Link
                href={ROUTES.TASK(bug.linkedTask.id)}
                className="text-primary hover:underline truncate block"
              >
                {bug.linkedTask.title}
              </Link>
            </div>
          )}

          {/* Dates */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-1">
              <Calendar className="h-3 w-3" /> Reported
            </p>
            <span>{formatDate(bug.createdAt, 'MMM d, yyyy · h:mm a')}</span>
          </div>

          {bug.resolvedAt && (
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-1">
                <Calendar className="h-3 w-3" /> Resolved
              </p>
              <span>{formatDate(bug.resolvedAt, 'MMM d, yyyy · h:mm a')}</span>
            </div>
          )}

          {/* Environment */}
          {bug.environment && (
            <div className="space-y-1 col-span-full">
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-medium flex items-center gap-1">
                <Monitor className="h-3 w-3" /> Environment
              </p>
              <span className="text-sm font-mono bg-muted px-2 py-0.5 rounded">
                {bug.environment}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Description */}
      {bug.description && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap text-muted-foreground leading-relaxed">
              {bug.description}
            </p>
          </CardContent>
        </Card>
      )}

      {/* Steps / Expected / Actual grid */}
      {(bug.stepsToReproduce || bug.expectedBehavior || bug.actualBehavior) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {bug.stepsToReproduce && (
            <Card className="md:col-span-1">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Steps to Reproduce</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="text-xs whitespace-pre-wrap font-mono text-muted-foreground leading-relaxed">
                  {bug.stepsToReproduce}
                </pre>
              </CardContent>
            </Card>
          )}
          {bug.expectedBehavior && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Expected Behavior</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {bug.expectedBehavior}
                </p>
              </CardContent>
            </Card>
          )}
          {bug.actualBehavior && (
            <Card className="border-destructive/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm text-destructive">Actual Behavior</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {bug.actualBehavior}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Comments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comments</CardTitle>
        </CardHeader>
        <CardContent>
          <BugComments bugId={bug.id} />
        </CardContent>
      </Card>

      {/* Edit sheet */}
      <BugFormSheet open={isEditOpen} onOpenChange={setIsEditOpen} bug={bug} />
    </div>
  );
}
