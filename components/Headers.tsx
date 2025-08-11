import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import styles from '../styles/Header.module.css'

export default function Header() {
    const router = useRouter()
    const { user } = useAuth()
    const [avatarUrl, setAvatarUrl] = useState<string>('')


    const isActive = (href: string) => router.pathname === href

    const onLogout = async () => {
        await fetch('/api/logout', { method: 'GET' })
        router.push('/login')
    }

    useEffect(() => {
        let alive = true
            ; (async () => {
                try {
                    const res = await fetch('/api/profile')
                    if (!res.ok) return
                    const data = await res.json()
                    if (alive) setAvatarUrl(data.avatarUrl || '')
                } catch { }
            })()
        return () => { alive = false }
    }, [])

    return (
        <header className={styles.header}>
            <div className={styles.left}>
                <Link href="/dashboard" className={styles.brand}>
                    BillTide
                </Link>
                <nav className={styles.nav}>
                    <Link href="/dashboard" className={`${styles.navLink} ${isActive('/dashboard') ? styles.active : ''}`}>Dashboard</Link>
                    <Link href="/dashboard/analytics" className={`${styles.navLink} ${isActive('/dashboard/analytics') ? styles.active : ''}`}>Analytics</Link>
                </nav>
            </div>

            <div className={styles.right}>
                <button className={styles.avatar} aria-haspopup="menu" aria-expanded="false">
                    {avatarUrl ? (
                        <img
                            src={avatarUrl}
                            alt="avatar"
                            className={styles.avatarImg}
                            onError={() => setAvatarUrl('')}
                        />
                    ) : (
                        (user?.displayName || 'U').charAt(0).toUpperCase()
                    )}
                </button>
                <div className={styles.menu}>
                    <div className={styles.menuHeader}>
                        <div className={styles.menuName}>{user?.displayName || user?.username || 'User'}</div>
                        <div className={styles.menuEmail}>{user?.email || ''}</div>
                    </div>
                    <Link className={styles.menuItem} href="/settings">Settings</Link>
                    {/* Profile can route to /settings for now */}
                    <Link className={styles.menuItem} href="/profile">Profile</Link>
                    <button className={styles.menuItemDanger} onClick={onLogout}>Logout</button>
                </div>
            </div>
        </header>
    )
}
