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

function euclideanDistance(
  graph: Graph,
  nodeA: string,
  nodeB: string
): number {
  const a = graph.nodes.find((n) => n.id === nodeA)
  const b = graph.nodes.find((n) => n.id === nodeB)

  if (!a || !b || a.x === undefined || a.y === undefined || b.x === undefined || b.y === undefined) {
    return 0
  }

  const dx = a.x - b.x
  const dy = a.y - b.y
  return Math.sqrt(dx * dx + dy * dy) / 100 // Scale down for reasonable heuristic values
}

function reconstructPath(
  cameFrom: Map<string, { node: string; edge: string } | null>,
  endNode: string
): { nodes: string[]; edges: string[] } {
  const nodes: string[] = []
  const edges: string[] = []
  let current: string | undefined = endNode

  while (current) {
    nodes.unshift(current)
    const entry = cameFrom.get(current)
    if (entry) {
      edges.unshift(entry.edge)
      current = entry.node
    } else {
      break
    }
  }

  return { nodes, edges }
}

export const astar: AlgorithmRunner = {
  id: 'astar',
  name: 'A*',
  category: 'pathfinding',
  description: 'A* search uses a heuristic (Euclidean distance) to guide pathfinding, often visiting fewer nodes than Dijkstra',
  complexity: { time: 'O((V+E) log V)', space: 'O(V)' },

  *run(graph: Graph, params: AlgorithmParams): Generator<AlgorithmStep> {
    const { startNode, endNode } = params
    if (!startNode || !endNode) return
    if (graph.nodes.length === 0) return

    const adj = buildWeightedAdjacency(graph)

    const gScore = new Map<string, number>() // actual cost from start
    const fScore = new Map<string, number>() // g + heuristic
    const cameFrom = new Map<string, { node: string; edge: string } | null>()
    const openSet = new Set<string>()
    const closedSet = new Set<string>()
    let stepNumber = 0

    // Initialize
    for (const node of graph.nodes) {
      gScore.set(node.id, Infinity)
      fScore.set(node.id, Infinity)
      cameFrom.set(node.id, null)
    }

    gScore.set(startNode, 0)
    const startH = euclideanDistance(graph, startNode, endNode)
    fScore.set(startNode, startH)
    openSet.add(startNode)

    const nodeStyles = new Map<string, NodeStyle>()
    nodeStyles.set(startNode, { backgroundColor: '#4CAF50', borderColor: '#388E3C', borderWidth: 4 })
    nodeStyles.set(endNode, { backgroundColor: '#F44336', borderColor: '#D32F2F', borderWidth: 4 })

    yield {
      stepNumber: stepNumber++,
      description: `Initialize: start node g=0, h=${startH.toFixed(1)}, f=${startH.toFixed(1)}`,
      highlightNodes: [startNode, endNode],
      highlightEdges: [],
      nodeStyles: new Map(nodeStyles),
      edgeStyles: new Map(),
      state: {
        phase: 'init',
        openSetSize: 1,
        closedSetSize: 0,
      },
    }

    while (openSet.size > 0) {
      // Find node in open set with lowest fScore
      let current: string | null = null
      let bestF = Infinity

      for (const nodeId of openSet) {
        const f = fScore.get(nodeId) ?? Infinity
        if (f < bestF) {
          bestF = f
          current = nodeId
        }
      }

      if (current === null) break

      const currentG = gScore.get(current) ?? Infinity
      const currentH = bestF - currentG
      const label = graph.nodes.find((n) => n.id === current)?.label || current

      // Build styles showing open/closed sets
      const selectStyles = new Map<string, NodeStyle>()
      for (const c of closedSet) {
        selectStyles.set(c, { backgroundColor: '#42A5F5', borderColor: '#1E88E5', borderWidth: 2 })
      }
      for (const o of openSet) {
        if (o !== current) {
          selectStyles.set(o, { backgroundColor: '#CE93D8', borderColor: '#8E24AA', borderWidth: 2 })
        }
      }
      selectStyles.set(startNode, { backgroundColor: '#4CAF50', borderColor: '#388E3C', borderWidth: 4 })
      selectStyles.set(endNode, { backgroundColor: '#F44336', borderColor: '#D32F2F', borderWidth: 4 })
      selectStyles.set(current, { backgroundColor: '#FFC107', borderColor: '#F57F17', borderWidth: 4 })

      yield {
        stepNumber: stepNumber++,
        description: `Select "${label}" — g=${currentG.toFixed(1)}, h=${currentH.toFixed(1)}, f=${bestF.toFixed(1)}`,
        highlightNodes: [current],
        highlightEdges: [],
        nodeStyles: selectStyles,
        edgeStyles: new Map(),
        state: {
          phase: 'select',
          currentNode: current,
          g: currentG,
          h: currentH,
          f: bestF,
          openSetSize: openSet.size,
          closedSetSize: closedSet.size,
        },
      }

      if (current === endNode) {
        // Found the goal
        closedSet.add(current)
        openSet.delete(current)
        break
      }

      openSet.delete(current)
      closedSet.add(current)

      // Explore neighbors
      const neighbors = adj.get(current) || []
      const relaxedEdges: string[] = []

      for (const { nodeId: neighbor, edgeId, weight } of neighbors) {
        if (closedSet.has(neighbor)) continue

        const tentativeG = currentG + weight

        if (tentativeG < (gScore.get(neighbor) ?? Infinity)) {
          cameFrom.set(neighbor, { node: current, edge: edgeId })
          gScore.set(neighbor, tentativeG)
          const h = euclideanDistance(graph, neighbor, endNode)
          fScore.set(neighbor, tentativeG + h)
          openSet.add(neighbor)
          relaxedEdges.push(edgeId)
        }
      }

      if (relaxedEdges.length > 0) {
        const relaxStyles = new Map<string, NodeStyle>()
        for (const c of closedSet) {
          relaxStyles.set(c, { backgroundColor: '#42A5F5', borderColor: '#1E88E5', borderWidth: 2 })
        }
        for (const o of openSet) {
          relaxStyles.set(o, { backgroundColor: '#CE93D8', borderColor: '#8E24AA', borderWidth: 2 })
        }
        relaxStyles.set(startNode, { backgroundColor: '#4CAF50', borderColor: '#388E3C', borderWidth: 4 })
        relaxStyles.set(endNode, { backgroundColor: '#F44336', borderColor: '#D32F2F', borderWidth: 4 })
        relaxStyles.set(current, { backgroundColor: '#FFC107', borderColor: '#F57F17', borderWidth: 4 })

        const edgeStyles = new Map<string, EdgeStyle>()
        for (const eId of relaxedEdges) {
          edgeStyles.set(eId, { lineColor: '#CE93D8', lineWidth: 5 })
        }

        yield {
          stepNumber: stepNumber++,
          description: `Explore ${relaxedEdges.length} neighbor(s) of "${label}"`,
          highlightNodes: [current],
          highlightEdges: relaxedEdges,
          nodeStyles: relaxStyles,
          edgeStyles,
          state: {
            phase: 'explore',
            currentNode: current,
            neighborsExplored: relaxedEdges.length,
            openSetSize: openSet.size,
            closedSetSize: closedSet.size,
          },
        }
      }
    }

    // Path reconstruction
    const endG = gScore.get(endNode) ?? Infinity
    if (endG === Infinity) {
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

    const path = reconstructPath(cameFrom, endNode)

    const finalNodeStyles = new Map<string, NodeStyle>()
    for (const c of closedSet) {
      finalNodeStyles.set(c, { backgroundColor: '#42A5F5', borderColor: '#1E88E5', borderWidth: 2 })
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
      description: `Path found! Distance: ${endG.toFixed(1)}, Path: ${path.nodes.length} nodes, Visited: ${closedSet.size} nodes`,
      highlightNodes: path.nodes,
      highlightEdges: path.edges,
      nodeStyles: finalNodeStyles,
      edgeStyles: finalEdgeStyles,
      state: {
        phase: 'complete',
        found: true,
        distance: endG,
        pathLength: path.nodes.length,
        path: path.nodes,
        nodesVisited: closedSet.size,
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
