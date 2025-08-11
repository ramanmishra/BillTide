// components/Loader.tsx
import styles from '../styles/Loader.module.css'

export default function Loader() {
    return (
        <div className={styles.loaderContainer}>
            <div className={styles.spinner} />
            <span>Loading...</span>
        </div>
    )
}
