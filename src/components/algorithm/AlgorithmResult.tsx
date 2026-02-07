import { useAlgorithmStore } from '../../stores/algorithmStore'
import styles from './AlgorithmResult.module.css'

export function AlgorithmResult() {
  const { steps, currentStepIndex, algorithm } = useAlgorithmStore()

  const currentStep = steps[currentStepIndex]
  const isComplete = currentStep?.state?.phase === 'complete'
  const isFailed = currentStep?.state?.phase === 'failed'

  if (!currentStep || (!isComplete && !isFailed)) {
    return null
  }

  // For coloring algorithms
  if (algorithm?.category === 'coloring') {
    const colorsUsed = currentStep.state?.colorsUsed as number | undefined

    if (isFailed) {
      return (
        <div className={`${styles.result} ${styles.failed}`}>
          <div className={styles.label}>Result</div>
          <div className={styles.value}>Not Colorable</div>
          <div className={styles.detail}>
            Graph cannot be colored with the specified number of colors
          </div>
        </div>
      )
    }

    if (colorsUsed !== undefined) {
      return (
        <div className={`${styles.result} ${styles.success}`}>
          <div className={styles.label}>Chromatic Number</div>
          <div className={styles.value}>{colorsUsed}</div>
          <div className={styles.detail}>
            {colorsUsed === 1 && 'Graph has no edges (independent set)'}
            {colorsUsed === 2 && 'Graph is bipartite'}
            {colorsUsed === 3 && 'Graph is 3-colorable'}
            {colorsUsed > 3 && `Graph requires at least ${colorsUsed} colors`}
          </div>
        </div>
      )
    }
  }

  return null
}
