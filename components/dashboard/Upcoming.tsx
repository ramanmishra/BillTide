import { useEffect, useState } from 'react'
import styles from '../../styles/Dashboard.module.css'

type Sub = {
    id: string
    name: string
    currency: string
    amount: string | number
    nextChargeDate: string
}

export default function Upcoming({ days = 7 }: { days?: number }) {
    const [items, setItems] = useState<Sub[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        (async () => {
            setLoading(true)
            const res = await fetch(`/api/subscriptions/upcoming?days=${days}`)
            const data = await res.json()
            setItems(data.subscriptions ?? [])
            setLoading(false)
        })()
    }, [days])

    if (loading) return <div className={styles.card}>Loading upcoming…</div>
    if (items.length === 0) return <div className={styles.card}>No upcoming charges.</div>

    return (
        <div className={styles.card}>
            <div className={styles.cardHead}><strong>Upcoming in {days} days</strong></div>
            <div className={styles.upcomingList}>
                {items.map((s) => (
                    <div key={s.id} className={styles.upcomingItem}>
                        <div className={styles.upcomingName}>{s.name}</div>
                        <div className={styles.upcomingMeta}>
                            <span>{new Date(s.nextChargeDate).toLocaleDateString()}</span>
                            <span>
                                {new Intl.NumberFormat(undefined, { style: 'currency', currency: s.currency }).format(Number(s.amount))}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
