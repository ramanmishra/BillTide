import { useMemo } from 'react'
import { parseISO, format } from 'date-fns'
import {
    ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid
} from 'recharts'

export type SpendItem = {
    amount: string | number
    currency: string
    billingCycle: 'monthly' | 'yearly' | 'quarterly' | 'daily' | 'half-yearly' | 'weekly'
    nextChargeDate: string
}

export default function SpendOverTime({ subs, currency }: { subs: SpendItem[]; currency: string }) {
    const data = useMemo(() => {
        const byMonth = new Map<string, number>()
        const fx = (cycle: string) => {
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

        for (const s of subs) {
            if (s.currency?.toUpperCase() !== currency) continue
            const d = parseISO(s.nextChargeDate) // ISO yyyy-mm-dd
            const key = format(d, 'yyyy-MM')     // bucket by month
            const val = Number(s.amount) * fx(s.billingCycle)
            byMonth.set(key, (byMonth.get(key) || 0) + (isFinite(val) ? val : 0))
        }

        return Array.from(byMonth.entries())
            .sort((a, b) => (a[0] < b[0] ? -1 : 1))
            .map(([month, total]) => ({ month, total }))
    }, [subs, currency])

    return (
        <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={data}>
                <defs>
                    <linearGradient id="c" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopOpacity={0.35} />
                        <stop offset="95%" stopOpacity={0} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(v: any) =>
                    new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(Number(v))
                } />
                <Area type="monotone" dataKey="total" stroke="#0ea5e9" fill="url(#c)" />
            </AreaChart>
        </ResponsiveContainer>
    )
}
