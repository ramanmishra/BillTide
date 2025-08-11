import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import { db } from '../../lib/db/client'
import { users } from '../../lib/db/schema'

const DEFAULT_GROUP_ID = 'cd4ebe96-389d-40c4-9ebf-aac5608d1b40'
const IDM_BASE_URL = process.env.IDM_BASE_URL || 'http://localhost:8080'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' })
    }

    const { displayName, email, password, firstName, lastName } = req.body

    if (!displayName || !password || !firstName || !lastName || !email) {
        return res.status(400).json({ error: 'Missing required fields' })
    }

    try {
        await axios.post(`${IDM_BASE_URL}/api/groups/${DEFAULT_GROUP_ID}/users`, {
            kind: 'PERSONAL',
            displayName: displayName,
            firstName,
            lastName,
            email,
            secret: {
                kind: 'PASSWORD',
                name: displayName,
                secret: password,
                email
            },
            roles: []
        })

        res.status(201).json({ success: true })
        await db
            .insert(users)
            .values({ ownerId: displayName, email, displayName: displayName })
            .onConflictDoUpdate({
                target: users.ownerId,
                set: { email, displayName: displayName, updatedAt: new Date() },
            })
    } catch (err: any) {
        console.error('Signup error:', err.response?.data || err.message)
        console.log(`${err.message}`)
        if (err.message.includes('status code 409')) {
            res.status(409).json({ error: 'username already exists!!' })
        }
        res.status(400).json({ error: 'Signup failed!!' })
    }
}