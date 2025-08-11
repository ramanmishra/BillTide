import { ReactNode, useEffect } from 'react'
import styles from '../../styles/Modal.module.css'

export default function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: ReactNode }) {
    useEffect(() => {
        const onEsc = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
        document.addEventListener('keydown', onEsc)
        return () => document.removeEventListener('keydown', onEsc)
    }, [onClose])

    if (!open) return null
    return (
        <div className={styles.backdrop} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    )
}
