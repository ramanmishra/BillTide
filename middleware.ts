// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

const PUBLIC_KEY = process.env.IDM_PUBLIC_KEY?.replace(/\n/g, '\n') || ''

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl
    const token = req.cookies.get('token')?.value

    const isAuthPage = pathname === '/login' || pathname === '/signup'
    const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/settings')
    const needsAuthCheck = isAuthPage || isProtected

    let tokenValid = false
    if (token && needsAuthCheck && PUBLIC_KEY) {
        try {
            jwt.verify(token, PUBLIC_KEY, { algorithms: ['RS256'] })
            tokenValid = true
        } catch {
            tokenValid = false
        }
    }

    // Invalid or missing token → block protected routes
    if (!tokenValid && isProtected) {
        const url = req.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Valid token → keep auth pages inaccessible
    if (tokenValid && isAuthPage) {
        const url = req.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*', '/settings/:path*', '/login', '/signup'],
}
