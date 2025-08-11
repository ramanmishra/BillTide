import type { NextApiRequest, NextApiResponse } from 'next'
import * as cookieLib from 'cookie'

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    res.setHeader('Set-Cookie', cookieLib.serialize('token', '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: new Date(0),
        path: '/'
    }))

    res.status(200).json({ success: true })
}