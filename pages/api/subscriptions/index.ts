import type { NextApiResponse } from 'next'
import { withSession, AuthenticatedRequest } from '../../../lib/middleware/withSession'
import { subscriptionSchema } from '../../../lib/validation/subscription'
import { db } from '../../../lib/db/client'
import { subscriptions } from '../../../lib/db/schema'
import { eq } from 'drizzle-orm'
import { randomUUID } from 'crypto'

export default withSession(async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    const ownerId = (req.user?.client_id || req.user?.username || req.user?.user_name) as string
    if (!ownerId) return res.status(401).json({ error: 'Unauthenticated' })

    if (req.method === 'POST') {
        try {
            if (typeof req.body.amount === 'string') req.body.amount = Number(req.body.amount)
            const parsed = subscriptionSchema.parse(req.body)
            const created = {
                id: randomUUID(),
                ownerId,
                ...parsed,
                amount: parsed.amount.toString()
            }
            await db.insert(subscriptions).values(created)
            return res.status(201).json({ subscription: created })
        } catch (e: any) {
            const msg = e?.errors?.[0]?.message || 'Invalid payload'
            return res.status(400).json({ error: msg })
        }
    }

    if (req.method === 'GET') {
        const items = await db.select().from(subscriptions).where(eq(subscriptions.ownerId, ownerId))
        return res.status(200).json({ subscriptions: items })
    }

    return res.status(405).json({ error: 'Method not allowed' })
})
