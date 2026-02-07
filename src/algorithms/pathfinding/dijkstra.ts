import type { Graph } from '../../types/graph'
import type { AlgorithmRunner, AlgorithmStep, AlgorithmParams, AlgorithmResult, NodeStyle, EdgeStyle } from '../../types/algorithm'

interface AdjEntry {
  nodeId: string
  edgeId: string
  weight: number
}

function buildWeightedAdjacency(graph: Graph): Map<string, AdjEntry[]> {
  const adj = new Map<string, AdjEntry[]>()

  for (const node of graph.nodes) {
    adj.set(node.id, [])
  }

  for (const edge of graph.edges) {
    adj.get(edge.source)?.push({
      nodeId: edge.target,
      edgeId: edge.id,
      weight: edge.weight ?? 1,
    })
    if (!graph.directed) {
      adj.get(edge.target)?.push({
        nodeId: edge.source,
        edgeId: edge.id,
        weight: edge.weight ?? 1,
      })
    }
  }

  return adj
}

function reconstructPath(
  prev: Map<string, { node: string; edge: string } | null>,
  endNode: string
): { nodes: string[]; edges: string[] } {
  const nodes: string[] = []
  const edges: string[] = []
  let current: string | undefined = endNode

  while (current) {
    nodes.unshift(current)
    const entry = prev.get(current)
    if (entry) {
      edges.unshift(entry.edge)
      current = entry.node
    } else {
      break
    }
  }

  return { nodes, edges }
}

