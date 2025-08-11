import type { NextApiRequest, NextApiResponse } from 'next'
import { withSession, AuthenticatedRequest } from '../../../../lib/middleware/withSession'
import { passwordSchema } from '../../../../lib/validation/profile'

const IDM_BASE_URL = process.env.IDM_BASE_URL as string

export default withSession(async function handler(req: AuthenticatedRequest & NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'PUT') return res.status(405).json({ error: 'Method not allowed' })
    const token = req.cookies.token
    if (!token) return res.status(401).json({ error: 'Unauthorized' })

    const { password } = passwordSchema.parse(req.body)

    try {
        const rsp = await fetch(`${IDM_BASE_URL}/my/account/password`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ password }),
        })
        if (!rsp.ok) {
            const text = await rsp.text().catch(() => '')
            return res.status(rsp.status).json({ error: text || 'Password update failed' })
        }
        return res.status(200).json({ success: true })
    } catch {
        return res.status(502).json({ error: 'IDM unreachable' })
    }
})
