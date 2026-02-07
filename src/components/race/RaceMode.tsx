import { useEffect, useRef } from 'react'
import { useRaceStore } from '../../stores/raceStore'
import { useGraphStore } from '../../stores/graphStore'
import { RaceCanvas } from './RaceCanvas'
import { RaceControls } from './RaceControls'
import { RaceResult } from './RaceResult'
import styles from './RaceMode.module.css'

export function RaceMode() {
  const graph = useGraphStore((state) => state.graph)
  const {
    raceStatus,
    speed,
    leftAlgorithm,
    rightAlgorithm,
    leftCurrentStep,
    rightCurrentStep,
    stepBoth,
  } = useRaceStore()

  const intervalRef = useRef<number | null>(null)

  // Auto-stepping when running
  useEffect(() => {
    if (raceStatus === 'running') {
      intervalRef.current = window.setInterval(() => {
        const continued = stepBoth()
        if (!continued && intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
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
  }, [raceStatus, speed, stepBoth])

  const hasGraph = graph.nodes.length >= 2

  return (
    <div className={styles.container}>
      {hasGraph ? (
        <>
          <div className={styles.canvases}>
            <RaceCanvas
              step={leftCurrentStep()}
              label={leftAlgorithm?.name || 'Left Algorithm'}
            />
            <div className={styles.divider} />
            <RaceCanvas
              step={rightCurrentStep()}
              label={rightAlgorithm?.name || 'Right Algorithm'}
            />
          </div>
          <RaceResult />
          <RaceControls />
        </>
      ) : (
        <div className={styles.emptyState}>
          Add at least 2 nodes in Sandbox mode first,<br />
          then switch to Race mode to compare algorithms.
        </div>
      )}
    </div>
  )
}
