import { useState } from 'react'
import { getCategories } from '../../algorithms'
import { useAlgorithmStore } from '../../stores/algorithmStore'
import { useGraphStore } from '../../stores/graphStore'
import { useUIStore } from '../../stores/uiStore'
import { useAlgorithmRunner } from '../../hooks/useAlgorithmRunner'
import type { AlgorithmRunner, AlgorithmParams } from '../../types/algorithm'
import styles from './AlgorithmPicker.module.css'

function CloseIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="5" y1="5" x2="15" y2="15" />
      <line x1="15" y1="5" x2="5" y2="15" />
    </svg>
  )
}

function BackIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M10 3L5 8l5 5" />
    </svg>
  )
}

type ColoringMode = 'minimum' | 'k-coloring'

export function AlgorithmPicker() {
  const isOpen = useUIStore((state) => state.algorithmPickerOpen)
  const setOpen = useUIStore((state) => state.setAlgorithmPickerOpen)
  const selectAlgorithm = useAlgorithmStore((state) => state.selectAlgorithm)
  const graph = useGraphStore((state) => state.graph)
  const { runAlgorithm } = useAlgorithmRunner()

  const [selectedAlgorithm, setSelectedAlgorithm] = useState<AlgorithmRunner | null>(null)
  const [coloringMode, setColoringMode] = useState<ColoringMode>('minimum')
  const [kValue, setKValue] = useState(3)
  const [startNode, setStartNode] = useState('')
  const [endNode, setEndNode] = useState('')

  const categories = getCategories()

  const handleSelectAlgorithm = (algorithm: AlgorithmRunner) => {
    if (algorithm.category === 'coloring' || algorithm.category === 'pathfinding') {
      setSelectedAlgorithm(algorithm)
    } else {
      selectAlgorithm(algorithm)
      runAlgorithm(algorithm)
      handleClose()
    }
  }

  const handleRunColoring = () => {
    if (!selectedAlgorithm) return

    const params: AlgorithmParams = {}
    if (coloringMode === 'k-coloring') {
      params.maxColors = kValue
    }

    selectAlgorithm(selectedAlgorithm)
    runAlgorithm(selectedAlgorithm, params)
    handleClose()
  }

  const handleRunPathfinding = () => {
    if (!selectedAlgorithm || !startNode || !endNode || startNode === endNode) return

    const params: AlgorithmParams = { startNode, endNode }
    selectAlgorithm(selectedAlgorithm)
    runAlgorithm(selectedAlgorithm, params)
    handleClose()
  }

  const handleBack = () => {
    setSelectedAlgorithm(null)
  }

  const handleClose = () => {
    setOpen(false)
    setSelectedAlgorithm(null)
    setColoringMode('minimum')
    setKValue(3)
    setStartNode('')
    setEndNode('')
  }

  if (!isOpen) return null

  const canRunPathfinding = startNode && endNode && startNode !== endNode

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          {selectedAlgorithm ? (
            <>
              <button className={styles.backButton} onClick={handleBack} aria-label="Back">
                <BackIcon />
              </button>
              <h2>{selectedAlgorithm.name}</h2>
            </>
          ) : (
            <h2>Select Algorithm</h2>
          )}
          <button className={styles.closeButton} onClick={handleClose} aria-label="Close">
            <CloseIcon />
          </button>
        </div>

        <div className={styles.content}>
          {selectedAlgorithm?.category === 'coloring' ? (
            // Coloring options
            <div className={styles.coloringOptions}>
              <p className={styles.algorithmDescription}>{selectedAlgorithm.description}</p>

              <div className={styles.optionSection}>
                <h3 className={styles.optionTitle}>Coloring Mode</h3>

                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="coloringMode"
                    value="minimum"
                    checked={coloringMode === 'minimum'}
                    onChange={() => setColoringMode('minimum')}
                  />
                  <div className={styles.radioContent}>
                    <span className={styles.radioLabel}>Minimum Coloring</span>
                    <span className={styles.radioDescription}>
                      Find the minimum number of colors needed (chromatic number)
                    </span>
                  </div>
                </label>

                <label className={styles.radioOption}>
                  <input
                    type="radio"
                    name="coloringMode"
                    value="k-coloring"
                    checked={coloringMode === 'k-coloring'}
                    onChange={() => setColoringMode('k-coloring')}
                  />
                  <div className={styles.radioContent}>
                    <span className={styles.radioLabel}>k-Coloring</span>
                    <span className={styles.radioDescription}>
                      Try to color the graph with exactly k colors
                    </span>
                  </div>
                </label>

                {coloringMode === 'k-coloring' && (
                  <div className={styles.kInput}>
                    <label htmlFor="kValue">Number of colors (k):</label>
                    <input
                      id="kValue"
                      type="number"
                      min={1}
                      max={10}
                      value={kValue}
                      onChange={(e) => setKValue(Math.max(1, Math.min(10, parseInt(e.target.value) || 1)))}
                    />
                  </div>
                )}
              </div>

              <button className={styles.runButton} onClick={handleRunColoring}>
                Run {selectedAlgorithm.name}
              </button>
            </div>
          ) : selectedAlgorithm?.category === 'pathfinding' ? (
            // Pathfinding options
            <div className={styles.coloringOptions}>
              <p className={styles.algorithmDescription}>{selectedAlgorithm.description}</p>

              <div className={styles.optionSection}>
                <h3 className={styles.optionTitle}>Start & End Nodes</h3>

                <div className={styles.nodeSelect}>
                  <label htmlFor="startNode">Start Node</label>
                  <select
                    id="startNode"
                    value={startNode}
                    onChange={(e) => setStartNode(e.target.value)}
                  >
                    <option value="">Select start node...</option>
                    {graph.nodes.map((node) => (
                      <option key={node.id} value={node.id} disabled={node.id === endNode}>
                        {node.label || node.id}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.nodeSelect}>
                  <label htmlFor="endNode">End Node</label>
                  <select
                    id="endNode"
                    value={endNode}
                    onChange={(e) => setEndNode(e.target.value)}
                  >
                    <option value="">Select end node...</option>
                    {graph.nodes.map((node) => (
                      <option key={node.id} value={node.id} disabled={node.id === startNode}>
                        {node.label || node.id}
                      </option>
                    ))}
                  </select>
                </div>

                {graph.nodes.length < 2 && (
                  <p className={styles.radioDescription}>
                    Add at least 2 nodes to the graph to use pathfinding.
                  </p>
                )}
              </div>

              <button
                className={styles.runButton}
                onClick={handleRunPathfinding}
                disabled={!canRunPathfinding}
                style={{ opacity: canRunPathfinding ? 1 : 0.5 }}
              >
                Run {selectedAlgorithm.name}
              </button>
            </div>
          ) : (
            // Algorithm list
            <>
              {categories.map((category) => (
                <div key={category.category} className={styles.category}>
                  <h3 className={styles.categoryTitle}>{category.name}</h3>
                  <div className={styles.algorithms}>
                    {category.algorithms.map((algorithm) => (
                      <button
                        key={algorithm.id}
                        className={styles.algorithmCard}
                        onClick={() => handleSelectAlgorithm(algorithm)}
                      >
                        <div className={styles.algorithmName}>{algorithm.name}</div>
                        <div className={styles.algorithmDescription}>
                          {algorithm.description}
                        </div>
                        <div className={styles.algorithmComplexity}>
                          Time: {algorithm.complexity.time} | Space:{' '}
                          {algorithm.complexity.space}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              {categories.length === 0 && (
                <div className={styles.empty}>
                  No algorithms available yet. More coming soon!
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
