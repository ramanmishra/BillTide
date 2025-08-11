import styles from '../../styles/Dashboard.module.css'
import { useEffect, useMemo, useState } from 'react'

type Sub = {
    id: string
    name: string
    amount: string | number
    currency: string
    billingCycle: 'monthly' | 'yearly' | 'quarterly' | 'daily' | 'half-yearly' | 'weekly'
    nextChargeDate: string
}

const factorToMonthly = (cycle: string) => {
    switch (cycle) {
        case 'monthly': return 1
        case 'yearly': return 1 / 12
        case 'quarterly': return 1 / 3
        case 'half-yearly': return 1 / 6
        case 'weekly': return 4.345 // average weeks per month
        case 'daily': return 30 // simple monthly approximation
        default: return 1
    }
}

export default function Totals({ subs }: { subs: Sub[] }) {
    // group by currency; normalize yearly -> monthly
    const [view, setView] = useState<'monthly' | 'yearly'>(() => (localStorage.getItem('totalsView') as any) || 'monthly')
    const [currencyFilter, setCurrencyFilter] = useState<string>('ALL')

    useEffect(() => {
        localStorage.setItem('totalsView', view)
    }, [view])

    const factorToMonthly = (cycle: string) => {
        switch (cycle) {
            case 'monthly': return 1
            case 'yearly': return 1 / 12
            case 'quarterly': return 1 / 3
            case 'half-yearly': return 1 / 6
            case 'weekly': return 4.345
            case 'daily': return 30
            default: return 1
        }
    }

    const byCurrency = useMemo(() => {
        const m = new Map<string, number>()
        for (const s of subs) {
            const cur = s.currency?.toUpperCase() || 'USD'
            const amt = Number(s.amount) || 0
            const monthly = amt * factorToMonthly(s.billingCycle)
            m.set(cur, (m.get(cur) || 0) + monthly)
        }
        return m
    }, [subs])

    const currencies = Array.from(byCurrency.keys())
    const displayCurrencies = currencyFilter === 'ALL' ? currencies : [currencyFilter]

    return (
        <>
            {/* Controls */}
            <div className={styles.totalsControls}>
                <div className={styles.segment}>
                    <button
                        className={`${styles.segmentBtn} ${view === 'monthly' ? styles.segmentActive : ''}`}
                        onClick={() => setView('monthly')}
                    >Monthly</button>
                    <button
                        className={`${styles.segmentBtn} ${view === 'yearly' ? styles.segmentActive : ''}`}
                        onClick={() => setView('yearly')}
                    >Yearly</button>
                </div>
                <select
                    className={styles.selectInline}
                    value={currencyFilter}
                    onChange={(e) => setCurrencyFilter(e.target.value)}
                >
                    <option value="ALL">All currencies</option>
                    {currencies.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
            </div>

            {/* Cards */}
            <div className={styles.totals}>
                {displayCurrencies.map((cur) => {
                    const monthlyTotal = byCurrency.get(cur) || 0
                    const value = view === 'monthly' ? monthlyTotal : monthlyTotal * 12
                    return (
                        <div key={cur} className={styles.totalCard}>
                            <div className={styles.totalLabel}>
                                {view === 'monthly' ? 'Monthly total' : 'Yearly total'} ({cur})
                            </div>
                            <div className={styles.totalValue}>
                                {new Intl.NumberFormat(undefined, { style: 'currency', currency: cur }).format(value)}
                            </div>
                        </div>
                    )
                })}
            </div>
        </>
    )
}
