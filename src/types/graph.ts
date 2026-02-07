export interface GraphNode {
  id: string
  label?: string
  x?: number
  y?: number
  color?: string
  data?: Record<string, unknown>
}

export interface GraphEdge {
  id: string
  source: string
  target: string
  weight?: number
  data?: Record<string, unknown>
}

export interface Graph {
  nodes: GraphNode[]
  edges: GraphEdge[]
  directed: boolean
  weighted: boolean
}

export function createEmptyGraph(): Graph {
  return {
    nodes: [],
    edges: [],
    directed: false,
    weighted: false,
  }
}

let nodeCounter = 0
export function generateNodeId(): string {
  return `n${Date.now()}-${++nodeCounter}-${Math.random().toString(36).slice(2, 7)}`
}

export function generateEdgeId(source: string, target: string): string {
  return `e-${source}-${target}`
}
