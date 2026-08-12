'use client';
import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { KanbanCard } from './kanban-card';
import { Task, TaskStatus } from '@/types/task.types';
import { TASK_STATUS_CONFIG } from '@/constants/task-statuses';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { TaskForm } from '../tasks/task-form';
import { cn } from '@/lib/utils/cn';

interface KanbanColumnProps {
  status: TaskStatus;
  tasks: Task[];
  projectId: string;
}

const COLUMN_BORDER_COLORS: Record<TaskStatus, string> = {
  BACKLOG: 'border-l-slate-400',
  TODO: 'border-l-blue-400',
  IN_PROGRESS: 'border-l-yellow-400',
  IN_REVIEW: 'border-l-purple-400',
  TESTING: 'border-l-orange-400',
  DONE: 'border-l-green-400',
  CANCELLED: 'border-l-red-400',
};

export function KanbanColumn({ status, tasks, projectId }: KanbanColumnProps) {
  const [showTaskForm, setShowTaskForm] = useState(false);
  const config = TASK_STATUS_CONFIG[status];

  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div
      className={cn(
        'flex flex-col w-72 shrink-0 rounded-xl bg-muted/40 border border-l-4 transition-colors',
        COLUMN_BORDER_COLORS[status],
        isOver && 'ring-2 ring-primary ring-offset-2 bg-primary/5'
      )}
    >
      {/* Column header */}
      <div className="flex items-center justify-between px-3 py-2.5 border-b">
        <div className="flex items-center gap-2">
          <span className={cn('h-2.5 w-2.5 rounded-full', config.dotColor)} />
          <span className="text-sm font-semibold">{config.label}</span>
          <span className="text-xs text-muted-foreground bg-muted rounded-full px-1.5 py-0.5 font-medium tabular-nums">
            {tasks.length}
          </span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          onClick={() => setShowTaskForm(true)}
          aria-label={`Add task to ${config.label}`}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Cards list */}
      <ScrollArea
        className="flex-1 p-2"
        style={{ maxHeight: 'calc(100vh - 260px)' }}
      >
        <SortableContext
          items={tasks.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          <div ref={setNodeRef} className="space-y-2 min-h-8">
            {tasks.map((task) => (
              <KanbanCard key={task.id} task={task} />
            ))}
            {tasks.length === 0 && (
              <div className="h-16 flex items-center justify-center border-2 border-dashed border-muted-foreground/20 rounded-lg">
                <p className="text-xs text-muted-foreground">
                  Drop tasks here
                </p>
              </div>
            )}
          </div>
        </SortableContext>
      </ScrollArea>

      {/* Add task button at bottom */}
      <div className="p-2 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground hover:text-foreground justify-start text-xs"
          onClick={() => setShowTaskForm(true)}
        >
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Add task
        </Button>
      </div>

      <TaskForm
        open={showTaskForm}
        onOpenChange={setShowTaskForm}
        defaultProjectId={projectId}
      />
    </div>
  );
}