export const dijkstra: AlgorithmRunner = {
  id: 'dijkstra',
  name: "Dijkstra's",
  category: 'pathfinding',
  description: "Finds the shortest path between two nodes using Dijkstra's algorithm with a priority queue",
  complexity: { time: 'O((V+E) log V)', space: 'O(V)' },

  *run(graph: Graph, params: AlgorithmParams): Generator<AlgorithmStep> {
    const { startNode, endNode } = params
    if (!startNode || !endNode) return
    if (graph.nodes.length === 0) return

    const adj = buildWeightedAdjacency(graph)
    const dist = new Map<string, number>()
    const prev = new Map<string, { node: string; edge: string } | null>()
    const visited = new Set<string>()
    let stepNumber = 0

    // Initialize
    for (const node of graph.nodes) {
      dist.set(node.id, node.id === startNode ? 0 : Infinity)
      prev.set(node.id, null)
    }

    const nodeStyles = new Map<string, NodeStyle>()
    nodeStyles.set(startNode, { backgroundColor: '#4CAF50', borderColor: '#388E3C', borderWidth: 4 })
    nodeStyles.set(endNode, { backgroundColor: '#F44336', borderColor: '#D32F2F', borderWidth: 4 })

    yield {
      stepNumber: stepNumber++,
      description: `Initialize: set distance of start node to 0, all others to infinity`,
      highlightNodes: [startNode, endNode],
      highlightEdges: [],
      nodeStyles: new Map(nodeStyles),
      edgeStyles: new Map(),
      state: {
        phase: 'init',
        distances: Object.fromEntries(dist),
      },
    }

    while (true) {
      // Find unvisited node with minimum distance
      let minNode: string | null = null
      let minDist = Infinity

      for (const [nodeId, d] of dist) {
        if (!visited.has(nodeId) && d < minDist) {
          minDist = d
          minNode = nodeId
        }
      }

      if (minNode === null || minDist === Infinity) break

      // Highlight current node being processed
      const currentStyles = new Map<string, NodeStyle>()
      for (const v of visited) {
        currentStyles.set(v, { backgroundColor: '#42A5F5', borderColor: '#1E88E5', borderWidth: 2 })
      }
      currentStyles.set(startNode, { backgroundColor: '#4CAF50', borderColor: '#388E3C', borderWidth: 4 })
      currentStyles.set(endNode, { backgroundColor: '#F44336', borderColor: '#D32F2F', borderWidth: 4 })
      currentStyles.set(minNode, { backgroundColor: '#FFC107', borderColor: '#F57F17', borderWidth: 4 })

      const label = graph.nodes.find((n) => n.id === minNode)?.label || minNode

      yield {
        stepNumber: stepNumber++,
        description: `Select node "${label}" with distance ${minDist}`,
        highlightNodes: [minNode],
        highlightEdges: [],
        nodeStyles: currentStyles,
        edgeStyles: new Map(),
        state: {
          phase: 'select',
          currentNode: minNode,
          currentDistance: minDist,
          distances: Object.fromEntries(dist),
        },
      }

      if (minNode === endNode) {
        // Found shortest path
        visited.add(minNode)
        break
      }

      visited.add(minNode)

      // Relax neighbors
      const neighbors = adj.get(minNode) || []
      const relaxedEdges: string[] = []

      for (const { nodeId: neighbor, edgeId, weight } of neighbors) {
        if (visited.has(neighbor)) continue

        const newDist = minDist + weight
        const oldDist = dist.get(neighbor) ?? Infinity

        if (newDist < oldDist) {
          dist.set(neighbor, newDist)
          prev.set(neighbor, { node: minNode, edge: edgeId })
          relaxedEdges.push(edgeId)
        }
      }

      if (relaxedEdges.length > 0) {
        const relaxStyles = new Map<string, NodeStyle>()
        for (const v of visited) {
          relaxStyles.set(v, { backgroundColor: '#42A5F5', borderColor: '#1E88E5', borderWidth: 2 })
        }
        relaxStyles.set(startNode, { backgroundColor: '#4CAF50', borderColor: '#388E3C', borderWidth: 4 })
        relaxStyles.set(endNode, { backgroundColor: '#F44336', borderColor: '#D32F2F', borderWidth: 4 })
        relaxStyles.set(minNode, { backgroundColor: '#FFC107', borderColor: '#F57F17', borderWidth: 4 })

        const edgeStyles = new Map<string, EdgeStyle>()
        for (const eId of relaxedEdges) {
          edgeStyles.set(eId, { lineColor: '#FFC107', lineWidth: 5 })
        }

        yield {
          stepNumber: stepNumber++,
          description: `Relax ${relaxedEdges.length} neighbor(s) of "${label}"`,
          highlightNodes: [minNode],
          highlightEdges: relaxedEdges,
          nodeStyles: relaxStyles,
          edgeStyles,
          state: {
            phase: 'relax',
            currentNode: minNode,
            relaxedCount: relaxedEdges.length,
            distances: Object.fromEntries(dist),
          },
        }
      }
    }

    // Path reconstruction
    const endDist = dist.get(endNode) ?? Infinity
    if (endDist === Infinity) {
      yield {
        stepNumber: stepNumber++,
        description: `No path found from start to end node`,
        highlightNodes: [startNode, endNode],
        highlightEdges: [],
        nodeStyles: new Map([
          [startNode, { backgroundColor: '#4CAF50', borderColor: '#388E3C', borderWidth: 4 }],
          [endNode, { backgroundColor: '#F44336', borderColor: '#D32F2F', borderWidth: 4 }],
        ]),
        edgeStyles: new Map(),
        state: { phase: 'complete', found: false },
      }
      return
    }

    const path = reconstructPath(prev, endNode)

    const finalNodeStyles = new Map<string, NodeStyle>()
    for (const v of visited) {
      finalNodeStyles.set(v, { backgroundColor: '#42A5F5', borderColor: '#1E88E5', borderWidth: 2 })
    }
    for (const n of path.nodes) {
      finalNodeStyles.set(n, { backgroundColor: '#4CAF50', borderColor: '#2E7D32', borderWidth: 4 })
    }
    finalNodeStyles.set(startNode, { backgroundColor: '#4CAF50', borderColor: '#1B5E20', borderWidth: 4 })
    finalNodeStyles.set(endNode, { backgroundColor: '#F44336', borderColor: '#B71C1C', borderWidth: 4 })

    const finalEdgeStyles = new Map<string, EdgeStyle>()
    for (const e of path.edges) {
      finalEdgeStyles.set(e, { lineColor: '#4CAF50', lineWidth: 6 })
    }

    yield {
      stepNumber: stepNumber++,
      description: `Shortest path found! Distance: ${endDist}, Path length: ${path.nodes.length} nodes`,
      highlightNodes: path.nodes,
      highlightEdges: path.edges,
      nodeStyles: finalNodeStyles,
      edgeStyles: finalEdgeStyles,
      state: {
        phase: 'complete',
        found: true,
        distance: endDist,
        pathLength: path.nodes.length,
        path: path.nodes,
        nodesVisited: visited.size,
      },
    }
  },

  execute(graph: Graph, params: AlgorithmParams): AlgorithmResult {
    const steps: AlgorithmStep[] = []
    for (const step of this.run(graph, params)) {
      steps.push(step)
    }

    const lastStep = steps[steps.length - 1]
    const success = lastStep?.state?.found === true

    return {
      success,
      steps,
      finalState: lastStep?.state || {},
      message: lastStep?.description || 'No steps generated',
    }
  },
}
