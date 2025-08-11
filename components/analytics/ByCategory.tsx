import { useMemo } from 'react'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts'

const COLORS = ['#0ea5e9', '#22c55e', '#f97316', '#a855f7', '#ef4444', '#14b8a6', '#eab308', '#6366f1', '#10b981', '#f59e0b']

type Sub = {
    amount: string | number
    currency: string
    billingCycle: string
    category?: string
}

export default function ByCategory({ subs, currency }: { subs: Sub[]; currency: string }) {
    const data = useMemo(() => {
        const m = new Map<string, number>()
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
            const key = (s.category || 'Uncategorized')
            const val = Number(s.amount) * fx(s.billingCycle)
            m.set(key, (m.get(key) || 0) + (isFinite(val) ? val : 0))
        }
        return Array.from(m.entries()).map(([name, value]) => ({ name, value }))
    }, [subs, currency])

    const COLORS = ['#0ea5e9', '#22c55e', '#f97316', '#a855f7', '#ef4444', '#14b8a6', '#eab308']

    return (
        <ResponsiveContainer width="100%" height={280}>
            <PieChart>
                <Pie
                    data={data}
                    dataKey="value"
                    nameKey="name"
                    outerRadius={110}
                    innerRadius={50}
                    labelLine={false}
                    label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                    {data.map((_, i) => (
                        <Cell
                            key={i}
                            fill={COLORS[i % COLORS.length]}
                            stroke="#ffffff"
                            strokeWidth={1}
                        />
                    ))}
                </Pie>
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    )
}
