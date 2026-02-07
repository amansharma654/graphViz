import type { Graph } from './graph'

export interface NodeStyle {
  backgroundColor?: string
  borderColor?: string
  borderWidth?: number
  label?: string
}

export interface EdgeStyle {
  lineColor?: string
  lineWidth?: number
  lineStyle?: 'solid' | 'dashed' | 'dotted'
}

export interface AlgorithmStep {
  stepNumber: number
  description: string
  highlightNodes: string[]
  highlightEdges: string[]
  nodeStyles: Map<string, NodeStyle>
  edgeStyles: Map<string, EdgeStyle>
  state: Record<string, unknown>
}

export type AlgorithmCategory = 'coloring' | 'pathfinding' | 'traversal' | 'mst'

export interface AlgorithmParams {
  startNode?: string
  endNode?: string
  maxColors?: number
  [key: string]: unknown
}

export interface AlgorithmResult {
  success: boolean
  steps: AlgorithmStep[]
  finalState: Record<string, unknown>
  message: string
}

export interface AlgorithmRunner {
  id: string
  name: string
  category: AlgorithmCategory
  description: string
  complexity: { time: string; space: string }

  run(graph: Graph, params: AlgorithmParams): Generator<AlgorithmStep>

  execute(graph: Graph, params: AlgorithmParams): AlgorithmResult
}
