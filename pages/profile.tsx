import { useEffect, useState } from 'react'
import styles from '../styles/Profile.module.css'
import { useAuth } from '../hooks/useAuth'

export default function ProfilePage() {
    const { loading } = useAuth()
    const [form, setForm] = useState({ displayName: '', email: '', avatarUrl: '', bio: '' })
    const [pwd, setPwd] = useState({ password: '', confirm: '' })
    const [msg, setMsg] = useState<string>('')

    useEffect(() => {
        (async () => {
            const res = await fetch('/api/profile')
            const data = await res.json()
            setForm({ displayName: data.displayName || '', email: data.email || '', avatarUrl: data.avatarUrl || '', bio: data.bio || '' })
        })()
    }, [])

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setForm((f) => ({ ...f, [name]: value }))
    }

    const onSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setMsg('')
        const res = await fetch('/api/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form),
        })
        setMsg(res.ok ? 'Profile saved.' : 'Save failed.')
    }

    const onChangePassword = async (e: React.FormEvent) => {
        e.preventDefault()
        setMsg('')
        if (pwd.password.length < 9) return setMsg('Password must be at least 9 characters.')
        if (pwd.password !== pwd.confirm) return setMsg('Passwords do not match.')
        const res = await fetch('/api/profile/password', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ password: pwd.password }),
        })
        setMsg(res.ok ? 'Password updated.' : 'Password update failed.')
        if (res.ok) setPwd({ password: '', confirm: '' })
    }

    if (loading) return <div className={styles.container}>Loading…</div>

    return (
        <div className={styles.container}>
            <h1 className={styles.title}>Profile</h1>

            <form className={styles.card} onSubmit={onSave}>
                <div className={styles.row}>
                    <input className={styles.input} name="displayName" value={form.displayName} onChange={onChange} placeholder="Display name" />
                    <input className={styles.input} type="email" name="email" value={form.email} onChange={onChange} placeholder="Email" />
                </div>
                <div className={styles.row}>
                    <input className={styles.input} name="avatarUrl" value={form.avatarUrl} onChange={onChange} placeholder="Avatar URL (optional)" />
                </div>
                <textarea className={styles.textarea} name="bio" value={form.bio} onChange={onChange} placeholder="Bio (optional)" />
                <button className={styles.primary} type="submit">Save Profile</button>
            </form>

            <form className={styles.card} onSubmit={onChangePassword}>
                <h3 className={styles.subtitle}>Change Password</h3>
                <div className={styles.row}>
                    <input className={styles.input} type="password" value={pwd.password} onChange={(e) => setPwd({ ...pwd, password: e.target.value })} placeholder="New password (min 9 chars)" />
                    <input className={styles.input} type="password" value={pwd.confirm} onChange={(e) => setPwd({ ...pwd, confirm: e.target.value })} placeholder="Confirm password" />
                </div>
                <button className={styles.primary} type="submit">Update Password</button>
            </form>

            {msg && <div className={styles.msg}>{msg}</div>}
        </div>
    )
}
