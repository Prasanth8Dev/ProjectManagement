import { create } from 'zustand';

interface TaskFilters {
  status?: string;
  priority?: string;
  assigneeId?: string;
  projectId?: string;
}

interface ProjectFilters {
  status?: string;
  priority?: string;
  isArchived?: boolean;
}

interface FilterStore {
  taskFilters: TaskFilters;
  setTaskFilters: (filters: TaskFilters) => void;
  resetTaskFilters: () => void;
  projectFilters: ProjectFilters;
  setProjectFilters: (filters: ProjectFilters) => void;
  resetProjectFilters: () => void;
}

export const useFilterStore = create<FilterStore>()((set) => ({
  taskFilters: {},
  setTaskFilters: (filters) => set({ taskFilters: filters }),
  resetTaskFilters: () => set({ taskFilters: {} }),
  projectFilters: {},
  setProjectFilters: (filters) => set({ projectFilters: filters }),
  resetProjectFilters: () => set({ projectFilters: {} }),
}));
