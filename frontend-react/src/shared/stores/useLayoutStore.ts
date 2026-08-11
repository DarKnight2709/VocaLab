import { create } from 'zustand';

interface LayoutState {
  isLeftSidebarVisible: boolean;
  isFocusMode: boolean;
  setIsLeftSidebarVisible: (visible: boolean) => void;
  setIsFocusMode: (focus: boolean) => void;
  toggleLeftSidebar: () => void;
}

export const useLayoutStore = create<LayoutState>((set) => ({
  isLeftSidebarVisible: typeof window !== 'undefined' && window.innerWidth >= 768,
  isFocusMode: false,
  setIsLeftSidebarVisible: (visible) => set({ isLeftSidebarVisible: visible }),
  setIsFocusMode: (focus) => set({ isFocusMode: focus }),
  toggleLeftSidebar: () => set((state) => ({ isLeftSidebarVisible: !state.isLeftSidebarVisible })),
}));
