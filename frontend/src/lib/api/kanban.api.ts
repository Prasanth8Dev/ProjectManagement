import api from './axios';
import type { KanbanBoard } from '@/types/kanban.types';
import type { TaskStatus } from '@/types/task.types';

export interface MoveKanbanCardInput {
  taskId: string;
  newStatus: TaskStatus;
  newPosition: number;
}

export async function getKanbanBoard(projectId: string): Promise<KanbanBoard> {
  return api.get(`/kanban/${projectId}`);
}

export async function moveKanbanCard(
  projectId: string,
  data: MoveKanbanCardInput
): Promise<void> {
  return api.patch(`/kanban/move`, data);
}
