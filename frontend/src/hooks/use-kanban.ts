import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';
import {
  getKanbanBoard,
  moveKanbanCard,
  type MoveKanbanCardInput,
} from '@/lib/api/kanban.api';
import type { KanbanBoard } from '@/types/kanban.types';

export const useKanbanBoard = (projectId: string) =>
  useQuery({
    queryKey: QUERY_KEYS.kanban.board(projectId),
    queryFn: () => getKanbanBoard(projectId),
    enabled: !!projectId,
    staleTime: 60_000,
    select: (d: any): KanbanBoard => d?.data ?? d,
  });

export const useMoveKanbanCard = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: MoveKanbanCardInput) => moveKanbanCard(projectId, data),
    onMutate: async ({ taskId, newStatus, newPosition }) => {
      // Cancel in-flight board refetches so they don't overwrite our optimistic update
      await qc.cancelQueries({ queryKey: QUERY_KEYS.kanban.board(projectId) });
      const prev = qc.getQueryData<any>(QUERY_KEYS.kanban.board(projectId));

      qc.setQueryData(QUERY_KEYS.kanban.board(projectId), (old: any) => {
        const board = old?.data ?? old;
        if (!board?.columns) return old;

        const cols: Record<string, any[]> = {};
        let movedCard: any = null;

        // Find and remove card from its current column
        for (const [status, cards] of Object.entries(board.columns)) {
          const found = (cards as any[]).find((c) => c.id === taskId);
          if (found) {
            movedCard = { ...found, status: newStatus };
            cols[status] = (cards as any[]).filter((c) => c.id !== taskId);
          } else {
            cols[status] = [...(cards as any[])];
          }
        }

        if (!movedCard) return old;

        // Insert into target column at position
        const target = [...(cols[newStatus] || [])];
        target.splice(newPosition, 0, movedCard);
        cols[newStatus] = target;

        const newBoard = { ...board, columns: cols };
        return old?.data ? { ...old, data: newBoard } : newBoard;
      });

      return { prev };
    },
    onError: (_err, _vars, context) => {
      // Revert to previous state on error
      if (context?.prev !== undefined) {
        qc.setQueryData(QUERY_KEYS.kanban.board(projectId), context.prev);
      }
    },
    onSettled: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.kanban.board(projectId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.lists() });
    },
  });
};
