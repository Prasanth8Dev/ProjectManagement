'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Users, CheckSquare, CalendarDays, MoreHorizontal, Pencil, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import { ProjectStatusBadge } from '@/components/shared/status-badge';
import { ProjectPriorityBadge } from '@/components/shared/priority-badge';
import { ProgressBar } from '@/components/shared/progress-bar';
import { useDeleteProject } from '@/hooks/use-projects';
import { useAuthStore } from '@/stores/auth.store';
import { useToast } from '@/hooks/use-toast';
import type { Project, ProjectWithStats } from '@/types/project.types';
import { ROUTES } from '@/constants/routes';
import { formatDate } from '@/lib/utils/date';
import { cn } from '@/lib/utils/cn';
import { useState } from 'react';

const CAN_MANAGE = ['ADMIN', 'MANAGER', 'PROJECT_MANAGER'];

interface ProjectCardProps {
  project: Project | ProjectWithStats;
  className?: string;
}

export function ProjectCard({ project, className }: ProjectCardProps) {
  const router  = useRouter();
  const { toast } = useToast();
  const [confirmOpen, setConfirmOpen] = useState(false);

  const currentUser  = useAuthStore((s) => s.currentUser);
  const canManage    = CAN_MANAGE.includes(currentUser?.role ?? '');

  const { mutate: deleteProject, isPending: isDeleting } = useDeleteProject(project.id);

  const stats          = project as ProjectWithStats;
  const completedTasks = stats.completedTasks ?? 0;
  const totalTasks     = project._count?.tasks ?? 0;
  const progressPct    =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  function handleDelete() {
    deleteProject(undefined, {
      onSuccess: () => toast({ title: 'Project deleted', description: `"${project.name}" has been deleted.` }),
      onError:   () => toast({ title: 'Delete failed', description: 'Could not delete the project.', variant: 'destructive' }),
    });
  }

  return (
    <>
      <motion.div whileHover={{ scale: 1.01, y: -2 }} transition={{ duration: 0.15 }} className="relative group">
        <Link href={ROUTES.PROJECT(project.id)}>
          <Card
            className={cn(
              'cursor-pointer hover:shadow-md transition-shadow h-full border-t-4',
              className
            )}
            style={{ borderTopColor: project.color }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span
                    className="h-3 w-3 rounded-full shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <h3 className="font-semibold text-base line-clamp-1 flex-1">
                    {project.name}
                  </h3>
                </div>
                <ProjectPriorityBadge priority={project.priority} className="shrink-0" />
              </div>
              {project.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1 pl-5">
                  {project.description}
                </p>
              )}
            </CardHeader>

            <CardContent className="space-y-3">
              {totalTasks > 0 && (
                <ProgressBar
                  value={progressPct}
                  label={`${completedTasks}/${totalTasks} tasks`}
                  showPercentage
                  size="sm"
                />
              )}

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <CheckSquare className="h-3.5 w-3.5" />
                  {project._count?.tasks ?? 0} tasks
                </span>
                <span className="flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" />
                  {project._count?.members ?? 0} members
                </span>
              </div>

              {project.endDate && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <CalendarDays className="h-3.5 w-3.5" />
                  <span>Due {formatDate(project.endDate)}</span>
                </div>
              )}

              <div className="pt-1">
                <ProjectStatusBadge status={project.status} />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* Actions dropdown — only for privileged roles */}
        {canManage && (
          <div
            className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={(e) => e.preventDefault()}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 bg-background/80 backdrop-blur-sm border shadow-sm"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                <DropdownMenuItem onClick={() => router.push(ROUTES.PROJECT_SETTINGS(project.id))}>
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onClick={() => setConfirmOpen(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </motion.div>

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Delete "${project.name}"?`}
        description="This will permanently delete the project, all its tasks, and related data. This action cannot be undone."
        confirmLabel="Delete Project"
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  );
}
