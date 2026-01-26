/**
 * 환경 변수 중앙 관리
 * 빌드 타임에 환경 변수 검증 및 타입 안전한 접근 제공
 */

interface EnvConfig {
  // Supabase
  supabaseUrl: string
  supabaseAnonKey: string
  supabaseServiceRoleKey: string

  // Next.js Public
  nextPublicSiteUrl?: string
}

/**
 * 서버 사이드 환경 변수
 */
function getServerEnv(): Omit<EnvConfig, 'nextPublicSiteUrl'> {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabaseServiceRoleKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl) {
    throw new Error('Missing required environment variable: SUPABASE_URL')
  }

  if (!supabaseAnonKey) {
    throw new Error('Missing required environment variable: SUPABASE_ANON_KEY')
  }

  if (!supabaseServiceRoleKey) {
    throw new Error('Missing required environment variable: SUPABASE_SERVICE_ROLE_KEY')
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    supabaseServiceRoleKey,
  }
}

/**
 * 클라이언트 사이드 환경 변수
 */
function getClientEnv(): Pick<EnvConfig, 'supabaseUrl' | 'supabaseAnonKey' | 'nextPublicSiteUrl'> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  const nextPublicSiteUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (!supabaseUrl) {
    throw new Error(
      'Missing required environment variable: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_URL'
    )
  }

  if (!supabaseAnonKey) {
    throw new Error(
      'Missing required environment variable: NEXT_PUBLIC_SUPABASE_ANON_KEY or SUPABASE_ANON_KEY'
    )
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    nextPublicSiteUrl,
  }
}

/**
 * 서버 사이드 환경 변수 (빌드 타임 검증)
 */
export const serverEnv = getServerEnv()

/**
 * 클라이언트 사이드 환경 변수 (런타임 검증)
 */
export function getClientEnvConfig() {
  return getClientEnv()
}

/**
 * 환경 변수 검증 (빌드 타임)
 * Next.js 빌드 시 자동으로 호출되어 누락된 환경 변수를 감지
 */
if (typeof window === 'undefined') {
  // 서버 사이드에서만 실행
  try {
    getServerEnv()
  } catch (error) {
    console.error('Environment variable validation failed:', error)
    // 빌드 타임에 에러를 발생시켜 배포를 방지
    if (process.env.NODE_ENV === 'production') {
      throw error
    }
  }
}
