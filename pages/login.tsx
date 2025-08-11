import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../hooks/useAuth'
import styles from '../styles/Auth.module.css'

export default function LoginPage() {
    const router = useRouter()
    const { user, loading, login } = useAuth()

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard')
        }
    }, [user, loading, router])

    const [clientId, setClientId] = useState('')
    const [clientSecret, setClientSecret] = useState('')
    const [error, setError] = useState('')
    const [loadingSubmit, setLoadingSubmit] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoadingSubmit(true)

        try {
            await login(clientId, clientSecret)
        } catch (err: any) {
            setError(err.message)
            setLoadingSubmit(false)
        }
    }

    return (
        <div className={styles.authContainer}>
            <h2 className={styles.heading}>Login</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input className={styles.input} type="text" name="clientId" placeholder="User Name" value={clientId} onChange={(e) => setClientId(e.target.value)} required />
                <input className={styles.input} type="password" name="clientSecret" placeholder="Password" value={clientSecret} onChange={(e) => setClientSecret(e.target.value)} required />
                {error && <p className={styles.error}>{error}</p>}
                <button className={styles.submitButton} type="submit" disabled={loadingSubmit}>{loadingSubmit ? 'Logging in...' : 'Login'}</button>
            </form>
            <div className={styles.linkContainer}>
                <a href="/signup" className={styles.link}>Don’t have an account? Sign up</a>
            </div>
        </div>
    )
}