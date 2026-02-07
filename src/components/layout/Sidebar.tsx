import { useState } from 'react'
import { useUIStore } from '../../stores/uiStore'
import { useAlgorithmStore } from '../../stores/algorithmStore'
import { useGraphStore } from '../../stores/graphStore'
import { useAlgorithmRunner } from '../../hooks/useAlgorithmRunner'
import { getCategories } from '../../algorithms'
import { GraphControls } from '../graph/GraphControls'
import type { AlgorithmRunner, AlgorithmParams } from '../../types/algorithm'
import styles from './Sidebar.module.css'

export function Sidebar() {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen)
  const selectAlgorithm = useAlgorithmStore((state) => state.selectAlgorithm)
  const algorithm = useAlgorithmStore((state) => state.algorithm)
  const status = useAlgorithmStore((state) => state.status)
  const graph = useGraphStore((state) => state.graph)
  const { runAlgorithm } = useAlgorithmRunner()

  const [expandedAlgorithm, setExpandedAlgorithm] = useState<AlgorithmRunner | null>(null)
  const [coloringMode, setColoringMode] = useState<'minimum' | 'k-coloring'>('minimum')
  const [kValue, setKValue] = useState(3)
  const [startNode, setStartNode] = useState('')
  const [endNode, setEndNode] = useState('')

  const categories = getCategories()

  const handleAlgorithmClick = (alg: AlgorithmRunner) => {
    if (alg.category === 'coloring' || alg.category === 'pathfinding') {
      setExpandedAlgorithm(expandedAlgorithm?.id === alg.id ? null : alg)
    } else {
      selectAlgorithm(alg)
      runAlgorithm(alg)
    }
  }

  const handleRunColoring = () => {
    if (!expandedAlgorithm) return
    const params: AlgorithmParams = {}
    if (coloringMode === 'k-coloring') {
      params.maxColors = kValue
    }
    selectAlgorithm(expandedAlgorithm)
    runAlgorithm(expandedAlgorithm, params)
    setExpandedAlgorithm(null)
  }

  const handleRunPathfinding = () => {
    if (!expandedAlgorithm || !startNode || !endNode || startNode === endNode) return
    selectAlgorithm(expandedAlgorithm)
    runAlgorithm(expandedAlgorithm, { startNode, endNode })
    setExpandedAlgorithm(null)
    setStartNode('')
    setEndNode('')
  }

  if (!sidebarOpen) return null

  const canRunPathfinding = startNode && endNode && startNode !== endNode

  return (
    <aside className={styles.sidebar}>
      <div className={styles.content}>
        <GraphControls />

        {categories.map((category) => (
          <div key={category.category} className={styles.section}>
            <h3 className={styles.sectionTitle}>{category.name}</h3>
            {category.algorithms.map((alg) => (
              <div key={alg.id}>
                <button
                  className={`${styles.algorithmButton} ${algorithm?.id === alg.id ? styles.algorithmButtonActive : ''}`}
                  onClick={() => handleAlgorithmClick(alg)}
                >
                  <span className={styles.algorithmName}>{alg.name}</span>
                  <span className={styles.algorithmComplexity}>{alg.complexity.time}</span>
                </button>

                {/* Coloring config */}
                {expandedAlgorithm?.id === alg.id && alg.category === 'coloring' && (
                  <div className={styles.configPanel}>
                    <label className={styles.configRadio}>
                      <input
                        type="radio"
                        name="coloringMode"
                        checked={coloringMode === 'minimum'}
                        onChange={() => setColoringMode('minimum')}
                      />
                      <span>Minimum coloring</span>
                    </label>
                    <label className={styles.configRadio}>
                      <input
                        type="radio"
                        name="coloringMode"
                        checked={coloringMode === 'k-coloring'}
                        onChange={() => setColoringMode('k-coloring')}
                      />
                      <span>k-Coloring</span>
                    </label>
                    {coloringMode === 'k-coloring' && (
                      <div className={styles.configInput}>
                        <label>k =</label>
                        <input
                          type="number"
                          min={1}
                          max={10}
                          value={kValue}
                          onChange={(e) => setKValue(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                        />
                      </div>
                    )}
                    <button className={styles.runButton} onClick={handleRunColoring}>
                      Run
                    </button>
                  </div>
                )}

                {/* Pathfinding config */}
                {expandedAlgorithm?.id === alg.id && alg.category === 'pathfinding' && (
                  <div className={styles.configPanel}>
                    <div className={styles.configSelect}>
                      <label>Start</label>
                      <select value={startNode} onChange={(e) => setStartNode(e.target.value)}>
                        <option value="">Select...</option>
                        {graph.nodes.map((n) => (
                          <option key={n.id} value={n.id} disabled={n.id === endNode}>
                            {n.label || n.id}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.configSelect}>
                      <label>End</label>
                      <select value={endNode} onChange={(e) => setEndNode(e.target.value)}>
                        <option value="">Select...</option>
                        {graph.nodes.map((n) => (
                          <option key={n.id} value={n.id} disabled={n.id === startNode}>
                            {n.label || n.id}
                          </option>
                        ))}
                      </select>
                    </div>
                    {graph.nodes.length < 2 && (
                      <span className={styles.configHint}>Add at least 2 nodes first</span>
                    )}
                    <button
                      className={styles.runButton}
                      onClick={handleRunPathfinding}
                      disabled={!canRunPathfinding}
                      style={{ opacity: canRunPathfinding ? 1 : 0.5 }}
                    >
                      Run
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}

        {algorithm && (
          <div className={styles.section}>
            <div className={styles.currentAlgorithm}>
              <span className={styles.algorithmLabel}>Running</span>
              <span className={styles.algorithmName}>{algorithm.name}</span>
              <span className={styles.algorithmStatus}>{status}</span>
            </div>
          </div>
        )}
      </div>
    </aside>
  )
}
