import { create } from 'zustand'
import type { Graph, GraphNode, GraphEdge } from '../types/graph'
import { createEmptyGraph, generateNodeId, generateEdgeId } from '../types/graph'

let labelCounter = 0

interface GraphStore {
  graph: Graph
  selectedNodes: string[]
  selectedEdges: string[]

  // Node actions
  addNode: (node?: Partial<GraphNode>) => string
  removeNode: (id: string) => void
  updateNode: (id: string, updates: Partial<GraphNode>) => void

  // Edge actions
  addEdge: (source: string, target: string, weight?: number) => string | null
  removeEdge: (id: string) => void
  updateEdge: (id: string, updates: Partial<GraphEdge>) => void

  // Selection
  selectNode: (id: string, addToSelection?: boolean) => void
  selectEdge: (id: string, addToSelection?: boolean) => void
  clearSelection: () => void

  // Graph operations
  loadGraph: (graph: Graph) => void
  clear: () => void
  setDirected: (directed: boolean) => void
  setWeighted: (weighted: boolean) => void

  // Helpers
  getNode: (id: string) => GraphNode | undefined
  getEdge: (id: string) => GraphEdge | undefined
  getAdjacentNodes: (nodeId: string) => string[]
  hasEdge: (source: string, target: string) => boolean
}

export const useGraphStore = create<GraphStore>((set, get) => ({
  graph: createEmptyGraph(),
  selectedNodes: [],
  selectedEdges: [],

  addNode: (node) => {
    const id = node?.id || generateNodeId()
    const newNode: GraphNode = {
      id,
      label: node?.label || String(++labelCounter),
      x: node?.x,
      y: node?.y,
      color: node?.color,
      data: node?.data || {},
    }

    set((state) => ({
      graph: {
        ...state.graph,
        nodes: [...state.graph.nodes, newNode],
      },
    }))

    return id
  },

  removeNode: (id) => {
    set((state) => ({
      graph: {
        ...state.graph,
        nodes: state.graph.nodes.filter((n) => n.id !== id),
        edges: state.graph.edges.filter(
          (e) => e.source !== id && e.target !== id
        ),
      },
      selectedNodes: state.selectedNodes.filter((n) => n !== id),
    }))
  },

  updateNode: (id, updates) => {
    set((state) => ({
      graph: {
        ...state.graph,
        nodes: state.graph.nodes.map((n) =>
          n.id === id ? { ...n, ...updates } : n
        ),
      },
    }))
  },

  addEdge: (source, target, weight) => {
    const { hasEdge } = get()

    // Don't add if source === target
    if (source === target) return null

    // Don't add duplicate edges
    if (hasEdge(source, target)) return null

    const id = generateEdgeId(source, target)
    const newEdge: GraphEdge = {
      id,
      source,
      target,
      weight: weight ?? 1,
      data: {},
    }

    set((state) => ({
      graph: {
        ...state.graph,
        edges: [...state.graph.edges, newEdge],
      },
    }))

    return id
  },

  removeEdge: (id) => {
    set((state) => ({
      graph: {
        ...state.graph,
        edges: state.graph.edges.filter((e) => e.id !== id),
      },
      selectedEdges: state.selectedEdges.filter((e) => e !== id),
    }))
  },

  updateEdge: (id, updates) => {
    set((state) => ({
      graph: {
        ...state.graph,
        edges: state.graph.edges.map((e) =>
          e.id === id ? { ...e, ...updates } : e
        ),
      },
    }))
  },

  selectNode: (id, addToSelection = false) => {
    set((state) => ({
      selectedNodes: addToSelection
        ? [...state.selectedNodes, id]
        : [id],
      selectedEdges: addToSelection ? state.selectedEdges : [],
    }))
  },

  selectEdge: (id, addToSelection = false) => {
    set((state) => ({
      selectedEdges: addToSelection
        ? [...state.selectedEdges, id]
        : [id],
      selectedNodes: addToSelection ? state.selectedNodes : [],
    }))
  },

  clearSelection: () => {
    set({ selectedNodes: [], selectedEdges: [] })
  },

  loadGraph: (graph) => {
    set({ graph, selectedNodes: [], selectedEdges: [] })
  },

  clear: () => {
    set({
      graph: createEmptyGraph(),
      selectedNodes: [],
      selectedEdges: [],
    })
  },

  setDirected: (directed) => {
    set((state) => ({
      graph: { ...state.graph, directed },
    }))
  },

  setWeighted: (weighted) => {
    set((state) => ({
      graph: { ...state.graph, weighted },
    }))
  },

  getNode: (id) => {
    return get().graph.nodes.find((n) => n.id === id)
  },

  getEdge: (id) => {
    return get().graph.edges.find((e) => e.id === id)
  },

  getAdjacentNodes: (nodeId) => {
    const { graph } = get()
    const adjacent: string[] = []

    for (const edge of graph.edges) {
      if (edge.source === nodeId) {
        adjacent.push(edge.target)
      }
      if (!graph.directed && edge.target === nodeId) {
        adjacent.push(edge.source)
      }
    }

    return [...new Set(adjacent)]
  },

  hasEdge: (source, target) => {
    const { graph } = get()
    return graph.edges.some(
      (e) =>
        (e.source === source && e.target === target) ||
        (!graph.directed && e.source === target && e.target === source)
    )
  },
}))
