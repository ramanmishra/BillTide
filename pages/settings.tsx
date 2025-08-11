import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import styles from '../styles/Settings.module.css'

type Prefs = {
    defaultCurrency?: string
    totalsView?: 'monthly' | 'yearly'
    remindersEnabled?: boolean
    reminderDays?: number
}

export default function SettingsPage() {
    const { user, loading } = useAuth()
    const [email, setEmail] = useState('')
    const [displayName, setDisplayName] = useState('')
    const [prefs, setPrefs] = useState<Prefs>({ totalsView: 'monthly', remindersEnabled: true, reminderDays: 7 })
    const [saving, setSaving] = useState(false)
    const [msg, setMsg] = useState<string>('')

    useEffect(() => {
        if (loading) return
        (async () => {
            const res = await fetch('/api/settings')
            const data = await res.json()
            setEmail(data.email || '')
            setDisplayName(data.displayName || user?.displayName || '')
            setPrefs({ ...prefs, ...data.preferences })
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [loading])

    const onSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true); setMsg('')
        const res = await fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, displayName, preferences: prefs }),
        })
        setSaving(false)
        setMsg(res.ok ? 'Saved!' : 'Save failed')
    }

    if (loading) return <div className={styles.container}>Loading…</div>

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>User Settings</h1>
            <form className={styles.form} onSubmit={onSave}>
                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Profile</h3>
                    <div className={styles.row}>
                        <input className={styles.input} placeholder="Display name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
                        <input className={styles.input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                </div>

                <div className={styles.section}>
                    <h3 className={styles.sectionTitle}>Preferences</h3>
                    <div className={styles.row}>
                        <select className={styles.select} value={prefs.defaultCurrency || ''} onChange={(e) => setPrefs(p => ({ ...p, defaultCurrency: e.target.value }))}>
                            <option value="">Default currency (optional)</option>
                            <option value="USD">USD</option>
                            <option value="EUR">EUR</option>
                            <option value="GBP">GBP</option>
                            <option value="INR">INR</option>
                        </select>
                        <select className={styles.select} value={prefs.totalsView || 'monthly'} onChange={(e) => setPrefs(p => ({ ...p, totalsView: e.target.value as 'monthly' | 'yearly' }))}>
                            <option value="monthly">Monthly totals</option>
                            <option value="yearly">Yearly totals</option>
                        </select>
                    </div>
                    <div className={styles.row}>
                        <label className={styles.switch}>
                            <input
                                type="checkbox"
                                checked={!!prefs.remindersEnabled}
                                onChange={(e) => setPrefs(p => ({ ...p, remindersEnabled: e.target.checked }))}
                            />
                            <span>Email reminders enabled</span>
                        </label>
                        <input
                            className={styles.input}
                            type="number"
                            min={1}
                            max={60}
                            placeholder="Reminder days (e.g., 7)"
                            value={prefs.reminderDays ?? 7}
                            onChange={(e) => setPrefs(p => ({ ...p, reminderDays: Number(e.target.value) }))}
                        />
                    </div>
                </div>

                {msg && <div className={styles.msg}>{msg}</div>}
                <button className={styles.save} type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save settings'}</button>
            </form>
        </div>
    )
}
