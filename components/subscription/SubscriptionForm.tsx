// components/subscription/SubscriptionForm.tsx
import { useState } from 'react'
import { subscriptionSchema } from '../../lib/validation/subscription'
import styles from '../../styles/Subscription.module.css'

type FormData = {
    name: string
    amount: string
    currency: string
    billingCycle: 'monthly' | 'yearly' | 'quarterly' | 'daily' | 'half-yearly' | 'weekly'
    nextChargeDate: string
    category?: string
    notes?: string
}

export default function SubscriptionForm({ onCreated }: { onCreated?: () => void }) {
    const [form, setForm] = useState<FormData>({
        name: '',
        amount: '',
        currency: 'USD',
        billingCycle: 'monthly',
        nextChargeDate: '',
        category: '',
        notes: '',
    })
    const [error, setError] = useState<string>('')

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setForm((f) => ({ ...f, [name]: value }))
    }

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        try {
            const payload = {
                ...form,
                amount: Number(form.amount),
            }
            subscriptionSchema.parse(payload)
            const res = await fetch('/api/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })
            if (!res.ok) {
                const d = await res.json()
                throw new Error(d.error || 'Failed to create')
            }
            onCreated?.()
            setForm({ name: '', amount: '', currency: 'USD', billingCycle: 'monthly', nextChargeDate: '', category: '', notes: '' })
        } catch (err: any) {
            setError(err.message)
        }
    }

    return (
        <form className={styles.form} onSubmit={onSubmit}>
            <div className={styles.row}>
                <input className={styles.input} name="name" placeholder="Name (e.g., Netflix)" value={form.name} onChange={onChange} required />
                <input className={styles.input} name="amount" placeholder="Amount" value={form.amount} onChange={onChange} required />
                <input className={styles.input} name="currency" placeholder="CUR (USD/EUR)" value={form.currency} onChange={onChange} maxLength={3} required />
            </div>
            <div className={styles.row}>
                <select className={styles.select} name="billingCycle" value={form.billingCycle} onChange={onChange}>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="quarterly">Quarterly</option>
                    <option value="half-yearly">Half-yearly</option>
                    <option value="weekly">Weekly</option>
                    <option value="daily">Daily</option>
                </select>
                <input className={styles.input} type="date" name="nextChargeDate" value={form.nextChargeDate} onChange={onChange} required />
                <input className={styles.input} name="category" placeholder="Category (Optional)" value={form.category} onChange={onChange} />
            </div>
            <textarea className={styles.textarea} name="notes" placeholder="Notes (Optional)" value={form.notes} onChange={onChange} />
            {error && <p className={styles.error}>{error}</p>}
            <button className={styles.submit} type="submit">Add Subscription</button>
        </form>
    )
}
