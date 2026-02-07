import type { Graph } from '../../types/graph'
import type { AlgorithmRunner, AlgorithmStep, AlgorithmParams, AlgorithmResult, NodeStyle } from '../../types/algorithm'

const COLORS = [
  '#E53935', '#43A047', '#1E88E5', '#FB8C00', '#8E24AA',
  '#00ACC1', '#D81B60', '#FFB300', '#546E7A', '#F06292',
]

function buildAdjacencyMap(graph: Graph): Map<string, Set<string>> {
  const adj = new Map<string, Set<string>>()

  for (const node of graph.nodes) {
    adj.set(node.id, new Set())
  }

  for (const edge of graph.edges) {
    adj.get(edge.source)?.add(edge.target)
    if (!graph.directed) {
      adj.get(edge.target)?.add(edge.source)
    }
  }

  return adj
}

function getColorStyle(colorIndex: number): string {
  return COLORS[colorIndex % COLORS.length]
}

export const dsatur: AlgorithmRunner = {
  id: 'dsatur',
  name: 'DSATUR',
  category: 'coloring',
  description: 'Degree of Saturation - colors nodes by prioritizing those with most differently-colored neighbors',
  complexity: { time: 'O(n²)', space: 'O(n)' },

  *run(graph: Graph, params: AlgorithmParams): Generator<AlgorithmStep> {
    if (graph.nodes.length === 0) {
      return
    }

    const adj = buildAdjacencyMap(graph)
    const colors = new Map<string, number>() // nodeId -> colorIndex
    const saturation = new Map<string, number>() // nodeId -> saturation degree
    const degrees = new Map<string, number>() // nodeId -> degree

    // Initialize
    for (const node of graph.nodes) {
      colors.set(node.id, -1) // -1 means uncolored
      saturation.set(node.id, 0)
      degrees.set(node.id, adj.get(node.id)?.size || 0)
    }

    const uncolored = new Set(graph.nodes.map((n) => n.id))
    let stepNumber = 0
    let maxColorUsed = -1

    // Initial step
    yield {
      stepNumber: stepNumber++,
      description: 'Initialize: all nodes uncolored, saturation = 0',
      highlightNodes: [],
      highlightEdges: [],
      nodeStyles: new Map(),
      edgeStyles: new Map(),
      state: {
        phase: 'init',
        colors: Object.fromEntries(colors),
        saturation: Object.fromEntries(saturation),
      },
    }

    while (uncolored.size > 0) {
      // Find node with maximum saturation (tie-breaker: highest degree)
      let maxSatNode: string | null = null
      let maxSat = -1
      let maxDegree = -1

      for (const nodeId of uncolored) {
        const sat = saturation.get(nodeId) || 0
        const deg = degrees.get(nodeId) || 0

        if (sat > maxSat || (sat === maxSat && deg > maxDegree)) {
          maxSat = sat
          maxDegree = deg
          maxSatNode = nodeId
        }
      }

      if (!maxSatNode) break

      // Yield step: selecting node
      yield {
        stepNumber: stepNumber++,
        description: `Select node "${graph.nodes.find((n) => n.id === maxSatNode)?.label || maxSatNode}" (saturation: ${maxSat}, degree: ${maxDegree})`,
        highlightNodes: [maxSatNode],
        highlightEdges: [],
        nodeStyles: buildCurrentStyles(colors, maxSatNode),
        edgeStyles: new Map(),
        state: {
          phase: 'select',
          selectedNode: maxSatNode,
          saturation: maxSat,
          degree: maxDegree,
        },
      }

      // Find the lowest available color
      const neighborColors = new Set<number>()
      for (const neighborId of adj.get(maxSatNode) || []) {
        const c = colors.get(neighborId)
        if (c !== undefined && c >= 0) {
          neighborColors.add(c)
        }
      }

      let assignedColor = 0
      while (neighborColors.has(assignedColor)) {
        assignedColor++
      }

      // Check against max colors if specified
      if (params.maxColors && assignedColor >= params.maxColors) {
        yield {
          stepNumber: stepNumber++,
          description: `Failed: Cannot color with ${params.maxColors} colors`,
          highlightNodes: [maxSatNode],
          highlightEdges: [],
          nodeStyles: buildCurrentStyles(colors, maxSatNode),
          edgeStyles: new Map(),
          state: {
            phase: 'failed',
            reason: 'exceeded max colors',
          },
        }
        return
      }

      // Assign color
      colors.set(maxSatNode, assignedColor)
      uncolored.delete(maxSatNode)
      maxColorUsed = Math.max(maxColorUsed, assignedColor)

      // Update saturation of uncolored neighbors
      for (const neighborId of adj.get(maxSatNode) || []) {
        if (uncolored.has(neighborId)) {
          // Recalculate saturation as the number of distinct colors among colored neighbors
          const neighborNeighborColors = new Set<number>()
          for (const nnId of adj.get(neighborId) || []) {
            const c = colors.get(nnId)
            if (c !== undefined && c >= 0) {
              neighborNeighborColors.add(c)
            }
          }
          saturation.set(neighborId, neighborNeighborColors.size)
        }
      }

      // Yield step: assigned color
      yield {
        stepNumber: stepNumber++,
        description: `Assign color ${assignedColor + 1} to "${graph.nodes.find((n) => n.id === maxSatNode)?.label || maxSatNode}"`,
        highlightNodes: [maxSatNode],
        highlightEdges: [],
        nodeStyles: buildCurrentStyles(colors),
        edgeStyles: new Map(),
        state: {
          phase: 'assign',
          node: maxSatNode,
          color: assignedColor,
          colorsUsed: maxColorUsed + 1,
          remaining: uncolored.size,
        },
      }
    }

    // Final step
    yield {
      stepNumber: stepNumber++,
      description: `Complete! Graph colored with ${maxColorUsed + 1} colors`,
      highlightNodes: [],
      highlightEdges: [],
      nodeStyles: buildCurrentStyles(colors),
      edgeStyles: new Map(),
      state: {
        phase: 'complete',
        colorsUsed: maxColorUsed + 1,
        colors: Object.fromEntries(colors),
      },
    }
  },

  execute(graph: Graph, params: AlgorithmParams): AlgorithmResult {
    const steps: AlgorithmStep[] = []
    for (const step of this.run(graph, params)) {
      steps.push(step)
    }

    const lastStep = steps[steps.length - 1]
    const success = lastStep?.state?.phase !== 'failed'

    return {
      success,
      steps,
      finalState: lastStep?.state || {},
      message: lastStep?.description || 'No steps generated',
    }
  },
}

function buildCurrentStyles(
  colors: Map<string, number>,
  highlightNode?: string
): Map<string, NodeStyle> {
  const styles = new Map<string, NodeStyle>()

  for (const [nodeId, colorIndex] of colors) {
    if (colorIndex >= 0) {
      styles.set(nodeId, {
        backgroundColor: getColorStyle(colorIndex),
      })
    }
  }

  if (highlightNode) {
    const existing = styles.get(highlightNode) || {}
    styles.set(highlightNode, {
      ...existing,
      borderColor: '#FFC107',
      borderWidth: 4,
    })
  }

  return styles
}
