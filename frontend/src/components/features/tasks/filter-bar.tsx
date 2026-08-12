'use client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TASK_STATUS_CONFIG } from '@/constants/task-statuses';
import { TASK_PRIORITY_CONFIG } from '@/constants/priorities';
import { User } from '@/types/user.types';
import { Project } from '@/types/project.types';
import { cn } from '@/lib/utils/cn';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  ...Object.entries(TASK_STATUS_CONFIG).map(([k, v]) => ({ value: k, label: v.label })),
];

const PRIORITY_OPTIONS = [
  { value: '', label: 'All priorities' },
  ...Object.entries(TASK_PRIORITY_CONFIG).map(([k, v]) => ({ value: k, label: v.label })),
];

interface FilterBarProps {
  filters: {
    status?: string | null;
    priority?: string | null;
    assigneeId?: string | null;
    projectId?: string | null;
  };
  onChange: (key: string, value: string) => void;
  members?: User[];
  projects?: Project[];
  showProjectFilter?: boolean;
  className?: string;
}

export function FilterBar({
  filters,
  onChange,
  members = [],
  projects = [],
  showProjectFilter = false,
  className,
}: FilterBarProps) {
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {/* Status */}
      <Select
        value={filters.status ?? ''}
        onValueChange={(v) => onChange('status', v)}
      >
        <SelectTrigger className="h-9 w-40 text-sm">
          <SelectValue placeholder="All statuses" />
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((o) => (
            <SelectItem key={o.value || '__all__'} value={o.value || '__all_status__'}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Priority */}
      <Select
        value={filters.priority ?? ''}
        onValueChange={(v) => onChange('priority', v)}
      >
        <SelectTrigger className="h-9 w-40 text-sm">
          <SelectValue placeholder="All priorities" />
        </SelectTrigger>
        <SelectContent>
          {PRIORITY_OPTIONS.map((o) => (
            <SelectItem key={o.value || '__all__'} value={o.value || '__all_priority__'}>
              {o.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Assignee */}
      {members.length > 0 && (
        <Select
          value={filters.assigneeId ?? ''}
          onValueChange={(v) => onChange('assigneeId', v)}
        >
          <SelectTrigger className="h-9 w-44 text-sm">
            <SelectValue placeholder="All assignees" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all_assignee__">All assignees</SelectItem>
            {members.map((m) => (
              <SelectItem key={m.id} value={m.id}>
                {m.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {/* Project */}
      {showProjectFilter && projects.length > 0 && (
        <Select
          value={filters.projectId ?? ''}
          onValueChange={(v) => onChange('projectId', v)}
        >
          <SelectTrigger className="h-9 w-44 text-sm">
            <SelectValue placeholder="All projects" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__all_project__">All projects</SelectItem>
            {projects.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );
}
