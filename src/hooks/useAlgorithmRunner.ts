import { useCallback, useRef, useEffect } from 'react'
import { useAlgorithmStore } from '../stores/algorithmStore'
import { useGraphStore } from '../stores/graphStore'
import type { AlgorithmStep, AlgorithmRunner, AlgorithmParams } from '../types/algorithm'

export function useAlgorithmRunner() {
  const graph = useGraphStore((state) => state.graph)
  const {
    steps,
    currentStepIndex,
    status,
    speed,
    setSteps,
    setCurrentStep,
    setStatus,
    stepForward,
    reset,
  } = useAlgorithmStore()

  const intervalRef = useRef<number | null>(null)

  // Clean up interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [])

  // Handle auto-stepping when running
  useEffect(() => {
    if (status === 'running') {
      intervalRef.current = window.setInterval(() => {
        const advanced = stepForward()
        if (!advanced) {
          setStatus('complete')
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }
        }
      }, speed)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [status, speed, stepForward, setStatus])

  const runAlgorithm = useCallback(
    (alg: AlgorithmRunner, algorithmParams: AlgorithmParams = {}) => {
      // Reset any existing state
      reset()

      // Create generator and collect all steps
      const generator = alg.run(graph, algorithmParams)
      const allSteps: AlgorithmStep[] = []

      let result = generator.next()
      while (!result.done) {
        allSteps.push(result.value)
        result = generator.next()
      }

      if (allSteps.length === 0) {
        return
      }

      setSteps(allSteps)
      setStatus('paused')
    },
    [graph, reset, setSteps, setStatus]
  )

  const play = useCallback(() => {
    if (steps.length === 0) return
    if (currentStepIndex >= steps.length - 1) {
      // If at end, restart from beginning
      setCurrentStep(0)
    }
    setStatus('running')
  }, [steps.length, currentStepIndex, setCurrentStep, setStatus])

  const pause = useCallback(() => {
    setStatus('paused')
  }, [setStatus])

  const stop = useCallback(() => {
    reset()
  }, [reset])

  const isRunning = status === 'running'
  const isPaused = status === 'paused'
  const isComplete = status === 'complete'
  const isIdle = status === 'idle'
  const hasSteps = steps.length > 0

  return {
    runAlgorithm,
    play,
    pause,
    stop,
    isRunning,
    isPaused,
    isComplete,
    isIdle,
    hasSteps,
  }
}
