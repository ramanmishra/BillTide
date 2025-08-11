import type { NextApiRequest, NextApiResponse } from 'next'
import { db } from '../../../lib/db/client'
import { subscriptions } from '../../../lib/db/schema'
import { eq, sql } from 'drizzle-orm'
import { getEmailProvider } from '../../../lib/email'
import { upcomingSubject, upcomingHtml } from '../../../lib/email/templates/upcoming'
import { users } from '../../../lib/db/schema'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

    const secret = req.headers['x-cron-secret']
    if (!secret || secret !== process.env.CRON_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' })
    }

    const days = Math.max(1, Math.min(60, Number(req.query.days ?? 7)))

    // Pull all due items; if your dataset grows, page per ownerId
    const rows = await db
        .select()
        .from(subscriptions)
        .where(
            // nextChargeDate stored as ISO yyyy-mm-dd; compare against CURRENT_DATE + days
            sql`to_date(${subscriptions.nextChargeDate}, 'YYYY-MM-DD') 
          <= (CURRENT_DATE + ${days} * INTERVAL '1 day')`
        )
        .orderBy(sql`to_date(${subscriptions.nextChargeDate}, 'YYYY-MM-DD') asc`)

    // Group by ownerId
    const byOwner = new Map<string, any[]>()
    for (const r of rows) {
        const k = r.ownerId
        if (!byOwner.has(k)) byOwner.set(k, [])
        byOwner.get(k)!.push(r)
    }

    const provider = getEmailProvider()
    let sent = 0

    for (const [ownerId, items] of Array.from(byOwner.entries())) {
        const prefRow = await db.select().from(users).where(eq(users.ownerId, ownerId)).limit(1)
        const prefs = prefRow[0]?.preferences || {}
        if (prefs.remindersEnabled === false) continue

        const to = prefRow[0]?.email || null
        if (!to) continue

        const effectiveDays = Number(prefs.reminderDays ?? days)
        // (optional) you can re-filter items by effectiveDays if you want per-user window
        try {
            await provider.send({
                to,
                subject: upcomingSubject(effectiveDays),
                html: upcomingHtml(ownerId, items, effectiveDays),
            })
            sent++
        } catch (err) {
            console.error(`Failed to send reminder for ${ownerId}`, err)
        }
    }

    return res.status(200).json({ ownersEmailed: sent, itemsConsidered: rows.length })
}
