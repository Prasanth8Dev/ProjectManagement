import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface UIStore {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
  activeModal: string | null;
  openModal: (name: string) => void;
  closeModal: () => void;
  isTaskFormOpen: boolean;
  setTaskFormOpen: (open: boolean) => void;
}

export const useUIStore = create<UIStore>()(
  persist(
    (set) => ({
      isSidebarOpen: true,
      toggleSidebar: () => set((s) => ({ isSidebarOpen: !s.isSidebarOpen })),
      setSidebarOpen: (open) => set({ isSidebarOpen: open }),
      activeModal: null,
      openModal: (name) => set({ activeModal: name }),
      closeModal: () => set({ activeModal: null }),
      isTaskFormOpen: false,
      setTaskFormOpen: (open) => set({ isTaskFormOpen: open }),
    }),
    { name: 'ui-store', partialize: (s) => ({ isSidebarOpen: s.isSidebarOpen }) }
  )
);
