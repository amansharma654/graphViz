import { useRef, useCallback } from 'react'
import { useCytoscape } from '../../hooks/useCytoscape'
import { useGraphStore } from '../../stores/graphStore'
import { useUIStore } from '../../stores/uiStore'
import { AlgorithmResult } from '../algorithm/AlgorithmResult'
import styles from './GraphCanvas.module.css'

export function GraphCanvas() {
  const containerRef = useRef<HTMLDivElement>(null)

  const addNode = useGraphStore((state) => state.addNode)
  const addEdge = useGraphStore((state) => state.addEdge)
  const removeNode = useGraphStore((state) => state.removeNode)
  const removeEdge = useGraphStore((state) => state.removeEdge)
  const updateNode = useGraphStore((state) => state.updateNode)
  const selectNode = useGraphStore((state) => state.selectNode)
  const selectEdge = useGraphStore((state) => state.selectEdge)
  const clearSelection = useGraphStore((state) => state.clearSelection)

  const editMode = useUIStore((state) => state.editMode)
  const edgeSourceNode = useUIStore((state) => state.edgeSourceNode)
  const setEdgeSourceNode = useUIStore((state) => state.setEdgeSourceNode)

  const handleNodeClick = useCallback(
    (nodeId: string) => {
      switch (editMode) {
        case 'select':
          selectNode(nodeId)
          break
        case 'delete':
          removeNode(nodeId)
          break
        case 'addEdge':
          if (!edgeSourceNode) {
            setEdgeSourceNode(nodeId)
          } else if (edgeSourceNode !== nodeId) {
            addEdge(edgeSourceNode, nodeId)
            setEdgeSourceNode(null)
          }
          break
      }
    },
    [editMode, edgeSourceNode, selectNode, removeNode, addEdge, setEdgeSourceNode]
  )

  const handleEdgeClick = useCallback(
    (edgeId: string) => {
      switch (editMode) {
        case 'select':
          selectEdge(edgeId)
          break
        case 'delete':
          removeEdge(edgeId)
          break
      }
    },
    [editMode, selectEdge, removeEdge]
  )

  const handleCanvasClick = useCallback(
    (position: { x: number; y: number }) => {
      switch (editMode) {
        case 'select':
          clearSelection()
          break
        case 'addNode':
          addNode({ x: position.x, y: position.y })
          break
        case 'addEdge':
          // Cancel edge creation if clicking on empty space
          setEdgeSourceNode(null)
          break
      }
    },
    [editMode, clearSelection, addNode, setEdgeSourceNode]
  )

  const handleNodeDrag = useCallback(
    (nodeId: string, position: { x: number; y: number }) => {
      updateNode(nodeId, { x: position.x, y: position.y })
    },
    [updateNode]
  )

  const { fit, center } = useCytoscape(containerRef, {
    onNodeClick: handleNodeClick,
    onEdgeClick: handleEdgeClick,
    onCanvasClick: handleCanvasClick,
    onNodeDrag: handleNodeDrag,
  })

  return (
    <div className={styles.container}>
      <div ref={containerRef} className={styles.canvas} />
      <AlgorithmResult />
      <div className={styles.controls}>
        <button onClick={fit} className="btn-secondary" title="Fit to view">
          Fit
        </button>
        <button onClick={center} className="btn-secondary" title="Center view">
          Center
        </button>
      </div>
      {editMode === 'addEdge' && edgeSourceNode && (
        <div className={styles.hint}>
          Click another node to create edge, or click canvas to cancel
        </div>
      )}
    </div>
  )
}
