import type { NextApiRequest, NextApiResponse } from 'next'
import axios from 'axios'
import * as cookieLib from 'cookie'

const IDM_TOKEN_URL = process.env.IDM_TOKEN_URL || 'http://localhost:8080/oauth/token'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'Missing username or password' })
  }

  try {
    const response = await axios.post(
      IDM_TOKEN_URL,
      new URLSearchParams({
        client_id: username,
        client_secret: password,
        grant_type: 'client_credentials'
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    )

    const { access_token, expires_in } = response.data

    // Use SameSite=Lax to help mitigate CSRF by not sending the cookie on
    // cross-site subrequests while allowing top-level navigation.
    res.setHeader('Set-Cookie', cookieLib.serialize('token', access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: expires_in,
      path: '/'
    }))

    res.status(200).json({ success: true })
  } catch (err: any) {
    console.error('Login error:', err.response?.data || err.message)
    res.status(401).json({ error: 'Invalid username or password' })
  }
}