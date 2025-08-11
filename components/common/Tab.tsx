import { useState } from 'react'
import styles from '../../styles/Tab.module.css'

type TabItem = { key: string; label: string; content: React.ReactNode }

export default function Tabs({ tabs, defaultKey, onChange }: {
    tabs: TabItem[]
    defaultKey?: string
    onChange?: (key: string) => void
}) {
    const initial = defaultKey ?? (tabs[0]?.key ?? '')
    const [active, setActive] = useState(initial)

    const setTab = (k: string) => {
        setActive(k)
        onChange?.(k)
    }

    return (
        <div className={styles.tabs}>
            <div className={styles.list} role="tablist" aria-label="Dashboard sections">
                {tabs.map(t => (
                    <button
                        key={t.key}
                        role="tab"
                        aria-selected={active === t.key}
                        className={`${styles.tab} ${active === t.key ? styles.active : ''}`}
                        onClick={() => setTab(t.key)}
                    >
                        {t.label}
                    </button>
                ))}
            </div>
            <div className={styles.panel} role="tabpanel">
                {tabs.find(t => t.key === active)?.content}
            </div>
        </div>
    )
}
