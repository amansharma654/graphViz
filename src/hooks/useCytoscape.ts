import { useEffect, useRef, useCallback } from 'react'
import cytoscape, { Core, NodeSingular, EdgeSingular } from 'cytoscape'
import { useGraphStore } from '../stores/graphStore'
import { useAlgorithmStore } from '../stores/algorithmStore'
import { useUIStore } from '../stores/uiStore'
import type { Graph } from '../types/graph'

const COLORS = [
  '#E53935', '#43A047', '#1E88E5', '#FB8C00', '#8E24AA',
  '#00ACC1', '#D81B60', '#FFB300', '#546E7A', '#F06292',
]

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
      'text-valign': 'center',
      'text-halign': 'center',
      'color': '#ffffff',
      'font-size': '14px',
      'width': 50,
      'height': 50,
      'border-width': 2,
      'border-color': '#212121',
    },
  },
  {
    selector: 'node:selected',
    style: {
      'border-color': '#2196F3',
      'border-width': 4,
    },
  },
  {
    selector: 'node.highlighted',
    style: {
      'border-color': '#FFC107',
      'border-width': 4,
    },
  },
  {
    selector: 'edge',
    style: {
      'width': 3,
      'line-color': '#757575',
      'target-arrow-color': '#757575',
      'target-arrow-shape': 'none',
      'curve-style': 'bezier',
    },
  },
  {
    selector: 'edge:selected',
    style: {
      'line-color': '#2196F3',
      'width': 5,
    },
  },
  {
    selector: 'edge.highlighted',
    style: {
      'line-color': '#FFC107',
      'width': 5,
    },
  },
  {
    selector: 'edge[?directed]',
    style: {
      'target-arrow-shape': 'triangle',
    },
  },
]

interface UseCytoscapeOptions {
  onNodeClick?: (nodeId: string) => void
  onEdgeClick?: (edgeId: string) => void
  onCanvasClick?: (position: { x: number; y: number }) => void
  onNodeDrag?: (nodeId: string, position: { x: number; y: number }) => void
}

export function useCytoscape(
  containerRef: React.RefObject<HTMLDivElement | null>,
  options: UseCytoscapeOptions = {}
) {
  const cyRef = useRef<Core | null>(null)
  const graph = useGraphStore((state) => state.graph)
  const currentStep = useAlgorithmStore((state) => state.currentStep())
  const editMode = useUIStore((state) => state.editMode)

  // Keep callbacks in refs so cytoscape event handlers always call the latest version
  const optionsRef = useRef(options)
  optionsRef.current = options

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
    })

    cyRef.current = cy

    // Set up event handlers — use optionsRef so we always call the latest callbacks
    cy.on('tap', 'node', (evt) => {
      const node = evt.target as NodeSingular
      optionsRef.current.onNodeClick?.(node.id())
    })

    cy.on('tap', 'edge', (evt) => {
      const edge = evt.target as EdgeSingular
      optionsRef.current.onEdgeClick?.(edge.id())
    })

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        const pos = evt.position
        optionsRef.current.onCanvasClick?.(pos)
      }
    })

    cy.on('dragfree', 'node', (evt) => {
      const node = evt.target as NodeSingular
      const pos = node.position()
      optionsRef.current.onNodeDrag?.(node.id(), pos)
    })

    return () => {
      cy.destroy()
      cyRef.current = null
    }
  }, [containerRef])

  // Sync graph data to Cytoscape
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return

    cy.batch(() => {
      cy.elements().remove()
      cy.add(graphToCytoscapeElements(graph))

      // Apply layout if no positions defined
      const hasPositions = graph.nodes.some((n) => n.x !== undefined)
      if (!hasPositions && graph.nodes.length > 0) {
        cy.layout({
          name: 'cose',
          animate: false,
          randomize: true,
          nodeRepulsion: () => 8000,
          idealEdgeLength: () => 100,
        }).run()
      }

      // Set directed edge style if needed
      if (graph.directed) {
        cy.edges().addClass('directed')
      }
    })
  }, [graph])

  // Apply algorithm step styles
  useEffect(() => {
    const cy = cyRef.current
    if (!cy) return

    // Clear previous highlights
    cy.elements().removeClass('highlighted')
    cy.nodes().style({
      'background-color': '#424242',
      'border-color': '#212121',
      'border-width': 2,
    })
    cy.edges().style({
      'line-color': '#757575',
      'width': 3,
    })

    if (!currentStep) return

    cy.batch(() => {
      // Highlight nodes
      currentStep.highlightNodes.forEach((nodeId) => {
        cy.getElementById(nodeId).addClass('highlighted')
      })

      // Highlight edges
      currentStep.highlightEdges.forEach((edgeId) => {
        cy.getElementById(edgeId).addClass('highlighted')
      })

      // Apply custom node styles
      currentStep.nodeStyles.forEach((style, nodeId) => {
        const node = cy.getElementById(nodeId)
        if (node.length > 0) {
          if (style.backgroundColor) {
            node.style('background-color', style.backgroundColor)
          }
          if (style.borderColor) {
            node.style('border-color', style.borderColor)
          }
          if (style.borderWidth) {
            node.style('border-width', style.borderWidth)
          }
        }
      })

      // Apply custom edge styles
      currentStep.edgeStyles.forEach((style, edgeId) => {
        const edge = cy.getElementById(edgeId)
        if (edge.length > 0) {
          if (style.lineColor) {
            edge.style('line-color', style.lineColor)
          }
          if (style.lineWidth) {
            edge.style('width', style.lineWidth)
          }
        }
      })
    })
  }, [currentStep])

  // Update cursor based on edit mode
  useEffect(() => {
    const cy = cyRef.current
    if (!cy || !containerRef.current) return

    const container = containerRef.current
    switch (editMode) {
      case 'addNode':
        container.style.cursor = 'crosshair'
        break
      case 'addEdge':
        container.style.cursor = 'pointer'
        break
      case 'delete':
        container.style.cursor = 'not-allowed'
        break
      default:
        container.style.cursor = 'default'
    }
  }, [editMode, containerRef])

  const fit = useCallback(() => {
    cyRef.current?.fit(undefined, 50)
  }, [])

  const center = useCallback(() => {
    cyRef.current?.center()
  }, [])

  const zoom = useCallback((level: number) => {
    cyRef.current?.zoom(level)
  }, [])

  const applyColorPalette = useCallback((colors: Map<string, number>) => {
    const cy = cyRef.current
    if (!cy) return

    cy.batch(() => {
      colors.forEach((colorIndex, nodeId) => {
        const node = cy.getElementById(nodeId)
        if (node.length > 0) {
          node.style('background-color', COLORS[colorIndex % COLORS.length])
        }
      })
    })
  }, [])

  return {
    cy: cyRef.current,
    fit,
    center,
    zoom,
    applyColorPalette,
  }
}
