import type { NextApiResponse } from 'next'
import type { NextApiRequest } from 'next'
import { withSession, AuthenticatedRequest } from '../../../lib/middleware/withSession'
import { db } from '../../../lib/db/client'
import { users } from '../../../lib/db/schema'
import { eq } from 'drizzle-orm'
import type { UserSettings } from '../../../lib/settings/types'

export default withSession(async function handler(req: AuthenticatedRequest & NextApiRequest, res: NextApiResponse) {
    const ownerId = (req.user?.client_id || req.user?.username || req.user?.user_name) as string
    if (!ownerId) return res.status(401).json({ error: 'Unauthenticated' })

    if (req.method === 'GET') {
        const row = await db.select().from(users).where(eq(users.ownerId, ownerId)).limit(1)
        const u = row[0]
        return res.status(200).json({
            email: u?.email ?? '',
            displayName: u?.displayName ?? ownerId,
            preferences: u?.preferences ?? {},
        })
    }

    if (req.method === 'PUT') {
        const body = req.body as UserSettings
        await db
            .insert(users)
            .values({
                ownerId,
                email: body.email,
                displayName: body.displayName || ownerId,
                preferences: body.preferences,
                updatedAt: new Date(),
            })
            .onConflictDoUpdate({
                target: users.ownerId,
                set: {
                    email: body.email,
                    displayName: body.displayName || ownerId,
                    preferences: body.preferences,
                    updatedAt: new Date(),
                },
            })
        return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
})
