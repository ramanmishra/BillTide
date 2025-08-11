import type { NextApiResponse } from 'next'
import { withSession, AuthenticatedRequest } from '../../../lib/middleware/withSession'
import { db } from '../../../lib/db/client'
import { subscriptions } from '../../../lib/db/schema'
import { eq, sql, and } from 'drizzle-orm'

export default withSession(async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
    const ownerId = (req.user?.client_id || req.user?.username || req.user?.user_name) as string
    if (!ownerId) return res.status(401).json({ error: 'Unauthenticated' })

    const days = Math.max(1, Math.min(60, Number(req.query.days ?? 7))) // clamp 1..60

    const rows = await db
        .select()
        .from(subscriptions)
        .where(
            and(
                eq(subscriptions.ownerId, ownerId),
                // nextChargeDate is saved as 'YYYY-MM-DD'
                sql`to_date(${subscriptions.nextChargeDate}, 'YYYY-MM-DD') 
            <= (CURRENT_DATE + ${days} * INTERVAL '1 day')`
            )
        )
        .orderBy(sql`to_date(${subscriptions.nextChargeDate}, 'YYYY-MM-DD') asc`)

    return res.status(200).json({ subscriptions: rows })
})
