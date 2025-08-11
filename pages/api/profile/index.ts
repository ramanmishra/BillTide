import type { NextApiRequest, NextApiResponse } from 'next'
import { withSession, AuthenticatedRequest } from '../../../lib/middleware/withSession'
import { db } from '../../../lib/db/client'
import { users } from '../../../lib/db/schema'
import { eq } from 'drizzle-orm'
import { profileUpdateSchema } from '../../../lib/validation/profile'

export default withSession(async function handler(req: AuthenticatedRequest & NextApiRequest, res: NextApiResponse) {
    const ownerId = (req.user?.client_id || req.user?.username || req.user?.user_name) as string
    if (!ownerId) return res.status(401).json({ error: 'Unauthenticated' })

    if (req.method === 'GET') {
        const row = await db.select().from(users).where(eq(users.ownerId, ownerId)).limit(1)
        const u = row[0]
        const prefs = (u?.preferences as any) || {}
        return res.status(200).json({
            ownerId,
            displayName: u?.displayName ?? ownerId,
            email: u?.email ?? '',
            avatarUrl: prefs.avatarUrl ?? '',
            bio: prefs.bio ?? '',
            createdAt: u?.createdAt ?? null,
        })
    }

    if (req.method === 'PUT') {
        const parsed = profileUpdateSchema.parse(req.body)
        // merge avatarUrl/bio into preferences to avoid extra DB migration
        const existing = await db.select().from(users).where(eq(users.ownerId, ownerId)).limit(1)
        const prevPrefs = (existing[0]?.preferences as any) || {}

        await db
            .insert(users)
            .values({
                ownerId,
                email: parsed.email,
                displayName: parsed.displayName || ownerId,
                preferences: { ...prevPrefs, avatarUrl: parsed.avatarUrl || '', bio: parsed.bio || '' },
                updatedAt: new Date(),
            })
            .onConflictDoUpdate({
                target: users.ownerId,
                set: {
                    email: parsed.email,
                    displayName: parsed.displayName || ownerId,
                    preferences: { ...prevPrefs, avatarUrl: parsed.avatarUrl || '', bio: parsed.bio || '' },
                    updatedAt: new Date(),
                },
            })

        return res.status(200).json({ success: true })
    }

    return res.status(405).json({ error: 'Method not allowed' })
})
