import { NextApiRequest, NextApiResponse, NextApiHandler } from 'next'
import jwt from 'jsonwebtoken'
import axios from 'axios'

const PUBLIC_KEY = process.env.IDM_PUBLIC_KEY?.replace(/\n/g, '\n') || ''
const HAS_PUBLIC_KEY = !!(PUBLIC_KEY && PUBLIC_KEY.trim())

const USER_INFO_URL = process.env.IDM_USER_INFO_URL || 'http://localhost:8080/api/users'

export interface AuthenticatedRequest extends NextApiRequest {
  user?: any
}

export function withSession(handler: NextApiHandler) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    const token = req.cookies.token
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' })
    }

    try {
      if (HAS_PUBLIC_KEY) {
        const decoded = jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] }) as any
        req.user = decoded
        return handler(req, res)
      }
      throw new Error('NO_PUBLIC_KEY')
    } catch {
      // Fallback: decode without verify so we can read client_id/authorities
      const decoded = jwt.decode(token) as any
      if (decoded && (!decoded.exp || decoded.exp * 1000 > Date.now())) {
        // Your token looks like: { client_id, authorities, exp, ... }
        req.user = {
          client_id: decoded.client_id,
          authorities: decoded.authorities,
          exp: decoded.exp,
          ...decoded,
        }
        return handler(req, res)
      }
      return res.status(401).json({ error: 'Unauthorized' })
    }

    return handler(req, res)
  }
}