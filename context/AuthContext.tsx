// contexts/AuthContext.tsx
import { createContext, useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/router'
import Loader from '../components/Loader'

interface User {
    email: string
    username: string
    [key: string]: any
}

interface AuthContextType {
    user: User | null
    loading: boolean
    login: (username: string, password: string) => Promise<void>
    logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/session')
                if (res.ok) {
                    const data = await res.json()
                    setUser(data.user)
                }
            } catch (err) {
                console.error('Session fetch error:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchUser()
    }, [])

    const login = async (username: string, password: string) => {
        const res = await fetch('/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        })

        if (!res.ok) {
            const errorData = await res.json()
            throw new Error(errorData.error || 'Login failed')
        }

        // ✅ Ensure user is fetched freshly after successful login
        const session = await fetch('/api/session')
        const data = await session.json()
        setUser(data.user)

        router.push('/dashboard')
    }


    const logout = async () => {
        await fetch('/api/logout')
        setUser(null)
        router.push('/login')
    }

    return (
        <AuthContext.Provider value={{ user, loading, login, logout }}>
            {loading ? <Loader /> : children}
        </AuthContext.Provider>
    )
}
