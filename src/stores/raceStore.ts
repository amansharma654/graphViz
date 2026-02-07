import { create } from 'zustand'
import type { AlgorithmStep, AlgorithmRunner } from '../types/algorithm'
import type { Graph } from '../types/graph'

type RaceStatus = 'idle' | 'setup' | 'running' | 'paused' | 'complete'

interface RaceStore {
  leftAlgorithm: AlgorithmRunner | null
  rightAlgorithm: AlgorithmRunner | null
  leftSteps: AlgorithmStep[]
  rightSteps: AlgorithmStep[]
  leftStepIndex: number
  rightStepIndex: number
  raceStatus: RaceStatus
  winner: 'left' | 'right' | 'tie' | null
  speed: number
  startNode: string
  endNode: string

  // Actions
  selectLeft: (algorithm: AlgorithmRunner | null) => void
  selectRight: (algorithm: AlgorithmRunner | null) => void
  setStartNode: (nodeId: string) => void
  setEndNode: (nodeId: string) => void
  setSpeed: (speed: number) => void
  runRace: (graph: Graph) => void
  stepBoth: () => boolean
  play: () => void
  pause: () => void
  reset: () => void

  // Computed
  leftCurrentStep: () => AlgorithmStep | null
  rightCurrentStep: () => AlgorithmStep | null
  canStart: () => boolean
}

export const useRaceStore = create<RaceStore>((set, get) => ({
  leftAlgorithm: null,
  rightAlgorithm: null,
  leftSteps: [],
  rightSteps: [],
  leftStepIndex: -1,
  rightStepIndex: -1,
  raceStatus: 'idle',
  winner: null,
  speed: 200,
  startNode: '',
  endNode: '',

  selectLeft: (algorithm) => set({ leftAlgorithm: algorithm }),
  selectRight: (algorithm) => set({ rightAlgorithm: algorithm }),
  setStartNode: (nodeId) => set({ startNode: nodeId }),
  setEndNode: (nodeId) => set({ endNode: nodeId }),

  setSpeed: (speed) => set({ speed: Math.max(50, Math.min(2000, speed)) }),

  runRace: (graph: Graph) => {
    const { leftAlgorithm, rightAlgorithm, startNode, endNode } = get()
    if (!leftAlgorithm || !rightAlgorithm) return
    if (!startNode || !endNode || startNode === endNode) return

    const params = { startNode, endNode }

    const leftGen = leftAlgorithm.run(graph, params)
    const leftSteps: AlgorithmStep[] = []
    let r = leftGen.next()
    while (!r.done) {
      leftSteps.push(r.value)
      r = leftGen.next()
    }

    const rightGen = rightAlgorithm.run(graph, params)
    const rightSteps: AlgorithmStep[] = []
    r = rightGen.next()
    while (!r.done) {
      rightSteps.push(r.value)
      r = rightGen.next()
    }

    set({
      leftSteps,
      rightSteps,
      leftStepIndex: leftSteps.length > 0 ? 0 : -1,
      rightStepIndex: rightSteps.length > 0 ? 0 : -1,
      raceStatus: 'paused',
      winner: null,
    })
  },

  stepBoth: () => {
    const { leftStepIndex, rightStepIndex, leftSteps, rightSteps } = get()
    const leftDone = leftStepIndex >= leftSteps.length - 1
    const rightDone = rightStepIndex >= rightSteps.length - 1

    if (leftDone && rightDone) {
      // Determine winner by total steps
      const leftTotal = leftSteps.length
      const rightTotal = rightSteps.length
      let winner: 'left' | 'right' | 'tie' = 'tie'
      if (leftTotal < rightTotal) winner = 'left'
      else if (rightTotal < leftTotal) winner = 'right'

      set({ raceStatus: 'complete', winner })
      return false
    }

    set({
      leftStepIndex: leftDone ? leftStepIndex : leftStepIndex + 1,
      rightStepIndex: rightDone ? rightStepIndex : rightStepIndex + 1,
    })

    // Check if both just finished
    const newLeft = leftDone ? leftStepIndex : leftStepIndex + 1
    const newRight = rightDone ? rightStepIndex : rightStepIndex + 1
    const nowLeftDone = newLeft >= leftSteps.length - 1
    const nowRightDone = newRight >= rightSteps.length - 1

    if (nowLeftDone && nowRightDone) {
      const leftTotal = leftSteps.length
      const rightTotal = rightSteps.length
      let winner: 'left' | 'right' | 'tie' = 'tie'
      if (leftTotal < rightTotal) winner = 'left'
      else if (rightTotal < leftTotal) winner = 'right'

      set({ raceStatus: 'complete', winner })
      return false
    }

    return true
  },

  play: () => {
    const { leftSteps, rightSteps, leftStepIndex, rightStepIndex } = get()
    if (leftSteps.length === 0 && rightSteps.length === 0) return

    // If at end, restart
    const leftDone = leftStepIndex >= leftSteps.length - 1
    const rightDone = rightStepIndex >= rightSteps.length - 1
    if (leftDone && rightDone) {
      set({
        leftStepIndex: 0,
        rightStepIndex: 0,
        winner: null,
      })
    }

    set({ raceStatus: 'running' })
  },

  pause: () => set({ raceStatus: 'paused' }),

  reset: () => set({
    leftSteps: [],
    rightSteps: [],
    leftStepIndex: -1,
    rightStepIndex: -1,
    raceStatus: 'idle',
    winner: null,
  }),

  leftCurrentStep: () => {
    const { leftSteps, leftStepIndex } = get()
    return leftStepIndex >= 0 ? leftSteps[leftStepIndex] : null
  },

  rightCurrentStep: () => {
    const { rightSteps, rightStepIndex } = get()
    return rightStepIndex >= 0 ? rightSteps[rightStepIndex] : null
  },

  canStart: () => {
    const { leftAlgorithm, rightAlgorithm, startNode, endNode } = get()
    return !!(leftAlgorithm && rightAlgorithm && startNode && endNode && startNode !== endNode)
  },
}))
