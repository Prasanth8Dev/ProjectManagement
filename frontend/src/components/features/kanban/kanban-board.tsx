'use client';
import { useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core';
import { motion } from 'framer-motion';
import { KanbanColumn } from './kanban-column';
import { KanbanCard } from './kanban-card';
import { useKanbanBoard, useMoveKanbanCard } from '@/hooks/use-kanban';
import { useKanbanStore } from '@/stores/kanban.store';
import { Task, TaskStatus } from '@/types/task.types';
import type { KanbanCard as KanbanCardType } from '@/types/kanban.types';
import { LoadingSpinner } from '@/components/shared/loading-spinner';
import { toast } from '@/components/ui/use-toast';

const KANBAN_COLUMNS: TaskStatus[] = [
  'BACKLOG',
  'TODO',
  'IN_PROGRESS',
  'IN_REVIEW',
  'TESTING',
  'DONE',
];

interface KanbanBoardProps {
  projectId: string;
}

export function KanbanBoard({ projectId }: KanbanBoardProps) {
  const { data: board, isLoading } = useKanbanBoard(projectId);
  const { mutate: moveCard } = useMoveKanbanCard(projectId);
  const draggingId = useKanbanStore((s) => s.draggingId);
  const setDraggingId = useKanbanStore((s) => s.setDraggingId);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const columns = useMemo<Record<TaskStatus, KanbanCardType[]>>(() => {
    if (!board) return {} as Record<TaskStatus, KanbanCardType[]>;
    const cols = {} as Record<TaskStatus, KanbanCardType[]>;
    KANBAN_COLUMNS.forEach((status) => {
      cols[status] = board.columns[status] ?? [];
    });
    return cols;
  }, [board]);

  const allCards = useMemo(() => Object.values(columns).flat(), [columns]);
  const draggingCard = draggingId ? allCards.find((c) => c.id === draggingId) ?? null : null;

  const handleDragStart = (event: DragStartEvent) => {
    setDraggingId(String(event.active.id));
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setDraggingId(null);

    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    const fromStatus = Object.entries(columns).find(([, cards]) =>
      cards.some((c) => c.id === activeId)
    )?.[0] as TaskStatus | undefined;

    const toStatus = (
      KANBAN_COLUMNS.includes(overId as TaskStatus)
        ? overId
        : Object.entries(columns).find(([, cards]) =>
            cards.some((c) => c.id === overId)
          )?.[0]
    ) as TaskStatus | undefined;

    if (!fromStatus || !toStatus || fromStatus === toStatus) return;

    const newPosition = columns[toStatus]?.length ?? 0;

    moveCard(
      { taskId: activeId, newStatus: toStatus, newPosition },
      {
        onError: () => {
          toast({ title: 'Failed to move task', variant: 'destructive' });
        },
      }
    );
  };

  if (isLoading) {
    return <LoadingSpinner fullPage />;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex gap-4 overflow-x-auto pb-6 min-h-[calc(100vh-200px)]"
        style={{ scrollbarWidth: 'thin' }}
      >
        {KANBAN_COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            tasks={(columns[status] ?? []) as unknown as Task[]}
            projectId={projectId}
          />
        ))}
      </motion.div>

      <DragOverlay>
        {draggingCard && (
          <div className="rotate-2 scale-105">
            <KanbanCard task={draggingCard as unknown as Task} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
