// pages/api/subscriptions/[id].ts
import type { NextApiResponse } from 'next'
import { withSession, AuthenticatedRequest } from '../../../lib/middleware/withSession'
import { db } from '../../../lib/db/client'
import { subscriptions } from '../../../lib/db/schema'
import { and, eq } from 'drizzle-orm'

export default withSession(async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    const ownerId = (req.user?.client_id || req.user?.username || req.user?.user_name) as string
    if (!ownerId) return res.status(401).json({ error: 'Unauthenticated' })

    const { id } = req.query as { id: string }

    if (req.method === 'DELETE') {
        await db.delete(subscriptions).where(and(eq(subscriptions.id, id), eq(subscriptions.ownerId, ownerId)))
        return res.status(204).end()
    }

    if (req.method === 'PUT') {
        const ownerId = (req.user?.client_id || req.user?.username || req.user?.user_name) as string
        const { id } = req.query as { id: string }
        const payload = req.body

        // Optional: coerce amount string->string (if coming as number)
        if (typeof payload.amount === 'number') payload.amount = payload.amount.toString()

        await db
            .update(subscriptions)
            .set({
                name: payload.name,
                amount: payload.amount,           // string for numeric column
                currency: payload.currency,
                billingCycle: payload.billingCycle,
                nextChargeDate: payload.nextChargeDate,
                category: payload.category ?? null,
                notes: payload.notes ?? null,
                updatedAt: new Date(),
            })
            .where(and(eq(subscriptions.id, id), eq(subscriptions.ownerId, ownerId)))

        return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
})
