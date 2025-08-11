import { useState } from 'react'
import styles from '../../styles/Subscription.module.css'
import modalStyles from '../../styles/Modal.module.css'
import { subscriptionSchema } from '../../lib/validation/subscription'

type Sub = {
    id: string
    name: string
    amount: string | number
    currency: string
    billingCycle: 'monthly' | 'yearly' | 'quarterly' | 'daily' | 'half-yearly' | 'weekly'
    nextChargeDate: string
    category?: string
    notes?: string
}

export default function EditSubscriptionForm({
    sub,
    onClose,
    onSaved,
}: {
    sub: Sub
    onClose: () => void
    onSaved: () => void
}) {
    const [form, setForm] = useState({
        name: sub.name,
        amount: String(sub.amount ?? ''),
        currency: sub.currency,
        billingCycle: sub.billingCycle,
        nextChargeDate: sub.nextChargeDate?.slice(0, 10) ?? '',
        category: sub.category ?? '',
        notes: sub.notes ?? '',
    })
    const [error, setError] = useState('')

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setForm((f) => ({ ...f, [name]: value }))
    }

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        const payload = {
            ...form,
            amount: Number(form.amount),
            nextChargeDate: form.nextChargeDate,
        }

        try {
            subscriptionSchema.parse(payload) // ✅ zod validation
        } catch (zErr: any) {
            const first = zErr?.errors?.[0]?.message || 'Invalid data'
            setError(first)
            return
        }

        const res = await fetch(`/api/subscriptions/${sub.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        })

        if (!res.ok) {
            const d = await res.json().catch(() => ({}))
            setError(d.error || 'Update failed')
            return
        }

        onSaved()
        onClose()
    }

    return (
        <form className={styles.form} onSubmit={onSubmit}>
            <h3>Edit Subscription</h3>
            <div className={styles.row}>
                <input className={styles.input} name="name" value={form.name} onChange={onChange} />
                <input className={styles.input} name="amount" value={form.amount} onChange={onChange} />
                <input className={styles.input} name="currency" value={form.currency} onChange={onChange} maxLength={3} />
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
                <input className={styles.input} type="date" name="nextChargeDate" value={form.nextChargeDate} onChange={onChange} />
                <input className={styles.input} name="category" value={form.category} onChange={onChange} placeholder="Category" />
            </div>
            <textarea className={styles.textarea} name="notes" value={form.notes} onChange={onChange} placeholder="Notes" />
            {error && <p className={styles.error}>{error}</p>}
            <div className={modalStyles.modalActions}>
                <button type="button" className={styles.btn} onClick={onClose}>Cancel</button>
                <button type="submit" className={styles.submit}>Save</button>
            </div>
        </form>
    )
}
