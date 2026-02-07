# Implementation Plan: Pathfinding & Race Mode

## 1. Dijkstra's Algorithm
**File:** `src/algorithms/pathfinding/dijkstra.ts`

- Build adjacency map with weights (default weight = 1 for unweighted)
- Use priority queue (min-heap) for efficient node selection
- Track distances and predecessors for path reconstruction
- Steps to visualize:
  - Initialize: all nodes with infinity distance, start node = 0
  - Select: pick node with minimum distance from unvisited
  - Relax: update neighbors if shorter path found
  - Complete: reconstruct path from start to end

**Params needed:** `startNode`, `endNode`

## 2. A* Algorithm
**File:** `src/algorithms/pathfinding/astar.ts`

- Same structure as Dijkstra but with heuristic
- Use Euclidean distance as heuristic (nodes have x, y coordinates)
- f(n) = g(n) + h(n) where g = actual cost, h = heuristic
- Visualize open set, closed set, and current best path

**Params needed:** `startNode`, `endNode`

## 3. Algorithm Picker Updates
**File:** `src/components/algorithm/AlgorithmPicker.tsx`

- For pathfinding algorithms, show start/end node selection UI
- Options:
  - Click to select start node (highlight in green)
  - Click to select end node (highlight in red)
  - Or use dropdowns with node labels
- Pass `startNode` and `endNode` to algorithm params

## 4. Register Algorithms
**File:** `src/algorithms/index.ts`

```typescript
import { dijkstra } from './pathfinding/dijkstra'
import { astar } from './pathfinding/astar'

export const algorithms: AlgorithmRunner[] = [
  dsatur,
  dijkstra,
  astar,
]
```

## 5. Race Mode
**File:** `src/components/race/RaceMode.tsx`

### UI Layout:
- Split view: two graph canvases side by side
- Same graph displayed in both
- Algorithm selector for left and right
- Shared controls: Play, Pause, Reset
- Speed synchronized

### State:
- `src/stores/raceStore.ts`
  - leftAlgorithm, rightAlgorithm
  - leftSteps[], rightSteps[]
  - leftCurrentStep, rightCurrentStep
  - raceStatus: 'idle' | 'running' | 'complete'
  - winner: 'left' | 'right' | 'tie' | null

### Race Logic:
- Both algorithms run on same graph with same start/end
- Step through simultaneously (same speed)
- First to reach end node wins
- Display winner banner when complete

### Components:
- `RaceCanvas.tsx` - wrapper for two GraphCanvas instances
- `RaceControls.tsx` - algorithm pickers + playback
- `RaceResult.tsx` - winner display

## 6. Header Updates
**File:** `src/components/layout/Header.tsx`

- Remove Learn tab from modes array:
```typescript
const modes = [
  { mode: 'sandbox', label: 'Sandbox' },
  { mode: 'race', label: 'Race' },  // Enable this
  { mode: 'maps', label: 'Maps', disabled: true },
]
```

## 7. App.tsx Updates
- Conditionally render based on appMode:
  - 'sandbox' → current layout (Sidebar + GraphCanvas + Controls)
  - 'race' → RaceMode component

## File Structure
```
src/
├── algorithms/
│   ├── pathfinding/
│   │   ├── dijkstra.ts
│   │   └── astar.ts
│   └── index.ts (update)
├── components/
│   ├── race/
│   │   ├── RaceMode.tsx
│   │   ├── RaceMode.module.css
│   │   ├── RaceCanvas.tsx
│   │   ├── RaceControls.tsx
│   │   └── RaceResult.tsx
│   └── layout/
│       └── Header.tsx (update)
├── stores/
│   └── raceStore.ts (new)
└── App.tsx (update)
```

## Implementation Order
1. Dijkstra's algorithm
2. A* algorithm
3. Update AlgorithmPicker for start/end selection
4. Register algorithms in index
5. Remove Learn tab
6. Create raceStore
7. Build Race mode UI components
8. Wire up App.tsx for mode switching
