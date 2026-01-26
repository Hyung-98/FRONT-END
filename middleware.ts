import { serverEnv } from '@/lib/config/env'
import { createServerClient } from '@supabase/ssr'
import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // 관리자 경로 보호
  if (pathname.startsWith('/admin')) {
    // 로그인 페이지는 제외
    if (pathname === '/admin/login') {
      return response
    }

    // 쿠키에서 세션 확인
    const supabaseUrl = serverEnv.supabaseUrl
    const supabaseAnonKey = serverEnv.supabaseAnonKey

    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll().map(cookie => ({
            name: cookie.name,
            value: cookie.value,
          }))
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
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
        getAll() {
          return request.cookies.getAll().map(cookie => ({
            name: cookie.name,
            value: cookie.value,
          }))
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            request.cookies.set(name, value)
            response.cookies.set(name, value, options)
          })
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

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/api/rest/posts/:path*'],
}
