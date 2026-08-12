import { create } from 'zustand';
import type { KanbanBoard, KanbanCard } from '@/types/kanban.types';
import type { TaskStatus } from '@/types/task.types';

interface KanbanStore {
  board: KanbanBoard | null;
  setBoard: (board: KanbanBoard) => void;
  moveCard: (
    cardId: string,
    fromStatus: TaskStatus,
    toStatus: TaskStatus,
    newPosition: number
  ) => void;
  draggingId: string | null;
  setDraggingId: (id: string | null) => void;
}

export const useKanbanStore = create<KanbanStore>()((set) => ({
  board: null,
  setBoard: (board) => set({ board }),
  moveCard: (cardId, fromStatus, toStatus, newPosition) =>
    set((state) => {
      if (!state.board) return state;
      const newColumns = { ...state.board.columns };
      const card = newColumns[fromStatus]?.find((c: KanbanCard) => c.id === cardId);
      if (!card) return state;
      newColumns[fromStatus] = newColumns[fromStatus].filter(
        (c: KanbanCard) => c.id !== cardId
      );
      const updatedCard: KanbanCard = { ...card, status: toStatus, position: newPosition };
      const target = [...(newColumns[toStatus] || [])];
      target.splice(newPosition, 0, updatedCard);
      newColumns[toStatus] = target;
      return { board: { ...state.board, columns: newColumns } };
    }),
  draggingId: null,
  setDraggingId: (id) => set({ draggingId: id }),
}));
