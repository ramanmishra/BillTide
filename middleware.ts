// middleware.ts
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
    const { pathname } = req.nextUrl
    const token = req.cookies.get('token')?.value

    const isAuthPage = pathname === '/login' || pathname === '/signup'
    const isProtected = pathname.startsWith('/dashboard') || pathname.startsWith('/settings')

    // Not logged in → block protected routes
    if (!token && isProtected) {
        const url = req.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // Logged in → keep auth pages inaccessible
    if (token && isAuthPage) {
        const url = req.nextUrl.clone()
        url.pathname = '/dashboard'
        return NextResponse.redirect(url)
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/dashboard/:path*', '/settings/:path*', '/login', '/signup'],
}
