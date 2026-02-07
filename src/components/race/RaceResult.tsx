import { useRaceStore } from '../../stores/raceStore'

export function RaceResult() {
  const {
    raceStatus,
    winner,
    leftAlgorithm,
    rightAlgorithm,
    leftSteps,
    rightSteps,
  } = useRaceStore()

  if (raceStatus !== 'complete' || !winner) return null

  const winnerName = winner === 'left'
    ? leftAlgorithm?.name
    : winner === 'right'
      ? rightAlgorithm?.name
      : null

  return (
    <div style={{
      padding: '12px 20px',
      backgroundColor: winner === 'tie' ? 'var(--bg-secondary)' : '#1B5E20',
      borderTop: '1px solid var(--border-color)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '16px',
      fontFamily: 'var(--font-mono)',
    }}>
      <span style={{
        fontSize: '14px',
        fontWeight: 600,
        color: '#ffffff',
      }}>
        {winner === 'tie'
          ? 'Tie! Both algorithms finished in the same number of steps.'
          : `${winnerName} wins!`
        }
      </span>
      <span style={{
        fontSize: '12px',
        color: 'rgba(255,255,255,0.7)',
      }}>
        {leftAlgorithm?.name}: {leftSteps.length} steps | {rightAlgorithm?.name}: {rightSteps.length} steps
      </span>
    </div>
  )
}
