import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from '../../hooks/useAuth'
import SubscriptionForm from '../../components/subscription/SubscriptionForm'
import styles from '../../styles/Dashboard.module.css'
import Modal from '../../components/common/Modal'
import EditSubscriptionForm from '../../components/subscription/EditSubscriptionForm'
import Totals from '../../components/dashboard/Totals'
import Upcoming from '../../components/dashboard/Upcoming'
import Tabs from '../../components/common/Tab'

type Sub = {
  id: string
  name: string
  amount: number
  currency: string
  billingCycle: 'monthly' | 'yearly' | 'quarterly' | 'daily' | 'half-yearly' | 'weekly'
  nextChargeDate: string
  category?: string
  notes?: string
}

export default function DashboardPage() {
  const { user, loading, logout } = useAuth()
  const router = useRouter()
  const [subs, setSubs] = useState<Sub[]>([])
  const [loadingList, setLoadingList] = useState(true)
  const [editing, setEditing] = useState<null | Sub>(null)
  const openEdit = (sub: Sub) => setEditing(sub)
  const closeEdit = () => setEditing(null)

  useEffect(() => {
    if (!loading && (!user || Object.keys(user).length === 0)) router.push('/login')
  }, [user, loading, router])

  const load = async () => {
    setLoadingList(true)
    const res = await fetch('/api/subscriptions')
    if (res.ok) {
      const data = await res.json()
      setSubs(data.subscriptions)
    }
    setLoadingList(false)
  }

  const onDelete = async (id: string) => {
    const yes = confirm('Delete this subscription?')
    if (!yes) return
    const res = await fetch(`/api/subscriptions/${id}`, { method: 'DELETE' })
    if (res.ok) await load()
  }

  useEffect(() => {
    if (!loading && user) load()
  }, [loading, user])

  if (loading) return <div className={styles.container}>Loading...</div>

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Subscriptions</h1>
      <SubscriptionForm onCreated={load} />

      {loadingList ? (
        <p>Loading...</p>
      ) : subs.length === 0 ? (
        <p className={styles.subtitle}>No subscriptions yet.</p>
      ) : (
        <div className={styles.list}>
          {subs.map((s) => (
            <div key={s.id} className={styles.card}>
              <div className={styles.cardHead}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div className={styles.logo}>
                    {s.name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <strong>{s.name}</strong>
                    {s.category && <span className={styles.chip} style={{ marginLeft: 8 }}>{s.category}</span>}
                  </div>
                </div>
                <div className={styles.amount}>
                  {new Intl.NumberFormat(undefined, { style: 'currency', currency: s.currency }).format(Number(s.amount))}
                </div>
              </div>
              <div className={styles.cardMeta}>
                <span className={styles.pill}>{s.billingCycle}</span>
                <span className={styles.pill}>Next: {new Date(s.nextChargeDate).toLocaleDateString()}</span>
              </div>
              <div className={styles.actions}>
                <button className={styles.btn} onClick={() => openEdit(s)}>Edit</button>
                <button className={`${styles.dangerButton}`} onClick={() => onDelete(s.id)}>Delete</button>
              </div>
            </div>
          ))}
          <Upcoming days={7} />
          <Totals subs={subs} />
        </div>
      )}

      <Modal open={!!editing} onClose={closeEdit}>
        {editing && (
          <EditSubscriptionForm
            sub={editing}
            onClose={closeEdit}
            onSaved={load}
          />
        )}
      </Modal>

      <button className={styles.logoutButton} onClick={logout}>Logout</button>
    </div>
  )
}
