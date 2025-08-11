import type { EmailProvider } from './types'
import { smtpProvider } from './provider/smtp'

export function getEmailProvider(): EmailProvider {
    const provider = (process.env.EMAIL_PROVIDER || 'smtp').toLowerCase()
    // switch(provider) { case 'resend': return resendProvider; ... }
    return smtpProvider
}
