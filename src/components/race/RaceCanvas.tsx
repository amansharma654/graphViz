import { useEffect, useRef } from 'react'
import cytoscape, { Core } from 'cytoscape'
import { useGraphStore } from '../../stores/graphStore'
import type { AlgorithmStep } from '../../types/algorithm'
import type { Graph } from '../../types/graph'

function graphToCytoscapeElements(graph: Graph) {
  const nodes = graph.nodes.map((node) => ({
    data: {
      id: node.id,
      label: node.label || node.id,
    },
    position: node.x !== undefined && node.y !== undefined
      ? { x: node.x, y: node.y }
      : undefined,
  }))

  const edges = graph.edges.map((edge) => ({
    data: {
      id: edge.id,
      source: edge.source,
      target: edge.target,
      weight: edge.weight,
    },
  }))

  return [...nodes, ...edges]
}

const defaultStyle = [
  {
    selector: 'node',
    style: {
      'background-color': '#424242',
      'label': 'data(label)',
      'text-valign': 'center' as const,
      'text-halign': 'center' as const,
      'color': '#ffffff',
      'font-size': '12px',
      'width': 40,
      'height': 40,
      'border-width': 2,
      'border-color': '#212121',
    },
  },
  {
    selector: 'edge',
    style: {
      'width': 2,
      'line-color': '#757575',
      'target-arrow-color': '#757575',
      'target-arrow-shape': 'none' as const,
      'curve-style': 'bezier' as const,
    },
  },
]

interface RaceCanvasProps {
  step: AlgorithmStep | null
  label: string
}

export function RaceCanvas({ step, label }: RaceCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const cyRef = useRef<Core | null>(null)
  const graph = useGraphStore((state) => state.graph)

  // Initialize Cytoscape
  useEffect(() => {
    if (!containerRef.current || cyRef.current) return

    const cy = cytoscape({
      container: containerRef.current,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      style: defaultStyle as any,
      layout: { name: 'preset' },
      minZoom: 0.2,
      maxZoom: 3,
      wheelSensitivity: 0.3,
      userPanningEnabled: true,
      userZoomingEnabled: true,
      boxSelectionEnabled: false,
      autoungrabify: true,
    })

    cyRef.current = cy

    return () => {
      cy.destroy()
      cyRef.current = null
    }
  }, [])

  // Sync graph
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return

    cy.batch(() => {
      cy.elements().remove()
      cy.add(graphToCytoscapeElements(graph))

      const hasPositions = graph.nodes.some((n) => n.x !== undefined)
      if (!hasPositions && graph.nodes.length > 0) {
        cy.layout({
          name: 'cose',
          animate: false,
          randomize: true,
          nodeRepulsion: () => 8000,
          idealEdgeLength: () => 80,
        }).run()
      }
    })

    cy.fit(undefined, 20)
  }, [graph])

  // Apply step styles
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return

    // Reset styles
    cy.nodes().style({
      'background-color': '#424242',
      'border-color': '#212121',
      'border-width': 2,
    })
    cy.edges().style({
      'line-color': '#757575',
      'width': 2,
    })

    if (!step) return

    cy.batch(() => {
      step.nodeStyles.forEach((style, nodeId) => {
        const node = cy.getElementById(nodeId)
        if (node.length > 0) {
          if (style.backgroundColor) node.style('background-color', style.backgroundColor)
          if (style.borderColor) node.style('border-color', style.borderColor)
          if (style.borderWidth) node.style('border-width', style.borderWidth)
        }
      })

      step.edgeStyles.forEach((style, edgeId) => {
        const edge = cy.getElementById(edgeId)
        if (edge.length > 0) {
          if (style.lineColor) edge.style('line-color', style.lineColor)
          if (style.lineWidth) edge.style('width', style.lineWidth)
        }
      })
    })
  }, [step])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
      <div style={{
        padding: '8px 12px',
        fontFamily: 'var(--font-mono)',
        fontSize: '13px',
        fontWeight: 600,
        color: 'var(--text-secondary)',
        borderBottom: '1px solid var(--border-color)',
        textTransform: 'uppercase',
        letterSpacing: '0.05em',
      }}>
        {label}
      </div>
      <div
        ref={containerRef}
        style={{
          flex: 1,
          minHeight: 300,
          backgroundColor: 'var(--bg-primary)',
        }}
      />
      {step && (
        <div style={{
          padding: '8px 12px',
          fontFamily: 'var(--font-mono)',
          fontSize: '12px',
          color: 'var(--text-secondary)',
          borderTop: '1px solid var(--border-color)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}>
          Step {step.stepNumber + 1}: {step.description}
        </div>
      )}
    </div>
  )
}
