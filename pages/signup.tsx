import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../hooks/useAuth'
import styles from '../styles/Auth.module.css'

export default function SignupPage() {
    const router = useRouter()
    const { user, loading } = useAuth()

    useEffect(() => {
        if (!loading && user) {
            router.push('/dashboard')
        }
    }, [user, loading, router])

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        firstName: '',
        lastName: ''
    })
    const [error, setError] = useState('')
    const [loadingSubmit, setLoadingSubmit] = useState(false)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoadingSubmit(true)
        setError('')

        const res = await fetch('/api/signup', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                kind: 'PERSONAL',
                displayName: formData.username,
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                password: formData.password,
                secret: {
                    kind: 'PASSWORD',
                    name: formData.username,
                    secret: formData.password,
                    email: formData.email
                },
                roles: []
            })
        })

        const data = await res.json()
        if (res.ok) {
            router.push('/login')
        } else {
            setError(data.error || 'Signup failed')
            setLoadingSubmit(false)
        }
    }

    return (
        <div className={styles.authContainer}>
            <h2 className={styles.heading}>Sign Up</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
                <input className={styles.input} type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
                <input className={styles.input} type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} required />
                <input className={styles.input} type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} required />
                <input className={styles.input} type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} required />
                <input className={styles.input} type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                {error && <p className={styles.error}>{error}</p>}
                <button className={styles.submitButton} type="submit" disabled={loading}>{loading ? 'Creating Account...' : 'Sign Up'}</button>
            </form>
        </div>
    )
}