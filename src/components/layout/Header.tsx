import { useUIStore, AppMode } from '../../stores/uiStore'
import styles from './Header.module.css'

const modes: { mode: AppMode; label: string; disabled?: boolean }[] = [
  { mode: 'sandbox', label: 'Sandbox' },
  { mode: 'race', label: 'Race' },
  { mode: 'maps', label: 'Maps', disabled: true },
]

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <line x1="3" y1="5" x2="17" y2="5" />
      <line x1="3" y1="10" x2="17" y2="10" />
      <line x1="3" y1="15" x2="17" y2="15" />
    </svg>
  )
}

export function Header() {
  const appMode = useUIStore((state) => state.appMode)
  const setAppMode = useUIStore((state) => state.setAppMode)
  const toggleSidebar = useUIStore((state) => state.toggleSidebar)

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        <button
          className={styles.menuButton}
          onClick={toggleSidebar}
          aria-label="Toggle sidebar"
        >
          <MenuIcon />
        </button>
        <div className={styles.brand}>
          <h1 className={styles.title}>Graph Algorithms</h1>
        </div>
      </div>

      <nav className={styles.nav}>
        {modes.map(({ mode, label, disabled }) => (
          <button
            key={mode}
            className={`${styles.navButton} ${appMode === mode ? styles.active : ''}`}
            onClick={() => !disabled && setAppMode(mode)}
            disabled={disabled}
            title={disabled ? 'Coming soon' : undefined}
          >
            {label}
          </button>
        ))}
      </nav>

      <div className={styles.right} />
    </header>
  )
}
