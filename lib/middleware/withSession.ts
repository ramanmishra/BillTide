import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next'
import jwt from 'jsonwebtoken'

const PUBLIC_KEY = process.env.IDM_PUBLIC_KEY?.replace(/\\n/g, '\n') || ''
const HAS_PUBLIC_KEY = !!(PUBLIC_KEY && PUBLIC_KEY.trim())

export interface AuthenticatedRequest extends NextApiRequest {
  user?: any
}

export function withSession(handler: NextApiHandler) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const token = req.cookies.token
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    if (!HAS_PUBLIC_KEY) {
      console.error('No public key available for JWT verification')
      return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
      const decoded = jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] }) as any
      req.user = decoded
      return handler(req, res)
    } catch (err) {
      console.error('JWT verification failed:', err)
      return res.status(401).json({ error: 'Unauthorized' })
    }
  }
}
