'use client';
import { useState } from 'react';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { TaskCard } from './task-card';
import { TaskForm } from './task-form';
import { useSubtasks } from '@/hooks/use-tasks';
import { cn } from '@/lib/utils/cn';

interface TaskSubtasksProps {
  taskId: string;
  projectId: string;
}

export function TaskSubtasks({ taskId, projectId }: TaskSubtasksProps) {
  const [showForm, setShowForm] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const { data: subtasks, isLoading } = useSubtasks(taskId);

  const count = subtasks?.length ?? 0;
  const completedCount = subtasks?.filter((t: any) => t.status === 'DONE').length ?? 0;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          className="flex items-center gap-1.5 text-sm font-medium hover:text-primary transition-colors"
          onClick={() => setIsExpanded((v) => !v)}
          aria-expanded={isExpanded}
        >
          {isExpanded ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          Subtasks
          {count > 0 && (
            <span className="text-xs text-muted-foreground ml-0.5">
              ({completedCount}/{count})
            </span>
          )}
        </button>
        <Button
          variant="outline"
          size="sm"
          className="h-7 text-xs"
          onClick={() => setShowForm(true)}
        >
          <Plus className="h-3.5 w-3.5 mr-1" />
          Add Subtask
        </Button>
      </div>

      {/* Content */}
      {isExpanded && (
        <div
          className={cn(
            'space-y-2 transition-all',
            !isExpanded && 'hidden'
          )}
        >
          {isLoading ? (
            Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))
          ) : !subtasks || subtasks.length === 0 ? (
            <p className="text-sm text-muted-foreground pl-1">
              No subtasks yet. Break this task into smaller pieces.
            </p>
          ) : (
            subtasks.map((subtask: any) => (
              <TaskCard key={subtask.id} task={subtask} />
            ))
          )}
        </div>
      )}

      {/* Task Form Sheet */}
      <TaskForm
        open={showForm}
        onOpenChange={setShowForm}
        defaultProjectId={projectId}
        parentTaskId={taskId}
      />
    </div>
  );
}
