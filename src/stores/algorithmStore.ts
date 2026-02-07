import { create } from 'zustand'
import type { AlgorithmStep, AlgorithmRunner, AlgorithmParams } from '../types/algorithm'

type AlgorithmStatus = 'idle' | 'running' | 'paused' | 'complete'

interface AlgorithmStore {
  algorithm: AlgorithmRunner | null
  params: AlgorithmParams
  steps: AlgorithmStep[]
  currentStepIndex: number
  status: AlgorithmStatus
  speed: number // ms per step

  // Actions
  selectAlgorithm: (algorithm: AlgorithmRunner | null) => void
  setParams: (params: Partial<AlgorithmParams>) => void
  setSteps: (steps: AlgorithmStep[]) => void
  setCurrentStep: (index: number) => void
  setStatus: (status: AlgorithmStatus) => void
  setSpeed: (speed: number) => void

  // Step navigation
  stepForward: () => boolean
  stepBackward: () => boolean
  goToStart: () => void
  goToEnd: () => void

  // Control
  reset: () => void

  // Computed
  currentStep: () => AlgorithmStep | null
  progress: () => number
  isAtStart: () => boolean
  isAtEnd: () => boolean
}

export const useAlgorithmStore = create<AlgorithmStore>((set, get) => ({
  algorithm: null,
  params: {},
  steps: [],
  currentStepIndex: -1,
  status: 'idle',
  speed: 200,

  selectAlgorithm: (algorithm) => {
    set({
      algorithm,
      steps: [],
      currentStepIndex: -1,
      status: 'idle',
    })
  },

  setParams: (params) => {
    set((state) => ({
      params: { ...state.params, ...params },
    }))
  },

  setSteps: (steps) => {
    set({ steps, currentStepIndex: steps.length > 0 ? 0 : -1 })
  },

  setCurrentStep: (index) => {
    const { steps } = get()
    if (index >= -1 && index < steps.length) {
      set({ currentStepIndex: index })
    }
  },

  setStatus: (status) => {
    set({ status })
  },

  setSpeed: (speed) => {
    set({ speed: Math.max(50, Math.min(2000, speed)) })
  },

  stepForward: () => {
    const { currentStepIndex, steps } = get()
    if (currentStepIndex < steps.length - 1) {
      set({ currentStepIndex: currentStepIndex + 1 })
      return true
    }
    return false
  },

  stepBackward: () => {
    const { currentStepIndex } = get()
    if (currentStepIndex > 0) {
      set({ currentStepIndex: currentStepIndex - 1 })
      return true
    }
    return false
  },

  goToStart: () => {
    const { steps } = get()
    if (steps.length > 0) {
      set({ currentStepIndex: 0 })
    }
  },

  goToEnd: () => {
    const { steps } = get()
    if (steps.length > 0) {
      set({ currentStepIndex: steps.length - 1 })
    }
  },

  reset: () => {
    set({
      steps: [],
      currentStepIndex: -1,
      status: 'idle',
    })
  },

  currentStep: () => {
    const { steps, currentStepIndex } = get()
    return currentStepIndex >= 0 ? steps[currentStepIndex] : null
  },

  progress: () => {
    const { steps, currentStepIndex } = get()
    if (steps.length === 0) return 0
    return ((currentStepIndex + 1) / steps.length) * 100
  },

  isAtStart: () => {
    return get().currentStepIndex <= 0
  },

  isAtEnd: () => {
    const { currentStepIndex, steps } = get()
    return currentStepIndex >= steps.length - 1
  },
}))
