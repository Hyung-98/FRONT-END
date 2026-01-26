import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { serverEnv } from '@/lib/config/env'
import type { CookieOptions } from '@/lib/types/cookies'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 관리자 경로 보호
  if (pathname.startsWith('/admin')) {
    // 로그인 페이지는 제외
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }

    // 쿠키에서 세션 확인
    const supabaseUrl = serverEnv.supabaseUrl
    const supabaseAnonKey = serverEnv.supabaseAnonKey

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options?: Partial<CookieOptions>) {
          request.cookies.set({ name, value, ...options })
        },
        remove(name: string, options?: Partial<CookieOptions>) {
          request.cookies.delete({ name, ...options })
        },
      },
    })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      const url = request.nextUrl.clone()
      url.pathname = '/admin/login'
      url.searchParams.set('redirect', pathname)
      return NextResponse.redirect(url)
    }
  }

  // API 라우트 보호
  if (
    pathname.startsWith('/api/rest/posts') &&
    (request.method === 'POST' || request.method === 'PUT' || request.method === 'DELETE')
  ) {
    const supabaseUrl = serverEnv.supabaseUrl
    const supabaseAnonKey = serverEnv.supabaseAnonKey

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options?: Partial<CookieOptions>) {
          request.cookies.set({ name, value, ...options })
        },
        remove(name: string, options?: Partial<CookieOptions>) {
          request.cookies.delete({ name, ...options })
        },
      },
    })

    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*', '/api/rest/posts/:path*'],
}
