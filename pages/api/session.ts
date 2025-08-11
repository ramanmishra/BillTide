import { NextApiRequest, NextApiResponse } from 'next'
import { parse } from 'cookie'
import jwt from 'jsonwebtoken'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const cookies = req.headers.cookie ? parse(req.headers.cookie) : {}
    const token = cookies['token']

    if (!token) {
        return res.status(401).json({ user: null })
    }

    try {
        const decoded = jwt.decode(token) as { [key: string]: any }

        const user = {
            username: decoded?.client_id,
            email: decoded?.email,
            displayName: decoded?.client_id || decoded?.username || decoded?.user_name,
        }

        return res.status(200).json({ user })
    } catch (error) {
        return res.status(401).json({ user: null })
    }
}
