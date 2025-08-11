import nodemailer from 'nodemailer'
import type { EmailProvider, EmailPayload } from '../types'

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST!,
    port: Number(process.env.SMTP_PORT || 587),
    secure: false, // set true if you use 465
    auth: process.env.SMTP_USER ? {
        user: process.env.SMTP_USER!,
        pass: process.env.SMTP_PASS!,
    } : undefined,
})

export const smtpProvider: EmailProvider = {
    async send({ to, subject, html }: EmailPayload) {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM || 'BillTide <no-reply@billtide.local>',
            to,
            subject,
            html,
        })
    }
}
