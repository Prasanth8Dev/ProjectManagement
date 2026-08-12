'use client';
import { useParams } from 'next/navigation';
import { KanbanBoard } from '@/components/features/kanban/kanban-board';

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <div className="-mx-6 -mt-6">
      <KanbanBoard projectId={id} />
    </div>
  );
}
