import { create } from 'zustand'

export type AppMode = 'sandbox' | 'learn' | 'race' | 'maps'
export type EditMode = 'select' | 'addNode' | 'addEdge' | 'delete'

interface UIStore {
  // App mode
  appMode: AppMode
  setAppMode: (mode: AppMode) => void

  // Edit mode for graph manipulation
  editMode: EditMode
  setEditMode: (mode: EditMode) => void

  // Edge creation state
  edgeSourceNode: string | null
  setEdgeSourceNode: (nodeId: string | null) => void

  // Sidebar
  sidebarOpen: boolean
  toggleSidebar: () => void

  // Algorithm picker modal
  algorithmPickerOpen: boolean
  setAlgorithmPickerOpen: (open: boolean) => void

  // Step inspector panel
  stepInspectorOpen: boolean
  setStepInspectorOpen: (open: boolean) => void
}

export const useUIStore = create<UIStore>((set) => ({
  appMode: 'sandbox',
  setAppMode: (mode) => set({ appMode: mode }),

  editMode: 'select',
  setEditMode: (mode) => set({ editMode: mode, edgeSourceNode: null }),

  edgeSourceNode: null,
  setEdgeSourceNode: (nodeId) => set({ edgeSourceNode: nodeId }),

  sidebarOpen: true,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

  algorithmPickerOpen: false,
  setAlgorithmPickerOpen: (open) => set({ algorithmPickerOpen: open }),

  stepInspectorOpen: false,
  setStepInspectorOpen: (open) => set({ stepInspectorOpen: open }),
}))
