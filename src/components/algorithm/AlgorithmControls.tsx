import { useAlgorithmStore } from '../../stores/algorithmStore'
import { useAlgorithmRunner } from '../../hooks/useAlgorithmRunner'
import styles from './AlgorithmControls.module.css'

// Clean SVG icons for playback controls
function SkipBackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M3 3v10h1.5V3H3zm3.5 5l6 4.5V3.5l-6 4.5z" />
    </svg>
  )
}

function StepBackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M11 3.5L5 8l6 4.5v-9z" />
    </svg>
  )
}

function PlayIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
      <path d="M4 3v12l10-6L4 3z" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="currentColor">
      <path d="M5 3h3v12H5V3zm5 0h3v12h-3V3z" />
    </svg>
  )
}

function StepForwardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M5 3.5v9L11 8 5 3.5z" />
    </svg>
  )
}

function SkipForwardIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <path d="M12 3v10h-1.5V3H12zM3.5 3.5v9l6-4.5-6-4.5z" />
    </svg>
  )
}

export function AlgorithmControls() {
  const {
    steps,
    currentStepIndex,
    status,
    speed,
    setSpeed,
    stepForward,
    stepBackward,
    goToStart,
    goToEnd,
    currentStep,
    progress,
  } = useAlgorithmStore()

  const { play, pause, stop, isRunning, hasSteps } = useAlgorithmRunner()

  const step = currentStep()

  if (!hasSteps) {
    return null
  }

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.playbackButtons}>
          <button
            className={styles.controlButton}
            onClick={goToStart}
            disabled={currentStepIndex <= 0}
            title="Go to start"
          >
            <SkipBackIcon />
          </button>
          <button
            className={styles.controlButton}
            onClick={stepBackward}
            disabled={currentStepIndex <= 0}
            title="Step backward"
          >
            <StepBackIcon />
          </button>
          {isRunning ? (
            <button
              className={`${styles.controlButton} ${styles.playPause}`}
              onClick={pause}
              title="Pause"
            >
              <PauseIcon />
            </button>
          ) : (
            <button
              className={`${styles.controlButton} ${styles.playPause}`}
              onClick={play}
              disabled={status === 'complete' && currentStepIndex >= steps.length - 1}
              title="Play"
            >
              <PlayIcon />
            </button>
          )}
          <button
            className={styles.controlButton}
            onClick={stepForward}
            disabled={currentStepIndex >= steps.length - 1}
            title="Step forward"
          >
            <StepForwardIcon />
          </button>
          <button
            className={styles.controlButton}
            onClick={goToEnd}
            disabled={currentStepIndex >= steps.length - 1}
            title="Go to end"
          >
            <SkipForwardIcon />
          </button>
        </div>

        <div className={styles.speedControl}>
          <label>Speed</label>
          <input
            type="range"
            min={50}
            max={2000}
            step={50}
            value={2050 - speed}
            onChange={(e) => setSpeed(2050 - parseInt(e.target.value))}
          />
          <span>{speed}ms</span>
        </div>

        <button className={styles.stopButton} onClick={stop} title="Stop">
          Stop
        </button>
      </div>

      <div className={styles.progress}>
        <div
          className={styles.progressBar}
          style={{ width: `${progress()}%` }}
        />
      </div>

      <div className={styles.stepInfo}>
        <span className={styles.stepNumber}>
          Step {currentStepIndex + 1} / {steps.length}
        </span>
        {step && <span className={styles.stepDescription}>{step.description}</span>}
      </div>
    </div>
  )
}
