export default function Footer() {
    return (
        <footer style={{
            padding: '16px',
            borderTop: '1px solid #eef2f7',
            textAlign: 'center',
            color: '#64748b',
            background: '#fff'
        }}>
            © {new Date().getFullYear()} BillTide • <a href="#" style={{ color: '#0ea5e9' }}>Privacy</a> • <a href="#" style={{ color: '#0ea5e9' }}>Terms</a>
        </footer>
    )
}
