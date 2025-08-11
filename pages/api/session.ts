import { NextApiRequest, NextApiResponse } from 'next'
import { parse } from 'cookie'
import jwt from 'jsonwebtoken'

const PUBLIC_KEY = process.env.IDM_PUBLIC_KEY?.replace(/\n/g, '\n') || ''

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const cookies = req.headers.cookie ? parse(req.headers.cookie) : {}
    const token = cookies['token']

    if (!token) {
        return res.status(401).json({ user: null })
    }

    try {
        const decoded = jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] }) as { [key: string]: any }

        const user = {
            username: decoded?.client_id,
            email: decoded?.email,
            displayName: decoded?.client_id || decoded?.username || decoded?.user_name,
        }

        return res.status(200).json({ user })
    } catch (error) {
        if (error instanceof jwt.TokenExpiredError || error instanceof jwt.JsonWebTokenError) {
            return res.status(401).json({ user: null })
        }
        return res.status(401).json({ user: null })
    }
}
