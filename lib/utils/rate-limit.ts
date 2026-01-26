/**
 * Rate Limiting 유틸리티
 * 간단한 메모리 기반 rate limiting (프로덕션에서는 Redis 등 사용 권장)
 */

interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

/**
 * Rate limit 체크
 * @param identifier - 요청 식별자 (IP 주소 등)
 * @param maxRequests - 최대 요청 수
 * @param windowMs - 시간 윈도우 (밀리초)
 * @returns rate limit 초과 여부
 */
export function checkRateLimit(
  identifier: string,
  maxRequests: number = 100,
  windowMs: number = 60000 // 1분
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const record = store[identifier]

  // 레코드가 없거나 시간 윈도우가 지난 경우
  if (!record || now > record.resetTime) {
    store[identifier] = {
      count: 1,
      resetTime: now + windowMs,
    }
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: now + windowMs,
    }
  }

  // 요청 수가 초과한 경우
  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: record.resetTime,
    }
  }

  // 요청 수 증가
  record.count++
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetTime: record.resetTime,
  }
}

/**
 * Rate limit 스토어 정리 (오래된 레코드 제거)
 */
export function cleanupRateLimitStore(): void {
  const now = Date.now()
  for (const [key, record] of Object.entries(store)) {
    if (now > record.resetTime) {
      delete store[key]
    }
  }
}

// 주기적으로 정리 (5분마다)
if (typeof setInterval !== 'undefined') {
  setInterval(cleanupRateLimitStore, 5 * 60 * 1000)
}
