import { dsatur } from './coloring/dsatur'
import { dijkstra } from './pathfinding/dijkstra'
import { astar } from './pathfinding/astar'
import type { AlgorithmRunner, AlgorithmCategory } from '../types/algorithm'

// Algorithm registry
export const algorithms: AlgorithmRunner[] = [
  dsatur,
  dijkstra,
  astar,
]

// Get algorithms by category
export function getAlgorithmsByCategory(category: AlgorithmCategory): AlgorithmRunner[] {
  return algorithms.filter((alg) => alg.category === category)
}

// Get algorithm by ID
export function getAlgorithmById(id: string): AlgorithmRunner | undefined {
  return algorithms.find((alg) => alg.id === id)
}

// Get all categories with their algorithms
export function getCategories(): { category: AlgorithmCategory; name: string; algorithms: AlgorithmRunner[] }[] {
  const categoryNames: Record<AlgorithmCategory, string> = {
    coloring: 'Graph Coloring',
    pathfinding: 'Pathfinding',
    traversal: 'Traversal',
    mst: 'Minimum Spanning Tree',
  }

  const categories: AlgorithmCategory[] = ['coloring', 'pathfinding', 'traversal', 'mst']

  return categories
    .map((cat) => ({
      category: cat,
      name: categoryNames[cat],
      algorithms: getAlgorithmsByCategory(cat),
    }))
    .filter((c) => c.algorithms.length > 0)
}
