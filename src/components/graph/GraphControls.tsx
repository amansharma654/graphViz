import { useGraphStore } from '../../stores/graphStore'
import { useUIStore, EditMode } from '../../stores/uiStore'
import styles from './GraphControls.module.css'

export function GraphControls() {
  const graph = useGraphStore((state) => state.graph)
  const clear = useGraphStore((state) => state.clear)

  const editMode = useUIStore((state) => state.editMode)
  const setEditMode = useUIStore((state) => state.setEditMode)

  const handleModeChange = (mode: EditMode) => {
    setEditMode(mode === editMode ? 'select' : mode)
  }

  const handleGenerateRandom = () => {
    clear()
    const nodeCount = 8
    const nodeIds: string[] = []

    // Add nodes
    for (let i = 0; i < nodeCount; i++) {
      const angle = (2 * Math.PI * i) / nodeCount
      const radius = 200
      const id = useGraphStore.getState().addNode({
        label: String(i + 1),
        x: 300 + radius * Math.cos(angle),
        y: 300 + radius * Math.sin(angle),
      })
      nodeIds.push(id)
    }

    // Add random edges (probability 0.4)
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (Math.random() < 0.4) {
          useGraphStore.getState().addEdge(nodeIds[i], nodeIds[j])
        }
      }
    }
  }

  const handleGenerateComplete = () => {
    const k = parseInt(prompt('Enter k for complete graph K_k:', '5') || '0')
    if (k < 2 || k > 20) return

    clear()
    const nodeIds: string[] = []

    // Add nodes in a circle
    for (let i = 0; i < k; i++) {
      const angle = (2 * Math.PI * i) / k
      const radius = 150 + k * 10
      const id = useGraphStore.getState().addNode({
        label: String(i + 1),
        x: 300 + radius * Math.cos(angle),
        y: 300 + radius * Math.sin(angle),
      })
      nodeIds.push(id)
    }

    // Connect all pairs
    for (let i = 0; i < k; i++) {
      for (let j = i + 1; j < k; j++) {
        useGraphStore.getState().addEdge(nodeIds[i], nodeIds[j])
      }
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Edit Mode</h3>
        <div className={styles.modeButtons}>
          <button
            className={`${styles.modeButton} ${editMode === 'select' ? styles.active : ''}`}
            onClick={() => handleModeChange('select')}
          >
            Select
          </button>
          <button
            className={`${styles.modeButton} ${editMode === 'addNode' ? styles.active : ''}`}
            onClick={() => handleModeChange('addNode')}
          >
            Add Node
          </button>
          <button
            className={`${styles.modeButton} ${editMode === 'addEdge' ? styles.active : ''}`}
            onClick={() => handleModeChange('addEdge')}
          >
            Add Edge
          </button>
          <button
            className={`${styles.modeButton} ${editMode === 'delete' ? styles.active : ''}`}
            onClick={() => handleModeChange('delete')}
          >
            Delete
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Generate</h3>
        <div className={styles.buttons}>
          <button className="btn-secondary" onClick={handleGenerateRandom}>
            Random Graph
          </button>
          <button className="btn-secondary" onClick={handleGenerateComplete}>
            Complete Graph
          </button>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Graph</h3>
        <div className={styles.stats}>
          <span>Nodes: {graph.nodes.length}</span>
          <span>Edges: {graph.edges.length}</span>
        </div>
        <button className="btn-secondary" onClick={clear}>
          Clear All
        </button>
      </div>
    </div>
  )
}
