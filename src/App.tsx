import { Header } from './components/layout/Header'
import { Sidebar } from './components/layout/Sidebar'
import { GraphCanvas } from './components/graph/GraphCanvas'
import { AlgorithmControls } from './components/algorithm/AlgorithmControls'
import { RaceMode } from './components/race/RaceMode'
import { useUIStore } from './stores/uiStore'
import styles from './App.module.css'

function App() {
  const appMode = useUIStore((state) => state.appMode)

  return (
    <div className={styles.app}>
      <Header />
      <div className={styles.main}>
        {appMode === 'race' ? (
          <RaceMode />
        ) : (
          <>
            <Sidebar />
            <div className={styles.content}>
              <GraphCanvas />
              <AlgorithmControls />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App
