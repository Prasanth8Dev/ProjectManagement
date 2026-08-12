'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FolderKanban, Plus } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { ProjectCard } from '@/components/features/projects/project-card';
import { SkeletonCard } from '@/components/ui/skeleton-card';
import { EmptyState } from '@/components/ui/empty-state';
import { ErrorState } from '@/components/ui/error-state';
import { useProjects } from '@/hooks/use-projects';
import { ROUTES } from '@/constants/routes';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'PLANNING', label: 'Planning' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

const PRIORITY_OPTIONS = [
  { value: 'all', label: 'All Priorities' },
  { value: 'LOW', label: 'Low' },
  { value: 'MEDIUM', label: 'Medium' },
  { value: 'HIGH', label: 'High' },
  { value: 'CRITICAL', label: 'Critical' },
];

export default function ProjectsPage() {
  const router = useRouter();
  const [search, setSearch]     = useState('');
  const [status, setStatus]     = useState('all');
  const [priority, setPriority] = useState('all');

  const { data, isLoading, isError, error } = useProjects({
    search:   search || undefined,
    status:   status !== 'all' ? status : undefined,
    priority: priority !== 'all' ? priority : undefined,
  });

  const projects = data?.data ?? [];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Projects"
        description="Manage and track all your projects in one place."
        actions={
          <Button asChild>
            <Link href={ROUTES.PROJECT_NEW}>
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Link>
          </Button>
        }
      />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="sm:max-w-xs"
        />
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="sm:w-44"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={priority} onValueChange={setPriority}>
          <SelectTrigger className="sm:w-44"><SelectValue placeholder="Priority" /></SelectTrigger>
          <SelectContent>
            {PRIORITY_OPTIONS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      {isError && (
        <ErrorState title="Failed to load projects" description={(error as Error)?.message ?? 'Something went wrong'} />
      )}

      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      )}

      {!isLoading && !isError && projects.length === 0 && (
        <EmptyState
          icon={FolderKanban}
          title="No projects yet"
          description="Get started by creating your first project."
          action={{ label: 'New Project', onClick: () => router.push(ROUTES.PROJECT_NEW) }}
        />
      )}

      {!isLoading && !isError && projects.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project) => <ProjectCard key={project.id} project={project} />)}
        </div>
      )}
    </div>
  );
}
