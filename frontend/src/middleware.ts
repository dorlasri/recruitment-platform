import { NextResponse, type NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  const isProtected = path.startsWith('/my-applications') || path.startsWith('/profile')
  const isAuth = path.startsWith('/login') || path.startsWith('/register')
  const isAdminSync = path.startsWith('/admin-sync')

  if (isAdminSync) return NextResponse.next()

  // Check for Supabase session cookie — match only the active project
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
  const projectId = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] ?? ''
  const cookieName = projectId ? `sb-${projectId}-auth-token` : 'sb-auth-token'
  const hasSession = request.cookies.getAll().some(c =>
    c.name === cookieName && c.value.length > 10
  )

  if (isProtected && !hasSession) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  if (isAuth && hasSession) {
    return NextResponse.redirect(new URL('/jobs', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/).*)'],
}
