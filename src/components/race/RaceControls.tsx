import { algorithms } from '../../algorithms'
import { useGraphStore } from '../../stores/graphStore'
import { useRaceStore } from '../../stores/raceStore'

export function RaceControls() {
  const graph = useGraphStore((state) => state.graph)
  const {
    leftAlgorithm,
    rightAlgorithm,
    raceStatus,
    speed,
    startNode,
    endNode,
    leftSteps,
    rightSteps,
    leftStepIndex,
    rightStepIndex,
    selectLeft,
    selectRight,
    setStartNode,
    setEndNode,
    setSpeed,
    runRace,
    play,
    pause,
    reset,
  } = useRaceStore()

  const pathfindingAlgorithms = algorithms.filter((a) => a.category === 'pathfinding')
  const canStart = leftAlgorithm && rightAlgorithm && startNode && endNode && startNode !== endNode
  const hasSteps = leftSteps.length > 0 || rightSteps.length > 0

  const handleRun = () => {
    if (!canStart) return
    runRace(graph)
  }

  return (
    <div style={{
      padding: '16px 20px',
      borderTop: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      backgroundColor: 'var(--bg-secondary)',
    }}>
      {/* Algorithm selectors */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Left Algorithm
          </label>
          <select
            value={leftAlgorithm?.id || ''}
            onChange={(e) => selectLeft(pathfindingAlgorithms.find((a) => a.id === e.target.value) || null)}
            disabled={raceStatus === 'running'}
            style={{
              padding: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
            }}
          >
            <option value="">Select...</option>
            {pathfindingAlgorithms.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Right Algorithm
          </label>
          <select
            value={rightAlgorithm?.id || ''}
            onChange={(e) => selectRight(pathfindingAlgorithms.find((a) => a.id === e.target.value) || null)}
            disabled={raceStatus === 'running'}
            style={{
              padding: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
            }}
          >
            <option value="">Select...</option>
            {pathfindingAlgorithms.map((a) => (
              <option key={a.id} value={a.id}>{a.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Node selectors */}
      <div style={{ display: 'flex', gap: '16px' }}>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Start Node
          </label>
          <select
            value={startNode}
            onChange={(e) => setStartNode(e.target.value)}
            disabled={raceStatus === 'running'}
            style={{
              padding: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
            }}
          >
            <option value="">Select...</option>
            {graph.nodes.map((node) => (
              <option key={node.id} value={node.id} disabled={node.id === endNode}>
                {node.label || node.id}
              </option>
            ))}
          </select>
        </div>

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{
            fontFamily: 'var(--font-mono)',
            fontSize: '11px',
            fontWeight: 600,
            color: 'var(--text-tertiary)',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            End Node
          </label>
          <select
            value={endNode}
            onChange={(e) => setEndNode(e.target.value)}
            disabled={raceStatus === 'running'}
            style={{
              padding: '8px',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              backgroundColor: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
            }}
          >
            <option value="">Select...</option>
            {graph.nodes.map((node) => (
              <option key={node.id} value={node.id} disabled={node.id === startNode}>
                {node.label || node.id}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Speed slider */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <label style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          fontWeight: 600,
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          whiteSpace: 'nowrap',
        }}>
          Speed
        </label>
        <input
          type="range"
          min={50}
          max={2000}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          style={{ flex: 1 }}
        />
        <span style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          minWidth: '50px',
          textAlign: 'right',
        }}>
          {speed}ms
        </span>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {raceStatus === 'idle' ? (
          <button
            onClick={handleRun}
            disabled={!canStart}
            style={{
              flex: 1,
              padding: '10px',
              fontFamily: 'var(--font-mono)',
              fontSize: '13px',
              fontWeight: 600,
              backgroundColor: canStart ? 'var(--text-primary)' : 'var(--bg-primary)',
              color: canStart ? 'var(--bg-primary)' : 'var(--text-tertiary)',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              cursor: canStart ? 'pointer' : 'not-allowed',
            }}
          >
            Start Race
          </button>
        ) : (
          <>
            {raceStatus === 'running' ? (
              <button
                onClick={pause}
                style={{
                  flex: 1,
                  padding: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: 'var(--text-primary)',
                  color: 'var(--bg-primary)',
                  border: '1px solid var(--text-primary)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                }}
              >
                Pause
              </button>
            ) : (
              <button
                onClick={play}
                disabled={raceStatus === 'complete'}
                style={{
                  flex: 1,
                  padding: '10px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                  fontWeight: 600,
                  backgroundColor: raceStatus !== 'complete' ? 'var(--text-primary)' : 'var(--bg-primary)',
                  color: raceStatus !== 'complete' ? 'var(--bg-primary)' : 'var(--text-tertiary)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  cursor: raceStatus !== 'complete' ? 'pointer' : 'not-allowed',
                }}
              >
                Play
              </button>
            )}
            <button
              onClick={reset}
              style={{
                padding: '10px 16px',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-color)',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Reset
            </button>
          </>
        )}
      </div>

      {/* Step counters */}
      {hasSteps && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--text-secondary)',
        }}>
          <span>Left: step {leftStepIndex + 1}/{leftSteps.length}</span>
          <span>Right: step {rightStepIndex + 1}/{rightSteps.length}</span>
        </div>
      )}
    </div>
  )
}
