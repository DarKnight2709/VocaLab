import { create } from 'zustand';

interface LayoutState {
  isLeftSidebarVisible: boolean;
  setIsLeftSidebarVisible: (visible: boolean) => void;
  toggleLeftSidebar: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  isLeftSidebarVisible: typeof window !== 'undefined' && window.innerWidth >= 768,
  setIsLeftSidebarVisible: (visible) => set({ isLeftSidebarVisible: visible }),
  toggleLeftSidebar: () => set((state) => ({ isLeftSidebarVisible: !state.isLeftSidebarVisible })),
}));
