import type { AppProps } from 'next/app'
import { AuthProvider } from '../context/AuthContext'
import '../styles/globals.css'
import Header from '../components/Headers'
import Footer from '../components/Footer' // we'll add next
import { useRouter } from 'next/router'

export default function App({ Component, pageProps }: AppProps) {
  const router = useRouter()

  const hideHeader = router.pathname === '/login' || router.pathname === '/signup'

  return (
    <AuthProvider>
      {!hideHeader && <Header />}
      <Component {...pageProps} />
      <Footer />
    </AuthProvider>
  )
}