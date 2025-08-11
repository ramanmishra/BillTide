import { useEffect, useState } from 'react'
import { useAuth } from '../../../hooks/useAuth'
import ByCategory from '../../../components/analytics/ByCategory'
import styles from '../../../styles/Dashboard.module.css'
import SpendOverTime, { type SpendItem } from '../../../components/analytics/SpendOverTime'

export default function AnalyticsPage() {
    const { user, loading } = useAuth()
    const [subs, setSubs] = useState<SpendItem[]>([])
    const [currency, setCurrency] = useState('USD')

    useEffect(() => {
        (async () => {
            if (loading || !user) return
            const res = await fetch('/api/subscriptions')
            const data = await res.json()
            setSubs((data.subscriptions || []) as SpendItem[])            // default currency to first item if available
            const first = data.subscriptions?.[0]?.currency?.toUpperCase()
            if (first) setCurrency(first)
        })()
    }, [loading, user])

    if (loading) return <div className={styles.container}>Loading…</div>

    const currencies = Array.from(new Set(subs.map(s => s.currency?.toUpperCase()).filter(Boolean)))

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Analytics</h1>

            <div className={styles.totalsControls}>
                <div />
                <select className={styles.selectInline} value={currency} onChange={(e) => setCurrency(e.target.value)}>
                    {currencies.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            <div className={styles.chartGrid}>
                <div className={styles.chartCard}>
                    <h3 className={styles.cardTitle}>Spend over time</h3>
                    <SpendOverTime subs={subs} currency={currency} />
                </div>
                <div className={styles.chartCard}>
                    <h3 className={styles.cardTitle}>By category</h3>
                    <ByCategory subs={subs} currency={currency} />
                </div>
            </div>
        </div>
    )
}
